import { createRobotsHandler } from '#lib/site/robots.js';
import { siteConfig } from '../../site.config';

export const GET = createRobotsHandler(siteConfig);
