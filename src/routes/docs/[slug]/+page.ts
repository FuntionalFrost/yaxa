import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getDocItemBySlug } from '../_data/docs-nav';
import type { Component } from 'svelte';

const SECTION_LOADERS: Record<string, () => Promise<{ default: Component }>> = {
	intro: () => import('../_sections/DocIntro.svelte'),
	install: () => import('../_sections/DocInstall.svelte'),
	config: () => import('../_sections/DocConfig.svelte'),
	'static-sites': () => import('../_sections/DocStaticSites.svelte'),
	blocks: () => import('../_sections/DocBlocks.svelte'),
	'seo-og': () => import('../_sections/DocSeoOg.svelte'),
	'seo-robots': () => import('../_sections/DocSeoRobots.svelte'),
	'comp-buttons': () => import('../_sections/DocButtons.svelte'),
	'comp-forms': () => import('../_sections/DocForms.svelte'),
	'comp-overlays': () => import('../_sections/DocOverlays.svelte'),
	'saas-suite': () => import('../_sections/DocSaasSuite.svelte'),
	'gating-storage': () => import('../_sections/DocGatingStorage.svelte'),
	'admin-suite': () => import('../_sections/DocAdminSuite.svelte'),
	'legal-suite': () => import('../_sections/DocLegal.svelte')
};

export const load: PageLoad = async ({ params }) => {
	const doc = getDocItemBySlug(params.slug);

	if (!doc) {
		throw error(404, `Documentation page "${params.slug}" not found`);
	}

	const loader = SECTION_LOADERS[params.slug] ?? SECTION_LOADERS.intro;
	const mod = await loader();

	return {
		doc,
		slug: params.slug,
		title: `${doc.label} — Yaxa Documentation`,
		description: doc.description,
		component: mod.default
	};
};
