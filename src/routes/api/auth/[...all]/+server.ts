import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	if (url.pathname.endsWith('/get-session')) {
		return Response.json({ user: null, session: null }, { status: 200 });
	}
	return Response.json({ ok: true }, { status: 200 });
};

export const POST: RequestHandler = async () => {
	return Response.json({ status: true, message: 'Authentication demo success' }, { status: 200 });
};
