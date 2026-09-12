/**
 * Email Utility Functions & HTML Sanitization
 */

/**
 * Sanitizes and normalizes email HTML content:
 * - Strips external editor data-* attributes (e.g. data-path-to-node, data-index-in-node)
 * - Removes inline font-size properties from style attributes so typography is 100% uniform
 * - Unwraps empty <span> tags
 * - Cleans up empty paragraphs (<p></p>, <p><br></p>, <p>&nbsp;</p>)
 * - Preserves semantic formatting (headings, lists, bold, italics, links)
 */
export function sanitizeEmailHtml(html: string): string {
  if (!html) return '';
  return html
    // Remove all data-* attributes (e.g. data-path-to-node, data-index-in-node)
    .replace(/\s+data-[a-z0-9_-]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove font-size from inline style attributes
    .replace(/\s*style="([^"]*)"/gi, (_, styleContent) => {
      const cleaned = styleContent
        .replace(/font-size\s*:\s*[^;]+;?/gi, '')
        .trim();
      return cleaned ? ` style="${cleaned}"` : '';
    })
    .replace(/\s*style='([^']*)'/gi, (_, styleContent) => {
      const cleaned = styleContent
        .replace(/font-size\s*:\s*[^;]+;?/gi, '')
        .trim();
      return cleaned ? ` style='${cleaned}'` : '';
    })
    // Unwrap plain spans with no attributes
    .replace(/<span>([\s\S]*?)<\/span>/gi, '$1')
    // Remove completely empty paragraphs
    .replace(/<p>\s*(?:&nbsp;|<br\s*\/?>|\s*)*<\/p>/gi, '')
    .trim();
}
