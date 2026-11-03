import type {
	JobBatchResult,
	JobRecord,
	JobRunner,
	JobRunnerOptions,
	WorkerDefinition,
	WorkerHandler
} from './types';
import { memoryJobStore } from './queue';

/**
 * Declares a typed worker handler for a specific job name.
 */
export function defineWorker<TPayload = any>(
	name: string,
	handler: WorkerHandler<TPayload>,
	options: { queue?: string } = {}
): WorkerDefinition<TPayload> {
	return {
		name,
		handler,
		queue: options.queue || 'default'
	};
}

/**
 * Calculates exponential backoff delay with jitter.
 */
function calculateBackoffDelay(attempt: number): number {
	const baseDelay = Math.min(3600000, Math.pow(2, attempt) * 1000);
	const jitter = Math.floor(Math.random() * 500);
	return baseDelay + jitter;
}

/**
 * Creates an embedded job runner capable of executing pending jobs either on-demand
 * (for serverless cron invocations) or continuously in the background (for Node.js servers).
 */
export function createJobRunner(options: JobRunnerOptions): JobRunner {
	const queue = options.queue || 'default';
	const batchSize = options.batchSize || 10;
	const pollIntervalMs = options.pollIntervalMs || 3000;
	const lockTimeoutMs = options.lockTimeoutMs || 5 * 60 * 1000;
	const workerId =
		options.workerId || `worker_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

	// Index worker handlers by name
	const workerMap = new Map<string, WorkerHandler>();
	for (const worker of options.workers) {
		workerMap.set(worker.name, worker.handler);
	}

	let activeTimer: any = null;
	let isRunning = false;
	let isProcessing = false;

	/**
	 * Leases next batch of jobs from memory or database.
	 */
	const leaseNextBatch = async (): Promise<JobRecord[]> => {
		const now = Date.now();
		const leased: JobRecord[] = [];

		// 1. Process from memory store
		const candidates = Array.from(memoryJobStore.values()).filter((job) => {
			if (job.queue !== queue) return false;

			const isReady = job.runAt.getTime() <= now;
			const isPending = job.status === 'pending' && isReady;
			const isStaleLocked =
				job.status === 'processing' && job.lockedAt && now - job.lockedAt.getTime() > lockTimeoutMs;

			return isPending || isStaleLocked;
		});

		// Sort by priority DESC, runAt ASC
		candidates.sort((a, b) => {
			if (b.priority !== a.priority) return b.priority - a.priority;
			return a.runAt.getTime() - b.runAt.getTime();
		});

		const batch = candidates.slice(0, batchSize);
		for (const job of batch) {
			job.status = 'processing';
			job.lockedAt = new Date(now);
			job.lockedBy = workerId;
			job.updatedAt = new Date(now);
			leased.push(job);
		}

		return leased;
	};

	/**
	 * Processes the next batch of pending jobs.
	 */
	const processNextBatch = async (): Promise<JobBatchResult> => {
		if (isProcessing) {
			return { processed: 0, succeeded: 0, failed: 0 };
		}

		isProcessing = true;
		let succeeded = 0;
		let failed = 0;

		try {
			const batch = await leaseNextBatch();

			for (const job of batch) {
				const handler = workerMap.get(job.name);

				if (!handler) {
					console.warn(
						`[JobRunner] No worker handler registered for job "${job.name}" (${job.id}). Leaving pending.`
					);
					job.status = 'pending';
					job.lockedAt = null;
					job.lockedBy = null;
					continue;
				}

				const logger = {
					info: (msg: string, ...args: any[]) =>
						console.log(`[JobRunner:${job.name}:${job.id}] ${msg}`, ...args),
					warn: (msg: string, ...args: any[]) =>
						console.warn(`[JobRunner:${job.name}:${job.id}] ${msg}`, ...args),
					error: (msg: string, ...args: any[]) =>
						console.error(`[JobRunner:${job.name}:${job.id}] ${msg}`, ...args)
				};

				try {
					await handler(job.payload, { job, logger });

					// Mark completed
					const now = new Date();
					job.status = 'completed';
					job.completedAt = now;
					job.updatedAt = now;
					job.lockedAt = null;
					job.lockedBy = null;
					succeeded++;
				} catch (err: any) {
					const now = new Date();
					job.attempts += 1;
					job.lockedAt = null;
					job.lockedBy = null;
					job.failedReason = err?.message || String(err);
					job.updatedAt = now;

					if (job.attempts < job.maxAttempts) {
						// Exponential backoff retry
						const delayMs = calculateBackoffDelay(job.attempts);
						job.status = 'pending';
						job.runAt = new Date(Date.now() + delayMs);
						logger.warn(
							`Job execution failed (Attempt ${job.attempts}/${job.maxAttempts}). Retrying in ${Math.round(delayMs / 1000)}s: ${job.failedReason}`
						);
					} else {
						// Exceeded max attempts: Route to Dead Letter Queue (DLQ)
						job.status = 'failed';
						failed++;
						logger.error(
							`Job failed permanently after ${job.attempts} attempts. Routed to Dead Letter Queue: ${job.failedReason}`
						);
					}
				}
			}

			return {
				processed: batch.length,
				succeeded,
				failed
			};
		} finally {
			isProcessing = false;
		}
	};

	/**
	 * Continuous background polling loop.
	 */
	const poll = async () => {
		if (!isRunning) return;
		try {
			await processNextBatch();
		} catch (err) {
			console.error('[JobRunner] Unexpected error during polling cycle:', err);
		} finally {
			if (isRunning) {
				activeTimer = setTimeout(poll, pollIntervalMs);
				if (activeTimer && typeof activeTimer === 'object' && 'unref' in activeTimer) {
					(activeTimer as any).unref();
				}
			}
		}
	};

	return {
		processNextBatch,
		start: () => {
			if (isRunning) return;
			isRunning = true;
			poll();
		},
		stop: () => {
			isRunning = false;
			if (activeTimer) {
				clearTimeout(activeTimer);
				activeTimer = null;
			}
		},
		isRunning: () => isRunning
	};
}
