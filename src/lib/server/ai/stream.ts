import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import type {
	AiStreamChunk,
	AiStreamContext,
	CreateAiStreamHandlerOptions,
	AiMessage
} from './types';
import { problemResponse } from '../endpoint/problem';

/**
 * Creates a turnkey SvelteKit RequestHandler for AI chat streaming.
 * Supports Server-Sent Events (SSE), multi-provider backends (Gemini, OpenAI, Anthropic, Ollama),
 * guarded endpoints (auth/rate-limiting), and a built-in zero-config mock generator for dev/demos.
 *
 * @example
 * ```ts
 * // src/routes/api/ai/chat/+server.ts
 * import { createAiStreamHandler, requireAuth } from 'yaxa-svelte/server';
 *
 * export const POST = createAiStreamHandler({
 *   guards: [requireAuth()],
 *   handler: async ({ messages, send }) => {
 *     // Integrate your favorite LLM SDK
 *     for await (const chunk of streamText({ model: 'gemini-2.5-pro', messages })) {
 *       send({ type: 'text', delta: chunk.text });
 *     }
 *   }
 * });
 * ```
 */
export function createAiStreamHandler(options: CreateAiStreamHandlerOptions = {}): RequestHandler {
	const mockConfig =
		options.mock === true || (options.mock === undefined && !options.handler)
			? { delayMs: 25 }
			: typeof options.mock === 'object'
				? { delayMs: options.mock.delayMs ?? 25 }
				: null;

	return async (event: RequestEvent) => {
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

		// 2. Parse request payload
		let messages: AiMessage[] = [];
		try {
			const body = await request.json();
			messages = Array.isArray(body?.messages) ? body.messages : [];
		} catch {
			return problemResponse({
				status: 400,
				title: 'Bad Request',
				detail: 'Invalid JSON request body. Expected an object with a "messages" array.'
			});
		}

		await options.onStart?.(event);

		const user = (locals as any)?.user ?? null;
		const encoder = new TextEncoder();
		const signal = request.signal;

		const stream = new ReadableStream({
			async start(controller) {
				let isClosed = false;

				function safeEnqueue(str: string) {
					if (!isClosed && !signal.aborted) {
						try {
							controller.enqueue(encoder.encode(str));
						} catch {
							isClosed = true;
						}
					}
				}

				function sendChunk(chunk: AiStreamChunk) {
					safeEnqueue(`data: ${JSON.stringify(chunk)}\n\n`);
				}

				const ctx: AiStreamContext = {
					event,
					messages,
					user,
					signal,
					send: sendChunk
				};

				try {
					if (options.handler) {
						const res = await options.handler(ctx);
						if (res && typeof (res as any)[Symbol.asyncIterator] === 'function') {
							for await (const chunk of res as AsyncIterable<AiStreamChunk>) {
								if (signal.aborted) break;
								sendChunk(chunk);
							}
						}
					} else if (mockConfig) {
						// Simulated Realistic AI Flow: Thought -> Streamed Text -> Done
						const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
						const prompt = lastUserMsg?.content || 'Hello';

						// 1. Thought start
						sendChunk({
							type: 'thought',
							thought: {
								running: true,
								text: 'Analyzing request and inspecting context...',
								steps: ['Interpreting prompt semantics', 'Checking relevant system tools']
							}
						});

						await new Promise((r) => setTimeout(r, Math.max(10, mockConfig.delayMs * 2)));
						if (signal.aborted) return;

						// 2. Thought finish
						sendChunk({
							type: 'thought',
							thought: {
								running: false,
								duration: 0.8,
								text: 'Context analyzed. Formulating response.',
								steps: ['Interpreting prompt semantics', 'Synthesizing output response']
							}
						});

						// 3. Stream response tokens
						const mockText = `I have received your request: "${prompt}".\n\nThis response is streamed live via Yaxa's \`createAiStreamHandler\` using Server-Sent Events (SSE). You can connect this seamlessly with OpenAI, Google Gemini, Anthropic, or local Ollama models.`;
						const words = mockText.split(' ');

						for (let i = 0; i < words.length; i++) {
							if (signal.aborted) break;
							const word = words[i] + (i === words.length - 1 ? '' : ' ');
							sendChunk({ type: 'text', delta: word });
							if (mockConfig.delayMs > 0) {
								await new Promise((r) => setTimeout(r, mockConfig.delayMs));
							}
						}

						if (!signal.aborted) {
							sendChunk({ type: 'done' });
						}
					}

					if (!isClosed) {
						isClosed = true;
						controller.close();
					}
				} catch (err) {
					if (!isClosed && !signal.aborted) {
						sendChunk({
							type: 'error',
							error: err instanceof Error ? err.message : String(err)
						});
						isClosed = true;
						try {
							controller.close();
						} catch {
							// Controller may already be closed
						}
					}
					await options.onError?.(err, event);
				}
			},
			cancel() {
				// Client cancelled stream
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream; charset=utf-8',
				'Cache-Control': 'no-cache, no-transform',
				Connection: 'keep-alive',
				'X-Accel-Buffering': 'no'
			}
		});
	};
}
