export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
	level: LogLevel;
	timestamp: string;
	msg: string;
	requestId: string;
	traceId: string;
	spanId: string;
	method?: string;
	path?: string;
	userId?: string | null;
	orgId?: string | null;
	durationMs?: number;
	[key: string]: unknown;
}

export interface YaxaLoggerOptions {
	level?: LogLevel;
	format?: 'json' | 'pretty';
	redactKeys?: string[];
	sink?: (entry: LogEntry, formatted: string) => void;
}

export interface YaxaLogger {
	readonly requestId: string;
	readonly traceId: string;
	readonly spanId: string;
	debug(msg: string, meta?: Record<string, unknown>): void;
	info(msg: string, meta?: Record<string, unknown>): void;
	warn(msg: string, meta?: Record<string, unknown>): void;
	error(msg: string, meta?: Record<string, unknown>): void;
	child(bindings: Record<string, unknown>): YaxaLogger;
}

export interface TraceContext {
	requestId: string;
	traceId: string;
	spanId: string;
	parentSpanId: string | null;
	traceFlags: string;
	traceparent: string;
}

export interface TimingMetric {
	name: string;
	durationMs: number;
	description?: string;
}

export interface ServerTimingTracker {
	start(name: string, description?: string): () => number;
	record(name: string, durationMs: number, description?: string): void;
	measure<T>(name: string, fn: () => Promise<T> | T, description?: string): Promise<T>;
	getMetrics(): TimingMetric[];
	toHeader(): string;
}
