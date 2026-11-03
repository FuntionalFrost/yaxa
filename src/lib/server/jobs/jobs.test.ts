import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	EventBus,
	eventBus,
	enqueueJob,
	defineWorker,
	createJobRunner,
	parseJobDelay,
	memoryJobStore
} from './index.js';

describe('Domain Event Bus (EventBus)', () => {
	let bus: EventBus;

	beforeEach(() => {
		bus = new EventBus();
		eventBus.clear();
	});

	it('dispatches events asynchronously to registered subscribers', async () => {
		const received: any[] = [];
		bus.subscribe('user.registered', async (data) => {
			received.push(data);
		});

		await bus.publish('user.registered', { id: 'usr_1', email: 'alex@example.com' });
		expect(received).toHaveLength(1);
		expect(received[0].email).toBe('alex@example.com');
	});

	it('supports unsubscription via returned handler', async () => {
		let count = 0;
		const sub = bus.subscribe('counter.increment', () => {
			count++;
		});

		await bus.publish('counter.increment', {});
		expect(count).toBe(1);

		sub.unsubscribe();
		await bus.publish('counter.increment', {});
		expect(count).toBe(1);
	});

	it('supports one-time subscribers with once()', async () => {
		let triggered = 0;
		bus.once('invoice.paid', () => {
			triggered++;
		});

		await bus.publish('invoice.paid', { amount: 100 });
		await bus.publish('invoice.paid', { amount: 200 });
		expect(triggered).toBe(1);
	});

	it('isolates subscriber errors without crashing other subscribers or the publisher', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const healthyReceived: string[] = [];
		bus.subscribe('order.placed', () => {
			throw new Error('Failing external analytics webhook');
		});
		bus.subscribe('order.placed', (data) => {
			healthyReceived.push(data.orderId);
		});

		// Publishing should complete without throwing
		await expect(bus.publish('order.placed', { orderId: 'ord_999' })).resolves.not.toThrow();
		expect(healthyReceived).toEqual(['ord_999']);

		errorSpy.mockRestore();
	});
});

describe('Job Delay Parser (parseJobDelay)', () => {
	it('parses second, minute, hour, and day string abbreviations', () => {
		const now = Date.now();
		const in30s = parseJobDelay('30s').getTime();
		expect(in30s).toBeGreaterThanOrEqual(now + 29000);
		expect(in30s).toBeLessThanOrEqual(now + 31000);

		const in5m = parseJobDelay('5m').getTime();
		expect(in5m).toBeGreaterThanOrEqual(now + 5 * 60 * 1000 - 1000);

		const in2h = parseJobDelay('2h').getTime();
		expect(in2h).toBeGreaterThanOrEqual(now + 2 * 60 * 60 * 1000 - 1000);

		const in1d = parseJobDelay('1d').getTime();
		expect(in1d).toBeGreaterThanOrEqual(now + 24 * 60 * 60 * 1000 - 1000);
	});

	it('accepts raw millisecond numbers and Date instances directly', () => {
		const targetDate = new Date(Date.now() + 10000);
		expect(parseJobDelay(targetDate)).toEqual(targetDate);

		const msResult = parseJobDelay(5000).getTime();
		expect(msResult).toBeGreaterThanOrEqual(Date.now() + 4900);
	});
});

