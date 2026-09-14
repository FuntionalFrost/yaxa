import type { RequestHandler } from '@sveltejs/kit';
import { computeProjectBadge, type SiteConfig } from './config';

export interface OgImageOptions {
	config?: SiteConfig;
}

export function generateOgSvg(params: {
	title: string;
	description?: string;
	siteName?: string;
	badge?: string;
	theme?: 'dark' | 'light';
	url?: string;
}): string {
	const isDark = params.theme !== 'light';
	const bgGradientStart = isDark ? '#121212' : '#fafafa';
	const bgGradientEnd = isDark ? '#1c1917' : '#f5f5f4';
	const cardBg = isDark ? 'rgba(24, 24, 27, 0.85)' : 'rgba(255, 255, 255, 0.9)';
	const cardBorder = isDark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(228, 228, 231, 0.9)';
	const titleColor = isDark ? '#fafafa' : '#09090b';
	const descColor = isDark ? '#a1a1aa' : '#52525b';
	const svelteFlame1 = '#ff3e00';
	const svelteFlame2 = '#ea580c';
	const metaColor = isDark ? '#71717a' : '#71717a';

	// Escape XML characters
	const escapeXml = (unsafe: string) =>
		unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');

	const safeTitle = escapeXml(params.title || 'Welcome');
	const safeDesc = escapeXml(params.description || 'Fast, beautiful, accessible web applications.');
	const safeSiteName = escapeXml(params.siteName || 'Yaxa');
	const safeBadge = params.badge ? escapeXml(params.badge) : null;
	const safeUrl = escapeXml(params.url ? params.url.replace(/^https?:\/\//, '') : 'yaxa.dev');
	const badgeWidth = safeBadge ? Math.max(90, safeBadge.length * 8.5 + 24) : 0;
	const badgeX = 840 - badgeWidth;

	return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradientStart}"/>
      <stop offset="100%" stop-color="${bgGradientEnd}"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${svelteFlame1}"/>
      <stop offset="100%" stop-color="${svelteFlame2}"/>
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${svelteFlame1}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${svelteFlame2}" stop-opacity="0.08"/>
    </linearGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="80"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>

  <!-- Glowing Orbs -->
  <circle cx="150" cy="120" r="280" fill="url(#glowGrad)" filter="url(#blurFilter)"/>
  <circle cx="1050" cy="500" r="300" fill="url(#glowGrad)" filter="url(#blurFilter)"/>

  <!-- Card Border and Container -->
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="${cardBg}" stroke="${cardBorder}" stroke-width="2"/>

  <!-- Top Bar: Logo & Badge -->
  <g transform="translate(120, 130)">
    <!-- Yaxa Svelte-Style Dual-Tone X Ribbon Icon -->
    <g transform="translate(0, -2) scale(0.44)">
      <!-- Outer Flame Track -->
      <path d="M24 24 L76 76" stroke="url(#brandGrad)" stroke-width="22" stroke-linecap="round"/>
      <path d="M76 24 L56 44 M44 56 L24 76" stroke="url(#brandGrad)" stroke-width="22" stroke-linecap="round"/>
      <!-- Inner White Core Track -->
      <path d="M24 24 L76 76" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <path d="M76 24 L58 42 M42 58 L24 76" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    </g>
    
    <!-- Site Name -->
    <text x="54" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="${titleColor}">${safeSiteName}</text>

    <!-- Badge -->
    ${
			safeBadge
				? `
    <rect x="${badgeX}" y="2" width="${badgeWidth}" height="32" rx="16" fill="rgba(255, 62, 0, 0.15)" stroke="rgba(255, 62, 0, 0.4)" stroke-width="1"/>
    <text x="${badgeX + badgeWidth / 2}" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#ff6a00" text-anchor="middle">${safeBadge}</text>
    `
				: ''
		}
  </g>

  <!-- Middle: Title & Description -->
  <g transform="translate(120, 250)">
    <text x="0" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="${titleColor}" letter-spacing="-0.03em">${safeTitle}</text>
    <text x="0" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="${descColor}" width="840">${safeDesc}</text>
  </g>

  <!-- Bottom: Domain and Decorative Accent Line -->
  <g transform="translate(120, 480)">
    <line x1="0" y1="0" x2="840" y2="0" stroke="${cardBorder}" stroke-width="1"/>
    <circle cx="6" cy="30" r="4" fill="${svelteFlame1}"/>
    <text x="20" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="${metaColor}">${safeUrl}</text>
  </g>
</svg>`;
}

export function createOgImageHandler(options?: OgImageOptions): RequestHandler {
	return async ({ url }) => {
		const title = url.searchParams.get('title') || options?.config?.title || 'Yaxa';
		const description =
			url.searchParams.get('description') ||
			options?.config?.description ||
			'Fast, beautiful, accessible UI components and SEO tools for SvelteKit.';
		const badge =
			url.searchParams.get('badge') ||
			(options?.config?.project ? computeProjectBadge(options.config.project) : undefined);
		const theme = (url.searchParams.get('theme') as 'dark' | 'light') || 'dark';
		const siteName = url.searchParams.get('site') || options?.config?.name || 'Yaxa';
		const siteUrl = options?.config?.url || url.origin;

		const svg = generateOgSvg({
			title,
			description,
			siteName,
			badge,
			theme,
			url: siteUrl
		});

		return new Response(svg, {
			headers: {
				'Content-Type': 'image/svg+xml; charset=utf-8',
				'Cache-Control': 'public, max-age=86400, s-maxage=86400'
			}
		});
	};
}
