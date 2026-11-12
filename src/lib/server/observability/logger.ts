import type { LogEntry, LogLevel, YaxaLogger, YaxaLoggerOptions } from './types';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40
};

const DEFAULT_REDACT_KEYS = [
	'password',
	'pass',
	'secret',
	'token',
	'accesstoken',
	'refreshtoken',
	'apikey',
	'api_key',
	'authorization',
	'cookie',
	'set-cookie',
	'creditcard',
	'cvv'
];

function redactObject(
	obj: Record<string, unknown>,
	redactSet: Set<string>,
	depth = 0
): Record<string, unknown> {
	if (depth > 4) return obj;
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (redactSet.has(key.toLowerCase())) {
			result[key] = '[REDACTED]';
		} else if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[key] = redactObject(value as Record<string, unknown>, redactSet, depth + 1);
		} else {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Creates a zero-dependency structured logger bound to a request's W3C traceId and requestId.
 */
export function createRequestLogger(
	baseContext: {
		requestId: string;
		traceId: string;
		spanId: string;
		method?: string;
		path?: string;
		userId?: string | null;
		orgId?: string | null;
		[key: string]: unknown;
	},
	options: YaxaLoggerOptions = {}
): YaxaLogger {
	const minLevel = options.level || 'info';
	const format = options.format || 'json';
	const redactSet = new Set(
		(options.redactKeys || DEFAULT_REDACT_KEYS).map((k) => k.toLowerCase())
	);

	function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
		if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[minLevel]) {
			return;
		}

		const safeMeta = meta ? redactObject(meta, redactSet) : {};
		const entry: LogEntry = {
			level,
			timestamp: new Date().toISOString(),
			msg,
			...baseContext,
			...safeMeta
		};

		let formatted: string;
		if (format === 'pretty') {
			const tag = `[${entry.level.toUpperCase()}]`;
			const reqTag = `(${entry.requestId})`;
			const routeTag = entry.method && entry.path ? `${entry.method} ${entry.path} ` : '';
			const extraKeys = Object.keys(safeMeta);
			const extraStr = extraKeys.length > 0 ? ` ${JSON.stringify(safeMeta)}` : '';
			formatted = `${tag} ${reqTag} ${routeTag}${msg}${extraStr}`;
		} else {
			formatted = JSON.stringify(entry);
		}

		if (options.sink) {
			options.sink(entry, formatted);
			return;
		}

		switch (level) {
			case 'error':
				console.error(formatted);
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'debug':
				console.debug(formatted);
				break;
			case 'info':
			default:
				console.info(formatted);
				break;
		}
	}

	return {
		get requestId() {
			return baseContext.requestId;
		},
		get traceId() {
			return baseContext.traceId;
		},
		get spanId() {
			return baseContext.spanId;
		},
		debug(msg: string, meta?: Record<string, unknown>) {
			emit('debug', msg, meta);
		},
		info(msg: string, meta?: Record<string, unknown>) {
			emit('info', msg, meta);
		},
		warn(msg: string, meta?: Record<string, unknown>) {
			emit('warn', msg, meta);
		},
		error(msg: string, meta?: Record<string, unknown>) {
			emit('error', msg, meta);
		},
		child(bindings: Record<string, unknown>) {
			const safeBindings = redactObject(bindings, redactSet);
			return createRequestLogger({ ...baseContext, ...safeBindings }, options);
		}
	};
}