describe('Job Queue & Runner Engine', () => {
	beforeEach(() => {
		memoryJobStore.clear();
	});

	it('enqueues jobs with default metadata and parameters', async () => {
		const job = await enqueueJob(
			'send-email',
			{ to: 'elena@example.com' },
			{
				priority: 5,
				maxAttempts: 4
			}
		);

		expect(job.id).toBeDefined();
		expect(job.name).toBe('send-email');
		expect(job.payload.to).toBe('elena@example.com');
		expect(job.status).toBe('pending');
		expect(job.priority).toBe(5);
		expect(job.maxAttempts).toBe(4);
		expect(job.attempts).toBe(0);
		expect(memoryJobStore.has(job.id)).toBe(true);
	});

	it('processes pending jobs successfully via defined worker', async () => {
		const processed: string[] = [];

		const emailWorker = defineWorker<{ to: string }>('send-welcome', async (payload) => {
			processed.push(payload.to);
		});

		const runner = createJobRunner({
			workers: [emailWorker]
		});

		const job = await enqueueJob('send-welcome', { to: 'alex@example.com' });

		const result = await runner.processNextBatch();
		expect(result.processed).toBe(1);
		expect(result.succeeded).toBe(1);
		expect(result.failed).toBe(0);
		expect(processed).toEqual(['alex@example.com']);

		// Verify job record state
		const updatedJob = memoryJobStore.get(job.id);
		expect(updatedJob?.status).toBe('completed');
		expect(updatedJob?.completedAt).toBeDefined();
		expect(updatedJob?.lockedAt).toBeNull();
	});

	it('retries failing jobs with exponential backoff when attempts < maxAttempts', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		let callCount = 0;
		const flakyWorker = defineWorker('flaky-task', async () => {
			callCount++;
			throw new Error('Temporary 503 from external service');
		});

		const runner = createJobRunner({
			workers: [flakyWorker]
		});

		const job = await enqueueJob('flaky-task', {}, { maxAttempts: 3 });

		const result = await runner.processNextBatch();
		expect(result.processed).toBe(1);
		expect(result.succeeded).toBe(0);
		expect(result.failed).toBe(0); // Not marked permanently failed yet
		expect(callCount).toBe(1);

		const updatedJob = memoryJobStore.get(job.id);
		expect(updatedJob?.attempts).toBe(1);
		expect(updatedJob?.status).toBe('pending');
		expect(updatedJob?.failedReason).toContain('Temporary 503');
		// Backoff placed runAt into the future
		expect(updatedJob?.runAt.getTime()).toBeGreaterThan(Date.now());

		warnSpy.mockRestore();
	});

	it('transitions to Dead Letter Queue (status: failed) when maxAttempts is reached', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const fatalWorker = defineWorker('fatal-task', async () => {
			throw new Error('Permanent database constraint error');
		});

		const runner = createJobRunner({
			workers: [fatalWorker]
		});

		// maxAttempts = 1 -> should fail immediately after 1 attempt
		const job = await enqueueJob('fatal-task', {}, { maxAttempts: 1 });

		const result = await runner.processNextBatch();
		expect(result.processed).toBe(1);
		expect(result.succeeded).toBe(0);
		expect(result.failed).toBe(1);

		const updatedJob = memoryJobStore.get(job.id);
		expect(updatedJob?.status).toBe('failed');
		expect(updatedJob?.attempts).toBe(1);
		expect(updatedJob?.failedReason).toContain('Permanent database constraint');

		errorSpy.mockRestore();
	});

	it('prioritizes high priority jobs before lower priority jobs', async () => {
		const order: string[] = [];

		const worker = defineWorker<{ label: string }>('priority-test', async (payload) => {
			order.push(payload.label);
		});

		const runner = createJobRunner({
			workers: [worker],
			batchSize: 5
		});

		await enqueueJob('priority-test', { label: 'low' }, { priority: 0 });
		await enqueueJob('priority-test', { label: 'high' }, { priority: 10 });
		await enqueueJob('priority-test', { label: 'medium' }, { priority: 5 });

		await runner.processNextBatch();
		expect(order).toEqual(['high', 'medium', 'low']);
	});

	it('skips scheduled delayed jobs until their runAt threshold has passed', async () => {
		const worker = defineWorker('delayed-test', async () => {});
		const runner = createJobRunner({ workers: [worker] });

		// Schedule 1 hour in future
		await enqueueJob('delayed-test', {}, { delay: '1h' });

		const result = await runner.processNextBatch();
		expect(result.processed).toBe(0);
	});

	it('starts and stops continuous background polling cleanly', () => {
		const runner = createJobRunner({
			workers: [],
			pollIntervalMs: 100
		});

		expect(runner.isRunning()).toBe(false);
		runner.start();
		expect(runner.isRunning()).toBe(true);
		runner.stop();
		expect(runner.isRunning()).toBe(false);
	});
});
