import type { ServerTimingTracker, TimingMetric } from './types';

function nowMs(): number {
	if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
		return performance.now();
	}
	return Date.now();
}

/**
 * Creates a request-scoped Server-Timing tracker that formats W3C Server-Timing headers
 * visible in browser DevTools Network Timing panels.
 */
export function createServerTiming(): ServerTimingTracker {
	const metrics: TimingMetric[] = [];

	function record(name: string, durationMs: number, description?: string) {
		const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
		metrics.push({
			name: sanitizedName,
			durationMs: Math.max(0, Number(durationMs.toFixed(2))),
			description
		});
	}

	function start(name: string, description?: string): () => number {
		const startTime = nowMs();
		let ended = false;
		let elapsed = 0;

		return () => {
			if (!ended) {
				ended = true;
				elapsed = nowMs() - startTime;
				record(name, elapsed, description);
			}
			return elapsed;
		};
	}

	async function measure<T>(
		name: string,
		fn: () => Promise<T> | T,
		description?: string
	): Promise<T> {
		const stop = start(name, description);
		try {
			return await fn();
		} finally {
			stop();
		}
	}

	function getMetrics(): TimingMetric[] {
		return [...metrics];
	}

	function toHeader(): string {
		return metrics
			.map((m) => {
				let entry = `${m.name};dur=${m.durationMs.toFixed(2)}`;
				if (m.description) {
					const safeDesc = m.description.replace(/"/g, '\\"');
					entry += `;desc="${safeDesc}"`;
				}
				return entry;
			})
			.join(', ');
	}

	return {
		start,
		record,
		measure,
		getMetrics,
		toHeader
	};
}
