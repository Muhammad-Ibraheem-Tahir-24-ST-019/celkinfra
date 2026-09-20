/**
 * Renders a schema.org graph as a single <script type="application/ld+json">.
 *
 * `<` is escaped so a value containing "</script>" cannot break out of the tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
