/**
 * schema.org structured data for ARCHIE.
 *
 * Kept small on purpose: enough for search engines to understand what the site
 * is and to wire up the sitelinks search box, without re-serializing the game
 * catalog into the HTML.
 */

export const SITE_URL = 'https://archie.findquinn.com';

const SITE_DESCRIPTION =
  'Search and discover 500+ games and tools in the Archipelago multi-world randomizer ecosystem. Filter instantly by status, platform, and emulator.';

interface HomeStructuredDataOptions {
  readonly gameCount: number;
  readonly toolCount: number;
}

export const homeStructuredData = ({ gameCount, toolCount }: HomeStructuredDataOptions): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'ARCHIE',
      alternateName: 'ARCHIE - Archipelago Multi-Game Randomizer Directory',
      description: SITE_DESCRIPTION,
      inLanguage: 'en-US',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'CollectionPage',
      '@id': `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: 'ARCHIE - Archipelago Multi-Game Randomizer Directory',
      description: SITE_DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en-US',
      about: {
        '@type': 'Thing',
        name: 'Archipelago multi-world randomizer',
        sameAs: 'https://archipelago.gg',
      },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Archipelago games and tools',
        numberOfItems: gameCount + toolCount,
      },
    },
  ],
});

export const breadcrumbStructuredData = (name: string, path: string): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ARCHIE', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name, item: `${SITE_URL}${path}` },
  ],
});
