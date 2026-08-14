import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/structured-data';

/**
 * Everything public is crawlable. `/api` is disallowed because those routes
 * return JSON and accept form posts — there is nothing there to index, and the
 * feedback endpoint should not be reachable from a crawl.
 */
const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: '/api/',
  },
  sitemap: `${SITE_URL}/sitemap.xml`,
  host: SITE_URL,
});

export default robots;
