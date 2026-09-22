import type { RequestHandler } from '@sveltejs/kit';
import { type SiteConfig, DEFAULT_SITE_CONFIG } from './config';

export interface ManifestOptions {
	config?: SiteConfig;
}

export function createManifestHandler(
	optionsOrConfig?: SiteConfig | ManifestOptions
): RequestHandler {
	const config: SiteConfig = !optionsOrConfig
		? DEFAULT_SITE_CONFIG
		: 'name' in optionsOrConfig
			? optionsOrConfig
			: optionsOrConfig.config || DEFAULT_SITE_CONFIG;

	return async () => {
		const manifest = {
			name: config.title || config.name,
			short_name: config.name,
			description: config.description,
			start_url: '/',
			display: 'standalone',
			background_color: config.theme?.neutralColor || '#121212',
			theme_color: config.theme?.primaryColor || '#ff3e00',
			icons: [
				{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
				{ src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
				{ src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
				{ src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
				{ src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
				{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
			]
		};

		return new Response(JSON.stringify(manifest, null, 2), {
			headers: {
				'Content-Type': 'application/manifest+json; charset=utf-8',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	};
}
