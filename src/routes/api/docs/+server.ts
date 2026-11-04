import { createApiDocsHandler } from '#lib/server/index.js';
import { GET as listProjects, POST as createProject } from '../projects/+server';
import { GET as runCron } from '../cron/jobs/+server';
import { GET as renderOg } from '../og/+server';

export const GET = createApiDocsHandler({
	title: 'Yaxa Interactive API Reference',
	version: '1.0.0',
	description:
		'Live interactive OpenAPI 3.1 & Scalar documentation for Yaxa full-stack SvelteKit endpoints.',
	theme: 'scalar',
	endpoints: {
		'/api/projects': {
			GET: listProjects,
			POST: createProject
		},
		'/api/cron/jobs': {
			GET: runCron
		},
		'/api/og': {
			GET: renderOg
		}
	}
});
