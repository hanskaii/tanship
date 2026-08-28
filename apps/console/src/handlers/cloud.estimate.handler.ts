import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";

/**
 * Cloudflare cost estimator.
 * Uses pricing data verified from developers.cloudflare.com on 2026-08-27.
 * Cost floor excludes free tiers — call volumes above free tier thresholds incur
 * the per-unit rate. Workers free tier: 10M req/mo; CPU: 30M CPU-ms/mo.
 * Workers AI free tier: 10K neurons/day.
 */
interface PricingRates {
	workers: { request: number; cpuMs: number };
	workersAi: { per1kNeurons: number };
	d1: { rowReads: number; rowWrites: number; storageGbMo: number };
	vectorize: { queriedDims: number; storedDims: number };
	kv: { reads: number; writes: number; storageGbMo: number };
	r2: { storageGbMo: number; classA: number; classB: number; egress: number };
	do: { requests: number; computeGbS: number };
	browserRun: { browserHr: number; concurrent: number };
}

const RATES: PricingRates = {
	workers: { request: 0.3, cpuMs: 0.02 },
	workersAi: { per1kNeurons: 0.011 },
	d1: { rowReads: 0.001, rowWrites: 1.0, storageGbMo: 0.75 },
	vectorize: { queriedDims: 0.01, storedDims: 0.05 },
	kv: { reads: 0.5, writes: 5.0, storageGbMo: 0.5 },
	r2: { storageGbMo: 0.015, classA: 4.5, classB: 0.36, egress: 0 },
	browserRun: { browserHr: 0.09, concurrent: 2.0 },
	do: { requests: 0.15, computeGbS: 12.5 }
};

const FREE = {
	workers: { requests: 10_000_000, cpuMs: 30_000_000 },
	workersAi: { neuronsPerDay: 10_000 },
	d1: { rowReads: 25_000_000_000, rowWrites: 50_000_000, storageGb: 5 },
	vectorize: { queriedDims: 50_000_000, storedDims: 10_000_000 },
	kv: { reads: 10_000_000, writes: 1_000_000, storageGb: 1 },
	r2: { storageGb: 10, classA: 1_000_000, classB: 10_000_000, egressGb: 0 },
	do: { requests: 1_000_000, computeGbS: 400_000 },
	browserRun: { browserHr: 10 }
};

// per 1M units
function paidUnits(free: number, used: number): number {
	return Math.max(0, used - free);
}

function estimateWorkers(reqs: number, cpuMs: number): number {
	const reqCost =
		paidUnits(FREE.workers.requests, reqs) *
		(RATES.workers.request / 1_000_000);
	const cpuCost =
		paidUnits(FREE.workers.cpuMs, cpuMs) *
		(RATES.workers.cpuMs / 1_000_000);
	return reqCost + cpuCost;
}

function estimateWorkersAi(neuronsPerDay: number, daysMo = 30): number {
	const moNeurons = neuronsPerDay * daysMo;
	return (
		paidUnits(FREE.workersAi.neuronsPerDay * daysMo, moNeurons) *
		(RATES.workersAi.per1kNeurons / 1_000)
	);
}

function estimateD1(
	rowReads: number,
	rowWrites: number,
	storageGb: number
): number {
	const readCost =
		paidUnits(FREE.d1.rowReads, rowReads) * (RATES.d1.rowReads / 1_000_000);
	const writeCost =
		paidUnits(FREE.d1.rowWrites, rowWrites) *
		(RATES.d1.rowWrites / 1_000_000);
	const storageCost =
		Math.max(0, storageGb - FREE.d1.storageGb) * RATES.d1.storageGbMo;
	return readCost + writeCost + storageCost;
}

function estimateVectorize(queriedDims: number, storedDims: number): number {
	const queryCost =
		paidUnits(FREE.vectorize.queriedDims, queriedDims) *
		(RATES.vectorize.queriedDims / 1_000_000);
	const storageCost =
		paidUnits(FREE.vectorize.storedDims, storedDims) *
		(RATES.vectorize.storedDims / 100_000_000);
	return queryCost + storageCost;
}

function estimateKV(
	kvReads: number,
	kvWrites: number,
	storageGb: number
): number {
	const readCost =
		paidUnits(FREE.kv.reads, kvReads) * (RATES.kv.reads / 1_000_000);
	const writeCost =
		paidUnits(FREE.kv.writes, kvWrites) * (RATES.kv.writes / 1_000_000);
	const storageCost =
		Math.max(0, storageGb - FREE.kv.storageGb) * RATES.kv.storageGbMo;
	return readCost + writeCost + storageCost;
}

function estimateR2(storageGb: number, classA: number, classB: number): number {
	const storageCost =
		Math.max(0, storageGb - FREE.r2.storageGb) * RATES.r2.storageGbMo;
	const classACost =
		paidUnits(FREE.r2.classA, classA) * (RATES.r2.classA / 1_000_000);
	const classBCost =
		paidUnits(FREE.r2.classB, classB) * (RATES.r2.classB / 1_000_000);
	return storageCost + classACost + classBCost;
}

