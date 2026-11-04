import { yaxaEndpoint, rateLimit } from '#lib/server/index.js';
import { z } from 'zod';

const ProjectSchema = z.object({
	name: z.string().min(3).describe('Name of the project'),
	description: z.string().optional().describe('Short summary of project goals'),
	tags: z.array(z.string()).optional().describe('Categorization tags')
});

type ProjectInput = z.infer<typeof ProjectSchema>;

export const GET = yaxaEndpoint({
	summary: 'List user projects',
	description: 'Returns all workspace projects associated with the current session.',
	status: 200,
	guards: [rateLimit({ points: 60, windowSeconds: 60 })],
	handle: async () => {
		return [
			{
				id: 'proj_1',
				name: 'Yaxa Design System',
				description: 'Next-generation UI & SEO component suite for SvelteKit',
				tags: ['svelte', 'ui', 'tailwind']
			},
			{
				id: 'proj_2',
				name: 'Solo SaaS Engine',
				description: 'Turnkey billing, authentication, and background jobs platform',
				tags: ['saas', 'billing', 'drizzle']
			}
		];
	}
});

export const POST = yaxaEndpoint({
	summary: 'Create project',
	description: 'Initializes a new workspace project with validation and rate limiting.',
	status: 201,
	guards: [rateLimit({ points: 20, windowSeconds: 60 })],
	schema: {
		body: ProjectSchema
	},
	handle: async ({ body }: { body: ProjectInput }) => {
		return {
			id: `proj_${Date.now()}`,
			name: body.name,
			description: body.description ?? null,
			tags: body.tags ?? [],
			createdAt: new Date().toISOString()
		};
	}
});
