import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getDocItemBySlug } from '../_data/docs-nav';
import type { Component } from 'svelte';

const SECTION_MODULES = import.meta.glob<{ default: Component }>('../_sections/Doc*.svelte');

function resolveSectionLoader(slug: string): () => Promise<{ default: Component }> {
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
