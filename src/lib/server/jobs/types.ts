import type { AnyDb } from '../db';
import type { JobStatus } from '../db/types';

/**
 * Persisted Job record structure.
 */
export interface JobRecord<TPayload = any> {
	id: string;
	queue: string;
	name: string;
	payload: TPayload;
	status: JobStatus;
	priority: number;
	attempts: number;
	maxAttempts: number;
	runAt: Date;
	lockedAt?: Date | null;
	lockedBy?: string | null;
	failedReason?: string | null;
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date | null;
}

/**
 * Delay specifier:
 * - String format: '30s', '5m', '2h', '1d'
 * - Number: delay in milliseconds
 * - Date: absolute execution timestamp
 */
export type JobDelay = string | number | Date;

export interface EnqueueJobOptions {
	/**
	 * Queue partition name (default: 'default').
	 */
	queue?: string;
	/**
	 * Execution delay or scheduled Date.
	 */
	delay?: JobDelay;
	/**
	 * Job execution priority (higher number = higher priority). Default: 0.
	 */
	priority?: number;
	/**
	 * Maximum retry attempts before routing to Dead Letter Queue (DLQ). Default: 3.
	 */
	maxAttempts?: number;
	/**
	 * Optional Drizzle transaction object for the Transactional Outbox pattern.
	 */
	tx?: any;
	/**
	 * Optional custom Drizzle DB client instance.
	 */
	db?: AnyDb;
}

export interface WorkerContext<TPayload = any> {
	job: JobRecord<TPayload>;
	logger: {
		info: (msg: string, ...args: any[]) => void;
		warn: (msg: string, ...args: any[]) => void;
		error: (msg: string, ...args: any[]) => void;
	};
}

export type WorkerHandler<TPayload = any> = (
	payload: TPayload,
	context: WorkerContext<TPayload>
) => Promise<void> | void;

export interface WorkerDefinition<TPayload = any> {
	name: string;
	handler: WorkerHandler<TPayload>;
	queue?: string;
}

export interface JobRunnerOptions {
	/**
	 * Drizzle database instance (Neon or Turso).
	 */
	db?: AnyDb;
	/**
	 * Database driver ('neon' | 'turso' | 'sqlite').
	 */
	driver?: 'neon' | 'turso' | 'sqlite';
	/**
	 * List of registered worker handlers.
	 */
	workers: WorkerDefinition<any>[];
	/**
	 * Target queue name to poll (default: 'default').
	 */
	queue?: string;
	/**
	 * Maximum jobs to lease and process per batch (default: 10).
	 */
	batchSize?: number;
	/**
	 * Polling interval in milliseconds for daemon mode (default: 3000ms).
	 */
	pollIntervalMs?: number;
	/**
	 * Lock timeout in milliseconds before a processing job is considered stale (default: 5 minutes).
	 */
	lockTimeoutMs?: number;
	/**
	 * Worker instance identifier (default: generated worker id).
	 */
	workerId?: string;
}

export interface JobBatchResult {
	processed: number;
	succeeded: number;
	failed: number;
}

export interface JobRunner {
	/**
	 * Processes the next batch of pending jobs. Perfect for serverless cron endpoints (/api/cron/jobs).
	 */
	processNextBatch: () => Promise<JobBatchResult>;
	/**
	 * Starts the continuous background polling loop (for long-lived Node.js servers).
	 */
	start: () => void;
	/**
	 * Stops the background polling loop.
	 */
	stop: () => void;
	/**
	 * Returns true if the polling runner is currently active.
	 */
	isRunning: () => boolean;
}

export type EventHandler<TData = any> = (data: TData) => Promise<void> | void;

export interface EventSubscription {
	unsubscribe: () => void;
}

export interface IEventBus {
	publish: <TData = any>(eventName: string, data: TData) => Promise<void>;
	subscribe: <TData = any>(eventName: string, handler: EventHandler<TData>) => EventSubscription;
	once: <TData = any>(eventName: string, handler: EventHandler<TData>) => EventSubscription;
	clear: () => void;
}
