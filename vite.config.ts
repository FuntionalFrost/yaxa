import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vitest/config';
import { yaxa } from './src/lib/vite/index.ts';

export default defineConfig({
	plugins: [
		tailwindcss(),
		Icons({ compiler: 'svelte', autoInstall: false }),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				runtime: 'nodejs22.x'
			})
		}),
		yaxa()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
