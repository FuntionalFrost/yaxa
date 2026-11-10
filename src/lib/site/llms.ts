import type { RequestHandler } from '@sveltejs/kit';
import type { SiteConfig } from './config.js';

export interface LlmsLink {
	title: string;
	url: string;
	description?: string;
}

export interface LlmsSection {
	title: string;
	description?: string;
	links: LlmsLink[];
}

export interface LlmsTxtOptions {
	config: SiteConfig;
	sections?: LlmsSection[];
	notes?: string[];
}

/**
 * Generates an llms.txt standard markdown document (https://llmstxt.org/)
 * providing structured, token-efficient context for AI search engines (Perplexity, ChatGPT, Claude, Cursor).
 */
export function generateLlmsTxt(optionsOrConfig: SiteConfig | LlmsTxtOptions): string {
	const options: LlmsTxtOptions =
		'config' in optionsOrConfig ? optionsOrConfig : { config: optionsOrConfig };
	const { config, sections = [], notes = [] } = options;
	const baseUrl = (config.url || '').replace(/\/$/, '');

	let text = `# ${config.title || config.name}\n\n`;
	if (config.description) {
		text += `> ${config.description}\n\n`;
	}

	if (sections.length > 0) {
		for (const section of sections) {
			text += `## ${section.title}\n\n`;
			if (section.description) {
				text += `${section.description}\n\n`;
			}
			for (const link of section.links) {
				const fullUrl = link.url.startsWith('http') ? link.url : `${baseUrl}${link.url}`;
				const desc = link.description ? `: ${link.description}` : '';
				text += `- [${link.title}](${fullUrl})${desc}\n`;
			}
			text += '\n';
		}
	} else {
		text += `## Overview\n\n`;
		text += `- [Homepage](${baseUrl}): Official website\n`;
		if (config.project?.repositoryUrl) {
			text += `- [Source Repository](${config.project.repositoryUrl}): Project source code and issues\n`;
		}
		text += '\n';
	}

	if (notes.length > 0) {
		text += `## Optional\n\n`;
		for (const note of notes) {
			text += `- ${note}\n`;
		}
		text += '\n';
	}

	return text.trimEnd() + '\n';
}

/**
 * Creates a SvelteKit RequestHandler for serving /llms.txt.
 * Compatible with pure static site generation (@sveltejs/adapter-static) via `export const prerender = true`.
 */
export function createLlmsTxtHandler(optionsOrConfig: SiteConfig | LlmsTxtOptions): RequestHandler {
	return async () => {
		const body = generateLlmsTxt(optionsOrConfig);
		return new Response(body, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	};
}
