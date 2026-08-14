import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/structured-data';

/**
 * The directory is a single-page app: every game lives behind client-side
 * filtering on `/`, so there are no per-game URLs to enumerate here. This lists
 * the three real routes and nothing else.
 */

// The changelog is the only page whose content changes independently of a
// deploy, so it is the only one where lastModified says something true. The
// other routes omit it rather than claim the build time as a content edit.
const changelogLastModified = (): Date | undefined => {
  try {
    return statSync(join(process.cwd(), 'CHANGELOG.md')).mtime;
  } catch {
    return undefined;
  }
};

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: `${SITE_URL}/`,
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: `${SITE_URL}/changelog`,
    lastModified: changelogLastModified(),
    changeFrequency: 'weekly',
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/feedback`,
    changeFrequency: 'monthly',
    priority: 0.3,
  },
];

export default sitemap;
