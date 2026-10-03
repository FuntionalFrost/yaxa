import { getDb, schemaPg } from '#lib/server/db/index.js';
import { createDrizzleAdmin } from '#lib/admin/handler.js';

const admin = createDrizzleAdmin({
	db: () => getDb(),
	schema: schemaPg
});

export const load = admin.load;
export const actions = admin.actions;
