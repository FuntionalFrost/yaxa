import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	if (url.pathname.endsWith('/get-session')) {
		return json({ user: null, session: null }, { status: 200 });
	}
	return json({ ok: true }, { status: 200 });
};

export const POST: RequestHandler = async () => {
	return json({ status: true, message: 'Authentication demo success' }, { status: 200 });
};
