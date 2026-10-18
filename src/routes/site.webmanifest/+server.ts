import { createManifestHandler } from '#lib/site/manifest.js';
import { siteConfig } from '../../site.config';

export const GET = createManifestHandler(siteConfig);
