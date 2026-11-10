import { describe, it, expect, vi, afterEach } from 'vitest';
import AiChat from './AiChat.svelte';
import PromptBar from './PromptBar.svelte';
import AiThought from './AiThought.svelte';
import AiToolCall from './AiToolCall.svelte';
import { useAiChat } from './useAiChat.svelte';

describe('AI-Native Components', () => {
	it('should export all AI component definitions', () => {
		expect(AiChat).toBeDefined();
		expect(PromptBar).toBeDefined();
		expect(AiThought).toBeDefined();
		expect(AiToolCall).toBeDefined();
		expect(typeof useAiChat).toBe('function');
	});
});

describe('useAiChat Runes Composable', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('initializes with default and initial messages', () => {
		const chat = useAiChat({
			initialMessages: [{ id: 'init-1', role: 'user', content: 'Initial message' }]
		});

		expect(chat.messages).toHaveLength(1);
		expect(chat.messages[0].content).toBe('Initial message');
		expect(chat.input).toBe('');
		expect(chat.loading).toBe(false);
		expect(chat.error).toBeNull();
	});

	it('streams SSE text deltas and thoughts progressively into assistant message', async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						'data: {"type":"thought","thought":{"running":true,"text":"Analyzing..."}}\n\n'
					)
				);
				controller.enqueue(encoder.encode('data: {"type":"text","delta":"Hello "}\n\n'));
				controller.enqueue(encoder.encode('data: {"type":"text","delta":"World!"}\n\n'));
				controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
				controller.close();
			}
		});

		globalThis.fetch = vi.fn().mockResolvedValue(
			new Response(stream, {
				headers: { 'Content-Type': 'text/event-stream' }
			})
		);

		const chat = useAiChat();
		chat.input = 'Say hello';

		await chat.send();

		expect(chat.messages).toHaveLength(2);
		expect(chat.messages[0].role).toBe('user');
		expect(chat.messages[0].content).toBe('Say hello');

		expect(chat.messages[1].role).toBe('assistant');
		expect(chat.messages[1].content).toBe('Hello World!');
		expect(chat.messages[1].thought?.text).toBe('Analyzing...');
		expect(chat.messages[1].isStreaming).toBe(false);
		expect(chat.loading).toBe(false);
		expect(chat.error).toBeNull();
	});

	it('handles retries and message clearing', async () => {
		const encoder = new TextEncoder();
		const mockResponse = () =>
			new Response(
				new ReadableStream({
					start(controller) {
						controller.enqueue(encoder.encode('data: {"type":"text","delta":"Response 1"}\n\n'));
						controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
						controller.close();
					}
				})
			);

		globalThis.fetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse()));

		const chat = useAiChat();
		await chat.send('Prompt 1');

		expect(chat.messages).toHaveLength(2);
		expect(chat.messages[1].content).toBe('Response 1');

		// Retrying replaces the assistant answer
		await chat.retry();
		expect(chat.messages).toHaveLength(2);
		expect(chat.messages[0].content).toBe('Prompt 1');

		// Clear empties conversation
		chat.clear();
		expect(chat.messages).toHaveLength(0);
	});
});
