import { createSitemapXslHandler } from '#lib/site/sitemap-xsl.js';
import { siteConfig } from '../../site.config';

export const GET = createSitemapXslHandler({ config: siteConfig });
