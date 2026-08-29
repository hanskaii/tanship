import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { ApiResponse } from "@/helpers/response.helper";
import type { HonoEnv } from "@/types/hono.types";
import { STATUS_CODES } from "@/constants/status.constants";

const ChannelNameSchema = z.object({
	channel: z.string().min(1).max(256)
});

const PublishSchema = z.object({
	channel: z.string().min(1).max(256),
	message: z.string().min(1).max(65536)
});

const SubscribeSchema = z.object({
	channel: z.string().min(1).max(256),
	connectionId: z.string().min(1).max(256)
});

/** Single DO name for all pub/sub — routes by channel internally. */
const PUBSUB_DO_NAME = "global";

const durablePubsubHandler = new Hono<HonoEnv>()
	// Create / ensure a channel exists
	.post("/channel", zValidator("json", ChannelNameSchema), async (c) => {
		const { channel } = c.req.valid("json");
		const id = c.env.PUBSUB.idFromName(PUBSUB_DO_NAME);
		const stub = c.env.PUBSUB.get(id);
		const result = await stub.createChannel(channel);
		return ApiResponse.ok(c, "Channel created", result);
	})

	// Publish a message to a channel
	.post("/publish", zValidator("json", PublishSchema), async (c) => {
		const { channel, message } = c.req.valid("json");
		const id = c.env.PUBSUB.idFromName(PUBSUB_DO_NAME);
		const stub = c.env.PUBSUB.get(id);
		const result = await stub.publish(channel, message);
		return ApiResponse.ok(c, "Message published", result);
	})

	// Subscribe a connection to a channel (tracks the connection in DO state)
	.post("/subscribe", zValidator("json", SubscribeSchema), async (c) => {
		const { channel, connectionId } = c.req.valid("json");
		const id = c.env.PUBSUB.idFromName(PUBSUB_DO_NAME);
		const stub = c.env.PUBSUB.get(id);
		const result = await stub.subscribe(channel, connectionId);
		if (!result.success) {
			return ApiResponse.error(
				c,
				`Channel "${channel}" not found`,
				STATUS_CODES.NOT_FOUND
			);
		}
		return ApiResponse.ok(c, "Subscribed to channel", result);
	})

	// Unsubscribe a connection from a channel
	.post("/unsubscribe", zValidator("json", SubscribeSchema), async (c) => {
		const { channel, connectionId } = c.req.valid("json");
		const id = c.env.PUBSUB.idFromName(PUBSUB_DO_NAME);
		const stub = c.env.PUBSUB.get(id);
		const result = await stub.unsubscribe(channel, connectionId);
		return ApiResponse.ok(c, "Unsubscribed from channel", result);
	})

	// List all channels
	.get("/channels", async (c) => {
		const id = c.env.PUBSUB.idFromName(PUBSUB_DO_NAME);
		const stub = c.env.PUBSUB.get(id);
		const channels = await stub.listChannels();
		return ApiResponse.ok(c, "Channels listed", { channels });
	})

	// Delete a channel
	.delete("/channel", zValidator("json", ChannelNameSchema), async (c) => {
		const { channel } = c.req.valid("json");
		const id = c.env.PUBSUB.idFromName(PUBSUB_DO_NAME);
		const stub = c.env.PUBSUB.get(id);
		const result = await stub.deleteChannel(channel);
		if (!result.deleted) {
			return ApiResponse.error(
				c,
				`Channel "${channel}" not found`,
				STATUS_CODES.NOT_FOUND
			);
		}
		return ApiResponse.ok(c, "Channel deleted", result);
	});

export default durablePubsubHandler;
