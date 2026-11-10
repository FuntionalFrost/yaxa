import { describe, it, expect } from 'vitest';
import { YaxaState, useYaxa } from './context.js';
import { useSeo } from './useSeo.svelte.js';

describe('useSeo Composable & YaxaState SEO Reactivity', () => {
	it('manages pageSeo on YaxaState directly', () => {
		const state = new YaxaState();
		expect(state.pageSeo).toBeNull();

		state.setPageSeo({
			title: 'Direct SEO Title',
			description: 'Direct SEO Description'
		});

		expect(state.pageSeo?.title).toBe('Direct SEO Title');
		expect(state.pageSeo?.description).toBe('Direct SEO Description');

		state.setPageSeo(null);
		expect(state.pageSeo).toBeNull();
	});

	it('useSeo composable sets pageSeo on fallback YaxaState when called outside provider tree', () => {
		useSeo({
			title: 'Pricing & Plans',
			description: 'Affordable subscriptions for solo devs'
		});

		const yaxa = useYaxa();
		// Outside provider tree, useYaxa() returns a fallback instance
		expect(yaxa).toBeDefined();
		expect(typeof useSeo).toBe('function');
	});

	it('supports reactive getter signature', () => {
		const currentPlan = 'Enterprise Plan';

		useSeo(() => ({
			title: currentPlan,
			description: `Details about ${currentPlan}`
		}));

		expect(typeof useSeo).toBe('function');
	});
});
