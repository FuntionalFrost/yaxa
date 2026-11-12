import { describe, it, expect } from 'vitest';
import {
	parseTraceparent,
	resolveTraceContext,
	createServerTiming,
	createRequestLogger
} from './index';
import { yaxaEndpoint } from '../endpoint/index';
import type { LogEntry } from './types';

describe('Zero-Dependency Observability Suite (Milestone 4)', () => {
	describe('W3C Trace Context (traceparent & requestId)', () => {
		it('parses a valid W3C traceparent header', () => {
			const header = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
			const parsed = parseTraceparent(header);
			expect(parsed).toEqual({
				traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
				parentSpanId: '00f067aa0ba902b7',
				traceFlags: '01'
			});
		});

		it('rejects malformed or all-zero traceparent headers', () => {
			expect(parseTraceparent(null)).toBeNull();
			expect(parseTraceparent('invalid-header')).toBeNull();
			expect(
				parseTraceparent('00-00000000000000000000000000000000-00f067aa0ba902b7-01')
			).toBeNull();
			expect(
				parseTraceparent('00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01')
			).toBeNull();
		});

		it('resolves trace context preserving incoming traceId and x-request-id', () => {
			const incomingTrace = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
			const ctx = resolveTraceContext(incomingTrace, 'req_custom_999');

			expect(ctx.requestId).toBe('req_custom_999');
			expect(ctx.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
			expect(ctx.parentSpanId).toBe('00f067aa0ba902b7');
			expect(ctx.spanId).toHaveLength(16);
			expect(ctx.spanId).not.toBe('00f067aa0ba902b7');
			expect(ctx.traceparent).toBe(`00-${ctx.traceId}-${ctx.spanId}-01`);
		});

		it('generates fresh traceId and requestId when headers are absent', () => {
			const ctx = resolveTraceContext();
			expect(ctx.requestId).toMatch(/^req_[0-9a-f]{12}$/);
			expect(ctx.traceId).toMatch(/^[0-9a-f]{32}$/);
			expect(ctx.spanId).toMatch(/^[0-9a-f]{16}$/);
			expect(ctx.parentSpanId).toBeNull();
		});
	});

	describe('Server-Timing Tracker', () => {
		it('records manual and measured timings and formats W3C Server-Timing header', async () => {
			const timing = createServerTiming();
			timing.record('db', 12.345, 'Database Query');

			const res = await timing.measure(
				'compute',
				async () => {
					return 42;
				},
				'Heavy Compute'
			);

			expect(res).toBe(42);
			const metrics = timing.getMetrics();
			expect(metrics).toHaveLength(2);
			expect(metrics[0]).toEqual({
				name: 'db',
				durationMs: 12.35,
				description: 'Database Query'
			});

			const header = timing.toHeader();
			expect(header).toContain('db;dur=12.35;desc="Database Query"');
			expect(header).toContain('compute;dur=');
			expect(header).toContain('desc="Heavy Compute"');
		});
	});

	describe('Structured Contextual Logger', () => {
		it('emits structured JSON logs with trace context and redacts sensitive fields', () => {
			const captured: Array<{ entry: LogEntry; formatted: string }> = [];

			const logger = createRequestLogger(
				{
					requestId: 'req_test_1',
					traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
					spanId: '00f067aa0ba902b7',
					method: 'POST',
					path: '/api/checkout',
					userId: 'usr_123',
					orgId: 'org_456'
				},
				{
					level: 'debug',
					format: 'json',
					sink: (entry, formatted) => captured.push({ entry, formatted })
				}
			);

			logger.info('Processing order', {
				orderId: 'ord_99',
				password: 'super-secret-password',
				nested: {
					apiKey: 'yx_live_secret_123',
					safeField: 'visible'
				}
			});

			expect(captured).toHaveLength(1);
			const { entry } = captured[0];
			expect(entry.level).toBe('info');
			expect(entry.msg).toBe('Processing order');
			expect(entry.requestId).toBe('req_test_1');
			expect(entry.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
			expect(entry.userId).toBe('usr_123');
			expect(entry.orderId).toBe('ord_99');
			expect(entry.password).toBe('[REDACTED]');
			expect((entry.nested as Record<string, unknown>).apiKey).toBe('[REDACTED]');
			expect((entry.nested as Record<string, unknown>).safeField).toBe('visible');
		});

		it('supports child loggers and level filtering', () => {
			const captured: LogEntry[] = [];
			const logger = createRequestLogger(
				{
					requestId: 'req_2',
					traceId: 'trace_2',
					spanId: 'span_2'
				},
				{
					level: 'warn',
					format: 'pretty',
					sink: (entry) => captured.push(entry)
				}
			);

			logger.debug('Ignored debug');
			logger.info('Ignored info');

			const child = logger.child({ module: 'billing' });
			child.warn('Quota approaching limit', { usage: 95 });

			expect(captured).toHaveLength(1);
			expect(captured[0].level).toBe('warn');
			expect(captured[0].module).toBe('billing');
			expect(captured[0].usage).toBe(95);
		});
	});

	describe('yaxaEndpoint Observability Integration', () => {
		it('injects requestId, traceId, logger, and timing into context and sets response headers', async () => {
			const logs: LogEntry[] = [];

			const GET = yaxaEndpoint({
				loggerOptions: {
					sink: (entry) => logs.push(entry)
				},
				handle: async ({ requestId, traceId, logger, timing }) => {
					await timing.measure('cache_lookup', () => 'hit', 'Redis Cache');
					logger.info('Fetched items successfully', { count: 3 });
					return { requestId, traceId, items: [1, 2, 3] };
				}
			});

			const req = new Request('https://yaxa.dev/api/items', {
				method: 'GET',
				headers: {
					'x-request-id': 'req_incoming_42',
					traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'
				}
			});

			const response = await GET({
				request: req,
				url: new URL(req.url),
				locals: { user: { id: 'usr_abc' }, orgId: 'org_xyz' } as unknown as App.Locals,
				params: {}
			} as any);

			expect(response.status).toBe(200);
			expect(response.headers.get('x-request-id')).toBe('req_incoming_42');
			expect(response.headers.get('traceparent')).toMatch(
				/^00-4bf92f3577b34da6a3ce929d0e0e4736-[0-9a-f]{16}-01$/
			);

			const serverTiming = response.headers.get('server-timing') || '';
			expect(serverTiming).toContain('cache_lookup;dur=');
			expect(serverTiming).toContain('handler;dur=');
			expect(serverTiming).toContain('total;dur=');

			const data = await response.json();
			expect(data.requestId).toBe('req_incoming_42');
			expect(data.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');

			expect(logs).toHaveLength(1);
			expect(logs[0].msg).toBe('Fetched items successfully');
			expect(logs[0].userId).toBe('usr_abc');
			expect(logs[0].orgId).toBe('org_xyz');
		});
	});
});
