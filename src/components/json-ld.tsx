interface JsonLdProps {
  /** A schema.org object (or `@graph` wrapper) to embed as JSON-LD. */
  data: Record<string, unknown>;
}

/**
 * Renders a schema.org JSON-LD block.
 * `<` is escaped so a stray `</script>` inside the data can't break out of the tag.
 */
export const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type='application/ld+json'
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be serialized into a script tag
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);
