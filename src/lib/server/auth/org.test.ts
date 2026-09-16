import { describe, it, expect } from 'vitest';
import { schemaPg, schemaSqlite } from '../db';

describe('Multi-Tenant Organization Database Schemas', () => {
	it('defines Postgres organization, member, and invitation tables with correct columns', () => {
		expect(schemaPg.organization).toBeDefined();
		expect(schemaPg.member).toBeDefined();
		expect(schemaPg.invitation).toBeDefined();
		expect(schemaPg.session.activeOrganizationId).toBeDefined();
	});

	it('defines SQLite organization, member, and invitation tables with correct columns', () => {
		expect(schemaSqlite.organization).toBeDefined();
		expect(schemaSqlite.member).toBeDefined();
		expect(schemaSqlite.invitation).toBeDefined();
		expect(schemaSqlite.session.activeOrganizationId).toBeDefined();
	});
});
