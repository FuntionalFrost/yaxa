import { SvelteDate } from 'svelte/reactivity';
import type { AiMessage } from './AiChat.svelte';
import type { AiStreamChunk } from '../../server/ai/types';

export interface UseAiChatOptions {
	/**
	 * Endpoint URL for streaming chat completions.
	 * @default '/api/ai/chat'
	 */
	api?: string;
	/**
	 * Initial messages loaded into the chat conversation.
	 */
	initialMessages?: AiMessage[];
	/**
	 * Additional HTTP request headers or function returning headers.
	 */
	headers?: Record<string, string> | (() => Record<string, string>);
	/**
	 * Additional request body payload merged with `{ messages }`.
	 */
	body?: Record<string, unknown> | (() => Record<string, unknown>);
	/**
	 * Callback invoked when assistant finishes streaming a response.
	 */
	onFinish?: (message: AiMessage) => void;
	/**
	 * Callback invoked when an error occurs during streaming or fetch.
	 */
	onError?: (error: Error) => void;
}

export interface UseAiChatReturn {
	readonly messages: AiMessage[];
	input: string;
	readonly loading: boolean;
	readonly error: string | null;
	send: (content?: string, files?: File[]) => Promise<void>;
	stop: () => void;
	retry: (message?: AiMessage) => Promise<void>;
	clear: () => void;
	setMessages: (newMessages: AiMessage[]) => void;
}

/**
 * Svelte 5 reactive runes composable for AI streaming chat.
 * Direct bridge between SvelteKit streaming endpoints (`createAiStreamHandler`) and `<AiChat>`.
 *
 * Automatically coordinates:
 * - Reactive messages array with user and assistant turns
 * - Progressive streaming text deltas
 * - `<AiThought>` real-time reasoning durations and steps
 * - `<AiToolCall>` live tool executions and states
 * - Abortable streams (`stop()`) and conversational retries (`retry()`)
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { AiChat, useAiChat } from 'yaxa-svelte';
 *
 *   const chat = useAiChat({ api: '/api/ai/chat' });
 * </script>
 *
 * <AiChat
 *   messages={chat.messages}
 *   loading={chat.loading}
 *   onsend={(text) => chat.send(text)}
 *   onstop={() => chat.stop()}
 *   onretry={(msg) => chat.retry(msg)}
 * />
 * ```
 */
export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
	const api = options.api || '/api/ai/chat';

	let messages = $state<AiMessage[]>(
		options.initialMessages ? options.initialMessages.map((m) => ({ ...m })) : []
	);
	let input = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	let abortController: AbortController | null = null;

	async function send(content?: string, _files?: File[]): Promise<void> {
		void _files;
		const prompt = (content !== undefined ? content : input).trim();
		if (!prompt) return;

		// Reset input and clear any previous errors
		input = '';
		error = null;
		loading = true;

		// 1. Append User Message
		const userMsg: AiMessage = {
			id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			role: 'user',
			content: prompt,
			createdAt: new SvelteDate()
		};
		messages.push(userMsg);

		// 2. Append Assistant Placeholder Message
		messages.push({
			id: `asst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			role: 'assistant',
			content: '',
			isStreaming: true,
			createdAt: new SvelteDate()
		});
		const assistantIdx = messages.length - 1;

		abortController = new AbortController();

		try {
			const customHeaders =
				typeof options.headers === 'function' ? options.headers() : options.headers || {};
			const customBody = typeof options.body === 'function' ? options.body() : options.body || {};

			const response = await fetch(api, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...customHeaders
				},
				body: JSON.stringify({
					messages: $state.snapshot(messages),
					...customBody
				}),
				signal: abortController.signal
			});

			if (!response.ok) {
				const errorText = await response.text().catch(() => '');
				let detail = `Request failed with status ${response.status}`;
				try {
					const json = JSON.parse(errorText);
					detail = json.detail || json.message || detail;
				} catch {
					// Response body was not JSON, retain default detail message
				}
				throw new Error(detail);
			}

			if (!response.body) {
				throw new Error('Response body is null, cannot stream SSE chunks.');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				const target = messages[assistantIdx];
				if (!target) break;

				for (const line of lines) {
					const trimmed = line.trim();
					if (!trimmed || !trimmed.startsWith('data:')) continue;

					const dataStr = trimmed.slice(5).trim();
					if (dataStr === '[DONE]') {
						target.isStreaming = false;
						continue;
					}

					try {
						const chunk: AiStreamChunk = JSON.parse(dataStr);

						if (chunk.type === 'text' && chunk.delta) {
							target.content += chunk.delta;
						} else if (chunk.type === 'thought' && chunk.thought) {
							target.thought = {
								...target.thought,
								...chunk.thought
							};
						} else if (chunk.type === 'tool_call' && chunk.tool) {
							if (!target.tools) target.tools = [];
							const existingIdx = target.tools.findIndex((t) => t.name === chunk.tool!.name);
							if (existingIdx >= 0) {
								target.tools[existingIdx] = {
									...target.tools[existingIdx],
									...chunk.tool
								};
							} else {
								target.tools.push(chunk.tool);
							}
						} else if (chunk.type === 'error') {
							error = chunk.error || 'AI generation encountered an error.';
							target.isStreaming = false;
						} else if (chunk.type === 'done') {
							target.isStreaming = false;
						}
					} catch {
						// Ignore unparsable SSE frames
					}
				}
			}

			const finalTarget = messages[assistantIdx];
			if (finalTarget) {
				finalTarget.isStreaming = false;
				options.onFinish?.(finalTarget);
			}
		} catch (err: any) {
			if (err?.name === 'AbortError') {
				// User manually aborted stream via stop()
			} else {
				const errMsg = err instanceof Error ? err.message : String(err);
				error = errMsg;
				options.onError?.(err instanceof Error ? err : new Error(errMsg));
			}
			const finalTarget = messages[assistantIdx];
			if (finalTarget) {
				finalTarget.isStreaming = false;
			}
		} finally {
			loading = false;
			abortController = null;
		}
	}

	function stop(): void {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
		loading = false;
		const last = messages[messages.length - 1];
		if (last && last.role === 'assistant') {
			last.isStreaming = false;
		}
	}

	async function retry(messageToRetry?: AiMessage): Promise<void> {
		if (loading) stop();

		let targetIdx = -1;
		if (messageToRetry) {
			targetIdx = messages.findIndex((m) => m.id === messageToRetry.id);
		} else {
			// Find the last assistant message
			for (let i = messages.length - 1; i >= 0; i--) {
				if (messages[i].role === 'assistant') {
					targetIdx = i;
					break;
				}
			}
		}

		if (targetIdx < 0) return;

		// Find the closest preceding user message
		let promptToRetry = '';
		for (let i = targetIdx - 1; i >= 0; i--) {
			if (messages[i].role === 'user') {
				promptToRetry = messages[i].content;
				break;
			}
		}

		// Remove the target message and any following messages
		messages.splice(targetIdx);

		if (promptToRetry) {
			// Also pop the user message so send() doesn't duplicate it
			if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
				messages.pop();
			}
			await send(promptToRetry);
		}
	}

	function clear(): void {
		if (loading) stop();
		messages.length = 0;
		error = null;
		loading = false;
	}

	function setMessages(newMessages: AiMessage[]): void {
		messages = newMessages.map((m) => ({ ...m }));
	}

	return {
		get messages() {
			return messages;
		},
		get input() {
			return input;
		},
		set input(val: string) {
			input = val;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		send,
		stop,
		retry,
		clear,
		setMessages
	};
}
