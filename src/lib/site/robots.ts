import type { RequestHandler } from '@sveltejs/kit';
import type { SiteConfig } from './config';

export interface RobotsOptions {
	config: SiteConfig;
	/**
	 * Override environment detection. If true, allows indexing. If false, disallows indexing.
	 */
	isProduction?: boolean;
	/**
	 * Policy for AI scrapers and web crawlers (default: 'allow')
	 */
	aiCrawlers?: 'allow' | 'disallow';
}

const AI_USER_AGENTS = [
	'GPTBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Anthropic-ai',
	'PerplexityBot',
	'CCBot',
	'Bytespider',
	'cohere-ai',
	'Diffbot',
	'FacebookBot'
];

export function createRobotsHandler(optionsOrConfig: SiteConfig | RobotsOptions): RequestHandler {
	const options: RobotsOptions =
		'config' in optionsOrConfig ? optionsOrConfig : { config: optionsOrConfig };
	const { config } = options;

	return async ({ url }) => {
		try {
			const isProdEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
			const isProd =
				options.isProduction ??
				(isProdEnv &&
					!url.hostname.includes('localhost') &&
					!url.hostname.includes('preview') &&
					!url.hostname.includes('staging'));

			const baseUrl = (config?.url || url?.origin || 'https://yaxa.vercel.app').replace(/\/$/, '');

			let body: string;

			if (!isProd && !options.isProduction) {
				// Non-production or preview deployment: protect against indexing
				body = `# Non-production environment: indexing disabled\nUser-agent: *\nDisallow: /\n`;
			} else if (config?.robots?.rules && config.robots.rules.length > 0) {
				// Custom defined rules
				body = config.robots.rules
					.map((rule) => {
						let ruleText = `User-agent: ${rule.userAgent}\n`;
						if (rule.allow) {
							ruleText += rule.allow.map((path) => `Allow: ${path}\n`).join('');
						}
						if (rule.disallow) {
							ruleText += rule.disallow.map((path) => `Disallow: ${path}\n`).join('');
						}
						return ruleText;
					})
					.join('\n');
			} else {
				// Standard production setup
				body = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /admin\nDisallow: /api/\n`;

				// AI Crawlers configuration
				if (options.aiCrawlers === 'disallow') {
					body += `\n# AI Training & Scraper Policies\n`;
					for (const bot of AI_USER_AGENTS) {
						body += `User-agent: ${bot}\nDisallow: /\n`;
					}
				}
			}

			// Append host & sitemap reference
			body += `\nHost: ${baseUrl}\nSitemap: ${baseUrl}/sitemap.xml\n`;

			return new Response(body, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Cache-Control': 'public, max-age=86400'
				}
			});
		} catch (err) {
			console.error('robots.txt handler error:', err);
			return new Response(`User-agent: *\nDisallow: /\n`, {
				headers: { 'Content-Type': 'text/plain; charset=utf-8' }
			});
		}
	};
}
