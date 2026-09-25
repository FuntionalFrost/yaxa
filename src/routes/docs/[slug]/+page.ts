import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getDocItemBySlug } from '../_data/docs-nav';
import type { Component } from 'svelte';

const SECTION_MODULES = import.meta.glob<{ default: Component }>('../_sections/Doc*.svelte');

const SLUG_TO_SECTION: Record<string, string> = {
	intro: '../_sections/DocIntro.svelte',
	install: '../_sections/DocInstall.svelte',
	config: '../_sections/DocConfig.svelte',
	theming: '../_sections/DocTheming.svelte',
	'static-sites': '../_sections/DocStaticSites.svelte',
	blocks: '../_sections/DocBlocks.svelte',
	'seo-og': '../_sections/DocSeoOg.svelte',
	'seo-robots': '../_sections/DocSeoRobots.svelte',
	'saas-suite': '../_sections/DocSaasSuite.svelte',
	'gating-storage': '../_sections/DocGatingStorage.svelte',
	'admin-suite': '../_sections/DocAdminSuite.svelte',
	'legal-suite': '../_sections/DocLegal.svelte',
	'ai-primitives': '../_sections/DocAi.svelte',
	charts: '../_sections/DocCharts.svelte',
	'comp-buttons': '../_sections/DocButtons.svelte',
	'comp-forms': '../_sections/DocForms.svelte',
	'advanced-forms': '../_sections/DocAdvancedForms.svelte',
	'comp-overlays': '../_sections/DocOverlays.svelte'
};

function resolveSectionLoader(slug: string): () => Promise<{ default: Component }> {
	const directPath = SLUG_TO_SECTION[slug];
	if (directPath && SECTION_MODULES[directPath]) {
		return SECTION_MODULES[directPath];
	}

	const normalized = slug.replace(/^comp-/, '').replace(/-suite$/, '');
	const pascal = normalized
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

	const matchedPath = Object.keys(SECTION_MODULES).find((path) => {
		const filename = path.split('/').pop()?.replace('.svelte', '') || '';
		return (
			filename.toLowerCase() === `doc${pascal.toLowerCase()}` ||
			filename.toLowerCase() === `doc${slug.replace(/-/g, '').toLowerCase()}` ||
			filename.toLowerCase() === `doc${pascal.toLowerCase()}suite`
		);
	});

	if (matchedPath && SECTION_MODULES[matchedPath]) {
		return SECTION_MODULES[matchedPath];
	}

	return SECTION_MODULES['../_sections/DocIntro.svelte'];
}

export const load: PageLoad = async ({ params }) => {
	const doc = getDocItemBySlug(params.slug);

	if (!doc) {
		throw error(404, `Documentation page "${params.slug}" not found`);
	}

	const loader = resolveSectionLoader(params.slug);
	const mod = await loader();

	return {
		doc,
		slug: params.slug,
		title: `${doc.label} — Yaxa Documentation`,
		description: doc.description,
		component: mod.default
	};
};
