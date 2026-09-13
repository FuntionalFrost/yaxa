import { getDb, schemaPg } from '$lib/server/db/index';
import { createDrizzleAdmin } from '$lib/admin/handler';

const admin = createDrizzleAdmin({
	db: () => getDb(),
	schema: schemaPg
});

export const load = admin.load;
export const actions = admin.actions;
