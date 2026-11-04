import { yaxaSSE } from '#lib/server/index.js';

export const GET = yaxaSSE({
	summary: 'Real-Time Event Stream',
	description:
		'Subscribes client to live server broadcasts with automated keep-alive pings and channel pub/sub.',
	channel: 'global',
	keepAliveIntervalMs: 15_000,
	onConnect: ({ send }) => {
		send('connected', {
			status: 'connected',
			serverTime: new Date().toISOString()
		});
	}
});
