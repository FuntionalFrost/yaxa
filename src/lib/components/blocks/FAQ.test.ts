import { describe, it, expect } from 'vitest';
import { faqVariants } from './FAQ.svelte';
import FAQ from './FAQ.svelte';
import { renderComponent } from '#lib/testing/index.js';

describe('FAQ Block', () => {
	it('generates default variant classes', () => {
		const classes = faqVariants();
		expect(classes).toContain('w-full');
		expect(classes).toContain('max-w-3xl');
	});

	it('renders FAQ and injects Schema.org FAQPage json-ld when enabled', () => {
		const items = [
			{ id: 1, question: 'How does it work?', answer: 'It works seamlessly with Svelte 5.' }
		];
		const { cleanup, target } = renderComponent(FAQ, {
			items,
			enableSchema: true
		});

		expect(target.textContent).toContain('How does it work?');
		expect(target.textContent).toContain('Frequently Asked Questions');

		const scriptTag = document.querySelector('head script[type="application/ld+json"]');
		if (scriptTag) {
			const json = JSON.parse(scriptTag.textContent || '{}');
			expect(json['@type']).toBe('FAQPage');
			expect(json.mainEntity[0].name).toBe('How does it work?');
		}

		cleanup();
	});
});
