import { browser } from '$app/environment';
import { getContext, hasContext, setContext } from 'svelte';

export type TextDirection = 'ltr' | 'rtl';

export interface UseLocaleOptions {
	defaultLocale?: string;
	defaultDir?: TextDirection;
}

const RTL_LOCALES = new Set([
	'ar',
	'arc',
	'ckb',
	'dv',
	'fa',
	'ha',
	'he',
	'khw',
	'ks',
	'ku',
	'mzn',
	'pnb',
	'ps',
	'sd',
	'ug',
	'ur',
	'yi'
]);

const LOCALE_CONTEXT_KEY = Symbol('yaxa-locale-context');

export class LocaleStore {
	locale = $state<string>('en');
	dir = $state<TextDirection>('ltr');

	isRtl = $derived(this.dir === 'rtl');

	constructor(initialLocale: string = 'en', initialDir: TextDirection = 'ltr') {
		this.locale = initialLocale;
		this.dir = initialDir;

		if (browser) {
			const savedLocale = localStorage.getItem('yaxa-locale');
			const savedDir = localStorage.getItem('yaxa-dir') as TextDirection | null;

			if (savedLocale) {
				this.locale = savedLocale;
			} else if (typeof navigator !== 'undefined' && navigator.language) {
				this.locale = navigator.language.split('-')[0];
			}

			if (savedDir && ['ltr', 'rtl'].includes(savedDir)) {
				this.dir = savedDir;
			} else {
				this.dir = RTL_LOCALES.has(this.locale) ? 'rtl' : 'ltr';
			}

			this.syncDocumentAttributes();
		}
	}

	setLocale(newLocale: string) {
		this.locale = newLocale;
		const autoDir = RTL_LOCALES.has(newLocale.split('-')[0].toLowerCase()) ? 'rtl' : 'ltr';
		this.dir = autoDir;

		if (browser) {
			localStorage.setItem('yaxa-locale', newLocale);
			localStorage.setItem('yaxa-dir', autoDir);
			this.syncDocumentAttributes();
		}
	}

	setDir(newDir: TextDirection) {
		this.dir = newDir;
		if (browser) {
			localStorage.setItem('yaxa-dir', newDir);
			this.syncDocumentAttributes();
		}
	}

	toggleDir() {
		this.setDir(this.dir === 'rtl' ? 'ltr' : 'rtl');
	}

	syncDocumentAttributes() {
		if (browser && typeof document !== 'undefined') {
			document.documentElement.setAttribute('dir', this.dir);
			document.documentElement.setAttribute('lang', this.locale);
		}
	}

	formatCurrency(
		amount: number,
		currency: string = 'USD',
		options: Intl.NumberFormatOptions = {}
	): string {
		try {
			return new Intl.NumberFormat(this.locale, {
				style: 'currency',
				currency,
				...options
			}).format(amount);
		} catch {
			return `${currency} ${amount.toFixed(2)}`;
		}
	}

	formatNumber(value: number, options: Intl.NumberFormatOptions = {}): string {
		try {
			return new Intl.NumberFormat(this.locale, options).format(value);
		} catch {
			return String(value);
		}
	}

	formatDate(
		date: Date | string | number,
		options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
	): string {
		try {
			const timeMs =
				typeof date === 'number'
					? date
					: typeof date === 'string'
						? Date.parse(date)
						: date.getTime();
			return new Intl.DateTimeFormat(this.locale, options).format(timeMs);
		} catch {
			return String(date);
		}
	}

	formatRelativeTime(date: Date | string | number): string {
		try {
			const timeMs =
				typeof date === 'number'
					? date
					: typeof date === 'string'
						? Date.parse(date)
						: date.getTime();
			const diffInSeconds = Math.round((timeMs - Date.now()) / 1000);

			const rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' });

			const absSeconds = Math.abs(diffInSeconds);
			if (absSeconds < 60) return rtf.format(diffInSeconds, 'second');
			const diffInMinutes = Math.round(diffInSeconds / 60);
			if (Math.abs(diffInMinutes) < 60) return rtf.format(diffInMinutes, 'minute');
			const diffInHours = Math.round(diffInMinutes / 60);
			if (Math.abs(diffInHours) < 24) return rtf.format(diffInHours, 'hour');
			const diffInDays = Math.round(diffInHours / 24);
			if (Math.abs(diffInDays) < 30) return rtf.format(diffInDays, 'day');
			const diffInMonths = Math.round(diffInDays / 30);
			if (Math.abs(diffInMonths) < 12) return rtf.format(diffInMonths, 'month');
			const diffInYears = Math.round(diffInMonths / 12);
			return rtf.format(diffInYears, 'year');
		} catch {
			return String(date);
		}
	}
}

/** Fallback client-only singleton */
export const localeStore = new LocaleStore();

/**
 * Initializes and binds a new SSR-safe LocaleStore to the Svelte component context.
 * Best called in `+layout.svelte`.
 */
export function setLocaleContext(
	initialLocale: string = 'en',
	initialDir: TextDirection = 'ltr'
): LocaleStore {
	const store = new LocaleStore(initialLocale, initialDir);
	setContext(LOCALE_CONTEXT_KEY, store);
	return store;
}

/**
 * Retrieves the SSR-safe LocaleStore from context if available, falling back to the singleton.
 */
export function getLocaleContext(): LocaleStore {
	try {
		if (hasContext(LOCALE_CONTEXT_KEY)) {
			return getContext<LocaleStore>(LOCALE_CONTEXT_KEY);
		}
	} catch {
		// Fallback when called outside component lifecycle
	}
	return localeStore;
}

/**
 * Reactive Svelte 5 Rune composable for locale management, RTL direction, and international formatting.
 */
export function useLocale(options: UseLocaleOptions = {}) {
	const store = getLocaleContext();

	if (options.defaultLocale && !store.locale) {
		store.setLocale(options.defaultLocale);
	}
	if (options.defaultDir && !store.dir) {
		store.setDir(options.defaultDir);
	}

	return {
		get locale() {
			return store.locale;
		},
		get dir() {
			return store.dir;
		},
		get isRtl() {
			return store.isRtl;
		},
		store,
		setLocale: (loc: string) => store.setLocale(loc),
		setDir: (dir: TextDirection) => store.setDir(dir),
		toggleDir: () => store.toggleDir(),
		formatCurrency: (amount: number, currency?: string, opts?: Intl.NumberFormatOptions) =>
			store.formatCurrency(amount, currency, opts),
		formatNumber: (val: number, opts?: Intl.NumberFormatOptions) => store.formatNumber(val, opts),
		formatDate: (date: Date | string | number, opts?: Intl.DateTimeFormatOptions) =>
			store.formatDate(date, opts),
		formatRelativeTime: (date: Date | string | number) => store.formatRelativeTime(date)
	};
}

/**
 * Shorthand reactive rune for Right-to-Left (RTL) direction toggling and state.
 */
export function useRtl() {
	const store = getLocaleContext();
	return {
		get isRtl() {
			return store.isRtl;
		},
		get dir() {
			return store.dir;
		},
		toggle: () => store.toggleDir(),
		setDir: (d: TextDirection) => store.setDir(d)
	};
}
