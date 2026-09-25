/**
 * Serialize JSON-LD for <script type="application/ld+json">.
 * JSON.stringify leaves "</script>" intact, which would let a tool/post name
 * break out of the script tag; escaping "<" keeps the JSON valid and inert.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
