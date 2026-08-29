import { DurableObject } from "cloudflare:workers";

const IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface Subscriber {
	id: string;
	connectedAt: number;
}

interface ChannelState {
	subscribers: Map<string, Subscriber>;
	createdAt: number;
}

interface PubSubState {
	channels: Record<string, ChannelState>;
}

/**
 * PubSub Durable Object — fan-out pub/sub over WebSocket.
 * Each "topic" is a named channel within the DO.
 * Clients connect via HTTP subscribe/publish (paid via x402) and optionally
 * upgrade to WebSocket for real-time delivery.
 */
export class PubSub extends DurableObject {
	private state: PubSubState = { channels: {} };

	private async load(): Promise<PubSubState> {
		const s = await this.ctx.storage.get<PubSubState>("state");
		if (!s) {
			this.state = { channels: {} };
			return this.state;
		}
		this.state = s;
		return s;
	}

	private async save(): Promise<void> {
		await this.ctx.storage.put("state", this.state);
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	/** Create a named channel. Idempotent — returns existing if already present. */
	async createChannel(
		name: string
	): Promise<{ channel: string; created: boolean }> {
		const s = await this.load();
		const alreadyExists = !!s.channels[name];
		if (!alreadyExists) {
			s.channels[name] = {
				subscribers: new Map(),
				createdAt: Date.now()
			};
		}
		await this.save();
		return { channel: name, created: !alreadyExists };
	}

	/** Subscribe a connection id to a channel. */
	async subscribe(
		channel: string,
		connectionId: string
	): Promise<{
		success: boolean;
		channel: string;
		subscriberCount: number;
	}> {
		const s = await this.load();
		const ch = s.channels[channel];
		if (!ch) {
			return { success: false, channel, subscriberCount: 0 };
		}
		ch.subscribers.set(connectionId, {
			id: connectionId,
			connectedAt: Date.now()
		});
		await this.save();
		return {
			success: true,
			channel,
			subscriberCount: ch.subscribers.size
		};
	}

	/** Unsubscribe a connection id from a channel. */
	async unsubscribe(
		channel: string,
		connectionId: string
	): Promise<{
		success: boolean;
		channel: string;
	}> {
		const s = await this.load();
		const ch = s.channels[channel];
		if (!ch) {
			return { success: false, channel };
		}
		ch.subscribers.delete(connectionId);
		await this.save();
		return { success: true, channel };
	}

	/** Publish a message to a channel. Returns number of subscribers that received it. */
	async publish(
		channel: string,
		message: string,
		excludedConnectionId?: string
	): Promise<{
		published: boolean;
		channel: string;
		recipientCount: number;
	}> {
		const s = await this.load();
		const ch = s.channels[channel];
		if (!ch) {
			return { published: false, channel, recipientCount: 0 };
		}

		const payload = JSON.stringify({
			type: "message",
			channel,
			data: message,
			publishedAt: Date.now()
		});

		// Fan out to all connected WebSocket sessions in this DO instance.
		// CF DO WebSockets are Hibernatable — we iterate all live sockets and
		// match by connection id (stored as a tag on accept).
		const sockets = this.ctx.getWebSockets();
		let recipientCount = 0;
		for (const ws of sockets) {
			const wsConnId = deserializeTag(ws);
			if (wsConnId === undefined) continue;
			if (wsConnId === excludedConnectionId) continue;
			if (!ch.subscribers.has(wsConnId)) continue;
			try {
				ws.send(payload);
				recipientCount++;
			} catch {
				ch.subscribers.delete(wsConnId);
			}
		}
		await this.save();
		return { published: true, channel, recipientCount };
	}

	/** Return all channels and their subscriber counts. */
	async listChannels(): Promise<
		Array<{ name: string; subscriberCount: number; createdAt: number }>
	> {
		const s = await this.load();
		return Object.entries(s.channels).map(([name, ch]) => ({
			name,
			subscriberCount: ch.subscribers.size,
			createdAt: ch.createdAt
		}));
	}

	/** Delete a channel and disconnect all subscribers. */
	async deleteChannel(name: string): Promise<{ deleted: boolean }> {
		const s = await this.load();
		if (!s.channels[name]) return { deleted: false };
		const ch = s.channels[name];
		const sockets = this.ctx.getWebSockets();
		for (const ws of sockets) {
			const wsConnId = deserializeTag(ws);
			if (wsConnId === undefined) continue;
			if (ch.subscribers.has(wsConnId)) {
				try {
					ws.close(1000, "channel deleted");
				} catch {
					/* noop */
				}
			}
		}
		delete s.channels[name];
		await this.save();
		return { deleted: true };
	}

	/** Idle for IDLE_TTL_MS — wipe storage to stop accruing cost. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}

export interface PubSubEnv {
	PUBSUB: DurableObjectNamespace<PubSub>;
}

/**
 * Read the connection id back from a hibernatable WebSocket. CF DO
 * hibernation requires us to store the connection id in the socket's
 * deserialize attachment on `accept()` so we can map it after wake.
 */
function deserializeTag(ws: WebSocket): string | undefined {
	try {
		const tag = ws.deserializeAttachment();
		return typeof tag === "string" ? tag : undefined;
	} catch {
		return undefined;
	}
}
