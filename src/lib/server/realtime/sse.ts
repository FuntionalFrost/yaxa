import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type { SSEClientContext, SSEMessage, YaxaSSEOptions } from './types';
import { globalBroadcaster } from './broadcaster';
import { problemResponse } from '../endpoint/problem';

/**
 * Formats a payload into a valid Server-Sent Events text frame.
 */
export function formatSSEFrame<T = unknown>(message: SSEMessage<T>): string {
	let output = '';

	if (message.id !== undefined) {
		output += `id: ${message.id}\n`;
	}

	if (message.event !== undefined) {
		output += `event: ${message.event}\n`;
	}

	if (message.retry !== undefined) {
		output += `retry: ${message.retry}\n`;
	}

	const dataStr =
		typeof message.data === 'object' && message.data !== null
			? JSON.stringify(message.data)
			: String(message.data ?? '');

	// SSE specification requires multiple 'data: ' lines if data contains newlines
	const lines = dataStr.split(/\r\n|\r|\n/);
	for (const line of lines) {
		output += `data: ${line}\n`;
	}

	output += '\n';
	return output;
}

/**
 * Creates a turnkey SvelteKit Server-Sent Events (SSE) RequestHandler with
 * guard evaluation, automatic keep-alive pings, and channel broadcasting.
 *
 * @example
 * ```ts
 * // src/routes/api/events/+server.ts
 * import { yaxaSSE, requireAuth } from 'yaxa-svelte/server';
 *
 * export const GET = yaxaSSE({
 *   guards: [requireAuth()],
 *   channel: (event) => `org:${event.locals.orgId}`,
 *   keepAliveIntervalMs: 15000,
 *   onConnect: ({ send }) => {
 *     send('welcome', { time: Date.now() });
 *   }
 * });
 * ```
 */
export function yaxaSSE(options: YaxaSSEOptions = {}): RequestHandler & { _yaxaConfig: any } {
	const keepAliveIntervalMs = options.keepAliveIntervalMs ?? 15_000;
	const keepAliveComment = options.keepAliveComment ?? ': ping\n\n';
	const broadcaster = options.broadcaster ?? globalBroadcaster;

	const sseHandler: RequestHandler & { _yaxaConfig: any } = async (event: RequestEvent) => {
		const { request, locals } = event;

		// 1. Evaluate guards if configured
		if (options.guards && options.guards.length > 0) {
			for (const guard of options.guards) {
				const result = await guard(event);
				if (result instanceof Response) {
					return result;
				}
				if (result && typeof result === 'object' && 'status' in result && 'title' in result) {
					return problemResponse(result as any);
				}
				if (result === false) {
					return problemResponse({
						status: 403,
						title: 'Forbidden',
						detail: 'Access denied by endpoint guard.'
					});
				}
			}
		}

		// 2. Resolve target channel
		let channel = 'default';
		if (typeof options.channel === 'function') {
			channel = await options.channel(event);
		} else if (typeof options.channel === 'string' && options.channel.length > 0) {
			channel = options.channel;
		}

		const user = (locals as any)?.user ?? null;
		const orgId = (locals as any)?.orgId ?? (locals as any)?.org?.id ?? null;
		const connectionId = `sse_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

		const encoder = new TextEncoder();
		let unsubscribe: (() => void) | null = null;
		let pingTimer: any = null;
		let isClosed = false;
		let clientCloseFn: (() => void) | null = null;

		const stream = new ReadableStream({
			start(controller) {
				const safeEnqueue = (text: string): boolean => {
					if (isClosed) return false;
					try {
						controller.enqueue(encoder.encode(text));
						return true;
					} catch {
						isClosed = true;
						return false;
					}
				};

				const clientSend = <T = unknown>(
					eventOrMessage: string | SSEMessage<T>,
					data?: T
				): boolean => {
					if (isClosed) return false;

					let msg: SSEMessage<T>;
					if (typeof eventOrMessage === 'string') {
						msg = { event: eventOrMessage, data: data as T };
					} else {
						msg = eventOrMessage;
					}

					return safeEnqueue(formatSSEFrame(msg));
				};

				const clientClose = () => {
					if (isClosed) return;
					isClosed = true;

					if (pingTimer) {
						clearInterval(pingTimer);
						pingTimer = null;
					}

					if (unsubscribe) {
						unsubscribe();
						unsubscribe = null;
					}

					try {
						controller.close();
					} catch {
						// Stream might already be closed by client
					}

					if (options.onDisconnect) {
						Promise.resolve(
							options.onDisconnect({
								connectionId,
								channel,
								event,
								user,
								orgId
							})
						).catch((err) => {
							console.error('[Yaxa SSE onDisconnect Error]:', err);
						});
					}
				};

				clientCloseFn = clientClose;

				// Subscribe client to channel broadcast events
				unsubscribe = broadcaster.subscribe(channel, (msg) => {
					clientSend({
						event: msg.event,
						data: msg.payload,
						id: msg.id
					});
				});

				// Heartbeat loop to keep connections open through proxies/firewalls
				if (keepAliveIntervalMs > 0) {
					pingTimer = setInterval(() => {
						safeEnqueue(keepAliveComment);
					}, keepAliveIntervalMs);
				}

				// Abort handling when client closes connection or navigates away
				if (request.signal) {
					request.signal.addEventListener('abort', clientClose, { once: true });
				}

				// Context provided to onConnect
				const clientContext: SSEClientContext = {
					connectionId,
					channel,
					event,
					user,
					orgId,
					send: clientSend,
					close: clientClose
				};

				// Invoke onConnect callback
				if (options.onConnect) {
					Promise.resolve(options.onConnect(clientContext)).catch((err) => {
						console.error('[Yaxa SSE onConnect Error]:', err);
					});
				}
			},

			cancel() {
				if (clientCloseFn) {
					clientCloseFn();
				} else {
					isClosed = true;
					if (pingTimer) {
						clearInterval(pingTimer);
						pingTimer = null;
					}
					if (unsubscribe) {
						unsubscribe();
						unsubscribe = null;
					}
				}
			}
		});

		return new Response(stream, {
			status: 200,
			headers: {
				'content-type': 'text/event-stream; charset=utf-8',
				'cache-control': 'no-cache, no-transform',
				connection: 'keep-alive',
				'x-accel-buffering': 'no'
			}
		});
	};

	sseHandler._yaxaConfig = {
		summary: options.summary || 'Server-Sent Events Stream',
		description:
			options.description ||
			'Real-time Server-Sent Events stream with multi-channel pub/sub and keep-alive heartbeats.',
		guards: options.guards,
		status: 200,
		responses: {
			'200': {
				description: 'Active event stream',
				content: {
					'text/event-stream': {
						schema: { type: 'string' }
					}
				}
			}
		}
	};

	return sseHandler;
}
