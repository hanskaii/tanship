import { DurableObject } from "cloudflare:workers";

// ponytail: max jobs per scheduler = 500; increase when pagination lands
const MAX_JOBS = 500;
const IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface Job {
	id: string;
	url: string;
	method: "GET" | "POST" | "PUT";
	headers?: Record<string, string>;
	payload?: unknown;
	dueAt: number; // unix ms
	/** When set, the job is recurring and re-arms to the next slot after firing. */
	cron?: string;
	createdAt: number;
	status: "scheduled" | "fired" | "failed";
	fireCount: number;
	lastError?: string;
}

interface SchedulerState {
	jobs: Record<string, Job>;
	nextAlarmMs: number | null;
}

export interface SchedulerEnv {
	SCHEDULER: DurableObjectNamespace<Scheduler>;
}

export class Scheduler extends DurableObject {
	private async load(): Promise<SchedulerState> {
		return (
			(await this.ctx.storage.get<SchedulerState>("state")) ?? {
				jobs: {},
				nextAlarmMs: null
			}
		);
	}

	private async save(state: SchedulerState): Promise<void> {
		await this.ctx.storage.put("state", state);
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	/**
	 * Schedule a one-off HTTP job to fire at `dueAt`.
	 * The Durable Object alarm fires at the earliest due job;
	 * `alarm()` dispatches it and reschedules for the next.
	 */
	async schedule(
		job: Omit<Job, "createdAt" | "status" | "fireCount">
	): Promise<Job> {
		const state = await this.load();

		if (Object.keys(state.jobs).length >= MAX_JOBS) {
			throw new Error(`Scheduler at capacity (${MAX_JOBS} jobs max)`);
		}

		const full: Job = {
			...job,
			createdAt: Date.now(),
			status: "scheduled",
			fireCount: 0
		};
		state.jobs[full.id] = full;

		// Update next alarm if this job is sooner
		const earliest = Math.min(
			...Object.values(state.jobs)
				.filter((j) => j.status === "scheduled")
				.map((j) => j.dueAt),
			Infinity
		);
		state.nextAlarmMs = isFinite(earliest) ? earliest : null;

		await this.save(state);
		if (state.nextAlarmMs !== null) {
			await this.ctx.storage.setAlarm(state.nextAlarmMs);
		}
		return full;
	}

	/** Return all jobs in this scheduler, sorted by dueAt ascending. */
	async list(): Promise<Job[]> {
		const state = await this.load();
		return Object.values(state.jobs).sort((a, b) => a.dueAt - b.dueAt);
	}

	/** Return a single job by id. */
	async get(id: string): Promise<Job | null> {
		const state = await this.load();
		return state.jobs[id] ?? null;
	}

	/** Remove a scheduled (or failed) job. Returns true if the job existed. */
	async cancel(id: string): Promise<boolean> {
		const state = await this.load();
		if (!state.jobs[id]) return false;

		delete state.jobs[id];

		const remaining = Object.values(state.jobs).filter(
			(j) => j.status === "scheduled"
		);
		state.nextAlarmMs =
			remaining.length > 0
				? Math.min(...remaining.map((j) => j.dueAt))
				: null;

		await this.save(state);
		if (state.nextAlarmMs !== null) {
			await this.ctx.storage.setAlarm(state.nextAlarmMs);
		}
		return true;
	}

	/** Fired by the runtime at the nextAlarmMs. Picks all due jobs and dispatches. */
	async alarm(): Promise<void> {
		const state = await this.load();
		const now = Date.now();

		const due = Object.values(state.jobs).filter(
			(j) => j.status === "scheduled" && j.dueAt <= now
		);

		// Fire all due jobs concurrently
		await Promise.allSettled(
			due.map(async (job) => {
				try {
					await this.ctx.waitUntil(this.fireJob(job));
					job.fireCount += 1;
					if (job.cron) {
						// Re-arm recurring job to the next matching slot.
						// If we cannot compute the next slot, fail loudly.
						const next = nextCronRun(job.cron, now);
						if (next === null) {
							job.status = "failed";
							job.lastError = `Invalid cron expression: ${job.cron}`;
						} else {
							job.status = "scheduled";
							job.dueAt = next;
						}
					} else {
						job.status = "fired";
					}
				} catch (err: unknown) {
					job.status = "failed";
					job.fireCount += 1;
					job.lastError =
						err instanceof Error ? err.message : String(err);
					console.error(`[scheduler] job ${job.id} failed:`, err);
				}
			})
		);

		// Prune fired (one-off) jobs. Recurring jobs stay in the map with a fresh dueAt.
		for (const job of due) {
			if (job.status === "fired") {
				delete state.jobs[job.id];
			}
		}

		// Schedule next alarm
		const remaining = Object.values(state.jobs).filter(
			(j) => j.status === "scheduled"
		);
		state.nextAlarmMs =
			remaining.length > 0
				? Math.min(...remaining.map((j) => j.dueAt))
				: null;

		await this.save(state);
		if (state.nextAlarmMs !== null) {
			await this.ctx.storage.setAlarm(state.nextAlarmMs);
		}
	}

	/**
	 * Schedule a recurring cron job. Returns the job plus the first dueAt.
	 * Standard 5-field cron: minute hour day-of-month month day-of-week.
	 * Wildcards, single values, and step expressions are supported.
	 */
	async scheduleRecurring(
		job: Pick<Job, "id" | "url" | "method" | "headers" | "payload"> & {
			cron: string;
			startAt?: number;
		}
	): Promise<Job & { nextRunAt: number }> {
		const state = await this.load();

		if (Object.keys(state.jobs).length >= MAX_JOBS) {
			throw new Error(`Scheduler at capacity (${MAX_JOBS} jobs max)`);
		}

		const start = job.startAt ?? Date.now();
		const next = nextCronRun(job.cron, start - 1);
		if (next === null) {
			throw new Error(`Invalid cron expression: ${job.cron}`);
		}

		const full: Job = {
			id: job.id,
			url: job.url,
			method: job.method,
			headers: job.headers,
			payload: job.payload,
			dueAt: next,
			cron: job.cron,
			createdAt: Date.now(),
			status: "scheduled",
			fireCount: 0
		};
		state.jobs[full.id] = full;

		const earliest = Math.min(
			...Object.values(state.jobs)
				.filter((j) => j.status === "scheduled")
				.map((j) => j.dueAt),
			Infinity
		);
		state.nextAlarmMs = isFinite(earliest) ? earliest : null;

		await this.save(state);
		if (state.nextAlarmMs !== null) {
			await this.ctx.storage.setAlarm(state.nextAlarmMs);
		}
		return { ...full, nextRunAt: next };
	}

	private async fireJob(job: Job): Promise<void> {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			"User-Agent": "TanshipScheduler/1.0",
			...job.headers
		};

		await fetch(job.url, {
			method: job.method,
			headers,
			body:
				job.method === "GET"
					? undefined
					: JSON.stringify(job.payload ?? null)
		});
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async onIdle(): Promise<void> {
		await this.ctx.storage.deleteAll();
	}
}

/**
 * Compute the next unix-ms timestamp matching a 5-field cron expression,
 * strictly after `from` (i.e. nextCronRun(expr, t) > t).
 *
 * Supported syntax per field: wildcard, literal n, or step (star-slash-n).
 * Returns null when malformed or no slot within 4 years.
 */
function nextCronRun(expr: string, from: number): number | null {
	const parts = expr.trim().split(/\s+/);
	if (parts.length !== 5) return null;

	const [minSpec, hourSpec, domSpec, monSpec, dowSpec] = parts;
	const mins = parseField(minSpec, 0, 59);
	const hours = parseField(hourSpec, 0, 23);
	const doms = parseField(domSpec, 1, 31);
	const mons = parseField(monSpec, 1, 12);
	// JS getDay: 0=Sun..6=Sat. Cron: 0=Sun..6=Sat too, but allow 7 as Sun alias.
	const dows = parseField(dowSpec, 0, 7).map((d) => (d === 7 ? 0 : d));
	if (![mins, hours, doms, mons, dows].every((s) => s.length > 0)) {
		return null;
	}
	const domStar = domSpec === "*";
	const dowStar = dowSpec === "*";

	const start = new Date(from);
	start.setUTCSeconds(0, 0);
	// Begin from the next minute
	start.setUTCMinutes(start.getUTCMinutes() + 1);

	// Search window: 4 years (covers leap years, day-of-month rollovers).
	const end = from + 4 * 365 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;
	const cursor = new Date(start.getTime());

	while (cursor.getTime() <= end) {
		const m = cursor.getUTCMonth() + 1;
		if (!mons.includes(m)) {
			// Jump to the 1st of the next month
			cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1);
			cursor.setUTCHours(0, 0, 0, 0);
			continue;
		}
		const day = cursor.getUTCDate();
		const dow = cursor.getUTCDay();
		// Vixie cron: if both DOM and DOW are restricted (not *), the day must
		// match BOTH. If only one is restricted, that one decides.
		const bothRestricted = !domStar && !dowStar;
		const matches = bothRestricted
			? doms.includes(day) && dows.includes(dow)
			: domStar
				? dows.includes(dow)
				: doms.includes(day);
		if (!matches) {
			cursor.setUTCDate(cursor.getUTCDate() + 1);
			cursor.setUTCHours(0, 0, 0, 0);
			continue;
		}
		const h = cursor.getUTCHours();
		if (!hours.includes(h)) {
			cursor.setUTCHours(cursor.getUTCHours() + 1, 0, 0, 0);
			continue;
		}
		const mn = cursor.getUTCMinutes();
		if (!mins.includes(mn)) {
			cursor.setUTCMinutes(cursor.getUTCMinutes() + 1, 0, 0);
			continue;
		}
		return cursor.getTime();
	}
	return null;
}

function parseField(spec: string, min: number, max: number): number[] {
	const out = new Set<number>();
	for (const part of spec.split(",")) {
		const trimmed = part.trim();
		if (!trimmed) return [];
		if (trimmed === "*") {
			for (let i = min; i <= max; i++) out.add(i);
			continue;
		}
		const stepMatch = trimmed.match(/^\*\/(\d+)$/);
		if (stepMatch) {
			const step = parseInt(stepMatch[1], 10);
			if (step <= 0) return [];
			for (let i = min; i <= max; i += step) out.add(i);
			continue;
		}
		const n = parseInt(trimmed, 10);
		if (Number.isNaN(n) || n < min || n > max) return [];
		out.add(n);
	}
	return [...out].sort((a, b) => a - b);
}
