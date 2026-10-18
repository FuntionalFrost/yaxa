import { createOgImageHandler } from '#lib/site/og.js';
import { siteConfig } from '../../../site.config';

export const GET = createOgImageHandler({ config: siteConfig });
