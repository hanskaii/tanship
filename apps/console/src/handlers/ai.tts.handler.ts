import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

const TtsSchema = z.object({
	text: z.string().min(1).max(5000),
	voice: z
		.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
		.default("alloy"),
	model: z.enum(["tts-1", "tts-1-hd"]).default("tts-1"),
	speed: z.number().min(0.25).max(4.0).default(1.0)
});

const handler = new Hono<HonoEnv>().post(
	"/",
	zValidator("json", TtsSchema),
	async (c) => {
		const { text, voice, model, speed } = c.req.valid("json");

		const apiKey = c.env.ELEVENLABS_API_KEY;
		if (!apiKey) {
			throw ApiError.server(
				"TTS service not configured (ELEVENLABS_API_KEY missing)"
			);
		}

		const voiceIds: Record<string, string> = {
			alloy: "fS1AVGMmOG2TZEnADlMJ",
			echo: "wVIhEDsPylOlWTqCMRVe",
			fable: "TZxjUqMfvYI4t6lOZEwh",
			onyx: "ODq5ZpIpwWbxJRAKfTjB",
			nova: "NsDyIuUlKzk0HMOdCPGx",
			shimmer: "a4XkRxZGEGzgRVNljNXu"
		};

		const res = await fetch(
			`https://api.elevenlabs.io/v1/text-to-speech/${voiceIds[voice] || voiceIds.alloy}`,
			{
				method: "POST",
				headers: {
					"xi-api-key": apiKey,
					"Content-Type": "application/json",
					Accept: "audio/mpeg"
				},
				body: JSON.stringify({
					text,
					model_id: model,
					voice_settings: {
						stability: 0.5,
						similarity_boost: 0.75,
						style: 0.0,
						use_speaker_boost: true,
						speed
					}
				}),
				signal: AbortSignal.timeout(30_000)
			}
		);

		if (!res.ok) {
			const err = await res.text().catch(() => "unknown");
			throw ApiError.badGateway(
				`ElevenLabs API error ${res.status}: ${err}`
			);
		}

		const audioBuffer = await res.arrayBuffer();
		const base64 = btoa(
			String.fromCharCode(...new Uint8Array(audioBuffer))
		);
		const durationSec = (audioBuffer.byteLength / (22050 * 2)).toFixed(1);

		return c.json(
			{
				success: true,
				data: {
					audio: `data:audio/mpeg;base64,${base64}`,
					duration_seconds: parseFloat(durationSec),
					size_bytes: audioBuffer.byteLength,
					voice,
					model,
					speed,
					text_length: text.length
				}
			},
			200,
			{
				"Content-Type": "application/json",
				"X-Audio-Duration": durationSec,
				"X-Audio-Size": String(audioBuffer.byteLength)
			} as any
		);
	}
);

export default handler;
