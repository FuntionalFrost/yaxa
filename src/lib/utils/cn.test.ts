import { describe, it, expect } from 'vitest';
import { cn, tv } from './cn';

describe('cn utility', () => {
	it('merges class names and handles conditional classes', () => {
		const isEnabled = true;
		const isDisabled = false;
		const result = cn(
			'px-4 py-2',
			isEnabled && 'bg-red-500',
			isDisabled && 'text-white',
			null,
			undefined
		);
		expect(result).toBe('px-4 py-2 bg-red-500');
	});

	it('resolves conflicting Tailwind CSS classes correctly', () => {
		const result = cn('px-4 px-8 text-sm text-lg');
		expect(result).toBe('px-8 text-lg');
	});
});

describe('tv utility', () => {
	it('generates variant classes accurately', () => {
		const button = tv({
			base: 'rounded font-bold',
			variants: {
				color: {
					primary: 'bg-blue-500 text-white',
					secondary: 'bg-gray-500 text-black'
				},
				size: {
					sm: 'text-sm p-1',
					md: 'text-base p-2'
				}
			},
			defaultVariants: {
				color: 'primary',
				size: 'md'
			}
		});

		expect(button()).toContain('rounded font-bold bg-blue-500 text-white text-base p-2');
		expect(button({ color: 'secondary', size: 'sm' })).toContain(
			'rounded font-bold bg-gray-500 text-black text-sm p-1'
		);
	});
});
