import { describe, it, expect, vi } from 'vitest';
import { createAiStreamHandler } from './stream';

describe('createAiStreamHandler (Server-Side AI Stream Bridge)', () => {
	it('handles mock AI streaming with thought deltas and text chunks', async () => {
		const handler = createAiStreamHandler({
			mock: { delayMs: 1 }
		});

		const req = new Request('http://localhost/api/ai/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages: [{ id: '1', role: 'user', content: 'What is Yaxa?' }]
			})
		});

		const res = (await handler({ request: req, locals: {} } as any)) as Response;
		expect(res.headers.get('Content-Type')).toContain('text/event-stream');
		expect(res.headers.get('Cache-Control')).toContain('no-cache');

		const bodyText = await res.text();
		expect(bodyText).toContain('data:');
		expect(bodyText).toContain('"type":"thought"');
		expect(bodyText).toContain('"type":"text"');
		expect(bodyText).toContain('"type":"done"');
		expect(bodyText).toContain('createAiStreamHandler');
	});

	it('executes custom async stream handlers with provider chunks', async () => {
		const handler = createAiStreamHandler({
			handler: async function* ({ messages }) {
				yield {
					type: 'thought',
					thought: { running: true, text: 'Custom provider thinking...' }
				};
				yield {
					type: 'tool_call',
					tool: { name: 'calculator', status: 'success', result: { answer: 42 } }
				};
				yield {
					type: 'text',
					delta: `Hello from custom LLM: ${messages[0].content}`
				};
				yield { type: 'done' };
			}
		});

		const req = new Request('http://localhost/api/ai/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages: [{ id: '1', role: 'user', content: 'Calculate answer' }]
			})
		});

		const res = (await handler({ request: req, locals: {} } as any)) as Response;
		const bodyText = await res.text();

		expect(bodyText).toContain('"name":"calculator"');
		expect(bodyText).toContain('"answer":42');
		expect(bodyText).toContain('Hello from custom LLM: Calculate answer');
	});

	it('enforces guards before executing stream pipeline', async () => {
		const guard = vi.fn().mockResolvedValue(false);
		const handler = createAiStreamHandler({
			guards: [guard]
		});

		const req = new Request('http://localhost/api/ai/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: [] })
		});

		const res = (await handler({ request: req, locals: {} } as any)) as Response;
		expect(res.status).toBe(403);
		const json = await res.json();
		expect(json.title).toBe('Forbidden');
	});

	it('returns RFC 7807 problem details on invalid request body', async () => {
		const handler = createAiStreamHandler();
		const req = new Request('http://localhost/api/ai/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: 'invalid-json'
		});

		const res = (await handler({ request: req, locals: {} } as any)) as Response;
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.title).toBe('Bad Request');
	});
});
