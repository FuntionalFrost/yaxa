import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vitest/config';
import { yaxa } from './src/lib/vite/index.ts';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		Icons({ compiler: 'svelte', autoInstall: false }),
		sveltekit({
			adapter: adapter({
				runtime: 'nodejs22.x'
			}),
			compilerOptions: {
				runes: true
			}
		}),
		yaxa()
	],
	resolve: {
		conditions: mode === 'test' ? ['browser'] : []
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['src/lib/testing/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/lib/**/*.{js,ts,svelte}'],
			exclude: ['src/lib/**/*.test.{js,ts}', 'src/lib/**/*.spec.{js,ts}', 'src/lib/**/types.ts']
		}
	}
}));