function estimateDO(doRequests: number, computeGbS: number): number {
	const reqCost =
		paidUnits(FREE.do.requests, doRequests) *
		(RATES.do.requests / 1_000_000);
	const computeCost =
		paidUnits(FREE.do.computeGbS, computeGbS) *
		(RATES.do.computeGbS / 1_000_000);
	return reqCost + computeCost;
}

function estimateBrowserRun(browserHours: number): number {
	return (
		Math.max(0, browserHours - FREE.browserRun.browserHr) *
		RATES.browserRun.browserHr
	);
}

const EstimateSchema = z.object({
	workers: z
		.object({
			requestsPerMonth: z.number().int().min(0).default(0),
			cpuMsPerMonth: z.number().int().min(0).default(0)
		})
		.optional(),
	workersAi: z
		.object({ neuronsPerDay: z.number().int().min(0).default(0) })
		.optional(),
	d1: z
		.object({
			rowReadsPerMonth: z.number().int().min(0).default(0),
			rowWritesPerMonth: z.number().int().min(0).default(0),
			storageGb: z.number().min(0).default(0)
		})
		.optional(),
	vectorize: z
		.object({
			queriedDimsPerMonth: z.number().int().min(0).default(0),
			storedDims: z.number().int().min(0).default(0)
		})
		.optional(),
	kv: z
		.object({
			readsPerMonth: z.number().int().min(0).default(0),
			writesPerMonth: z.number().int().min(0).default(0),
			storageGb: z.number().min(0).default(0)
		})
		.optional(),
	r2: z
		.object({
			storageGb: z.number().min(0).default(0),
			classAOpsPerMonth: z.number().int().min(0).default(0),
			classBOpsPerMonth: z.number().int().min(0).default(0)
		})
		.optional(),
	durableObjects: z
		.object({
			requestsPerMonth: z.number().int().min(0).default(0),
			computeGbSPerMonth: z.number().int().min(0).default(0)
		})
		.optional(),
	browserRun: z
		.object({ browserHoursPerMonth: z.number().min(0).default(0) })
		.optional()
});

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", EstimateSchema),
	async (c) => {
		const body = c.req.valid("json");

		const breakdown: Record<string, number> = {};
		let total = 0;

		if (body.workers) {
			const cost = estimateWorkers(
				body.workers.requestsPerMonth,
				body.workers.cpuMsPerMonth
			);
			breakdown.workers = cost;
			total += cost;
		}
		if (body.workersAi) {
			const cost = estimateWorkersAi(body.workersAi.neuronsPerDay);
			breakdown.workersAi = cost;
			total += cost;
		}
		if (body.d1) {
			const cost = estimateD1(
				body.d1.rowReadsPerMonth,
				body.d1.rowWritesPerMonth,
				body.d1.storageGb
			);
			breakdown.d1 = cost;
			total += cost;
		}
		if (body.vectorize) {
			const cost = estimateVectorize(
				body.vectorize.queriedDimsPerMonth,
				body.vectorize.storedDims
			);
			breakdown.vectorize = cost;
			total += cost;
		}
		if (body.kv) {
			const cost = estimateKV(
				body.kv.readsPerMonth,
				body.kv.writesPerMonth,
				body.kv.storageGb
			);
			breakdown.kv = cost;
			total += cost;
		}
		if (body.r2) {
			const cost = estimateR2(
				body.r2.storageGb,
				body.r2.classAOpsPerMonth,
				body.r2.classBOpsPerMonth
			);
			breakdown.r2 = cost;
			total += cost;
		}
		if (body.durableObjects) {
			const cost = estimateDO(
				body.durableObjects.requestsPerMonth,
				body.durableObjects.computeGbSPerMonth
			);
			breakdown.durableObjects = cost;
			total += cost;
		}
		if (body.browserRun) {
			const cost = estimateBrowserRun(
				body.browserRun.browserHoursPerMonth
			);
			breakdown.browserRun = cost;
			total += cost;
		}

		// Show 0 breakdown when nothing is passed
		const breakdownKeys = [
			"workers",
			"workersAi",
			"d1",
			"vectorize",
			"kv",
			"r2",
			"durableObjects",
			"browserRun"
		];
		const hasAnyInput = breakdownKeys.some(
			(k) => body[k as keyof typeof body]
		);
		if (!hasAnyInput) {
			breakdown.workers = 0;
			breakdown.workersAi = 0;
			breakdown.d1 = 0;
			breakdown.vectorize = 0;
			breakdown.kv = 0;
			breakdown.r2 = 0;
			breakdown.durableObjects = 0;
			breakdown.browserRun = 0;
		}

		return ApiResponse.ok(c, "Cloudflare cost estimate", {
			monthlyUsd: +total.toFixed(4),
			breakdown: Object.fromEntries(
				Object.entries(breakdown).map(([k, v]) => [k, +v.toFixed(4)])
			),
			currency: "USD",
			pricingDate: "2026-08-27",
			source: "developers.cloudflare.com"
		});
	}
);

export default handler;
