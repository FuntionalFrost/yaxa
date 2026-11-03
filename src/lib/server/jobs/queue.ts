import type { EnqueueJobOptions, JobDelay, JobRecord } from './types';
import { schemaPg, schemaSqlite } from '../db';

/**
 * Parses delay specifier ('5m', '30s', '2h', number ms, Date) into an absolute Date.
 */
export function parseJobDelay(delay?: JobDelay): Date {
	const now = Date.now();
	if (!delay) {
		return new Date(now);
	}

	if (delay instanceof Date) {
		return delay;
	}

	if (typeof delay === 'number') {
		return new Date(now + Math.max(0, delay));
	}

	if (typeof delay === 'string') {
		const match = delay.trim().match(/^(\d+(?:\.\d+)?)\s*(s|m|h|d|ms)?$/i);
		if (match) {
			const value = parseFloat(match[1]);
			const unit = (match[2] || 'ms').toLowerCase();
			const multipliers: Record<string, number> = {
				s: 1000,
				m: 60 * 1000,
				h: 60 * 60 * 1000,
				d: 24 * 60 * 60 * 1000,
				ms: 1
			};
			const multiplier = multipliers[unit] ?? 1;
			return new Date(now + Math.round(value * multiplier));
		}
	}

	return new Date(now);
}

/**
 * In-memory fallback job store for unit testing or serverless instances without DB setup.
 */
export const memoryJobStore = new Map<string, JobRecord>();

/**
 * Enqueues a background job for asynchronous execution.
 * Supports delayed scheduling, priority, custom partitions, and the Transactional Outbox pattern.
 */
export async function enqueueJob<TPayload = any>(
	name: string,
	payload: TPayload,
	options: EnqueueJobOptions = {}
): Promise<JobRecord<TPayload>> {
	const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
	const queue = options.queue || 'default';
	const priority = options.priority ?? 0;
	const maxAttempts = options.maxAttempts ?? 3;
	const runAt = parseJobDelay(options.delay);
	const now = new Date();

	const jobRecord: JobRecord<TPayload> = {
		id,
		queue,
		name,
		payload,
		status: 'pending',
		priority,
		attempts: 0,
		maxAttempts,
		runAt,
		createdAt: now,
		updatedAt: now
	};

	// Save to in-memory store
	memoryJobStore.set(id, jobRecord);

	const client = options.tx || options.db;
	if (client) {
		try {
			const payloadString = JSON.stringify(payload);
			// Determine table schema (detect postgres vs sqlite table)
			const table = (client as any)?.schema?.job || schemaPg.job || schemaSqlite.job;

			await (client as any).insert(table).values({
				id,
				queue,
				name,
				payload: payloadString,
				status: 'pending',
				priority,
				attempts: 0,
				maxAttempts,
				runAt,
				createdAt: now,
				updatedAt: now
			});
		} catch (err) {
			// In case DB insert fails, log error
			console.error(`[JobQueue] Failed to persist job "${name}" (${id}) to database:`, err);
		}
	}

	return jobRecord;
}
