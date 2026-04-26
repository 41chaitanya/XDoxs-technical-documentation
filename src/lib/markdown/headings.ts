// Extract headings from markdown content for TOC

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    headings.push({ depth, slug, text });
  }

  return headings;
}

export function extractH2Headings(content: string): Array<{ slug: string; text: string }> {
  const allHeadings = extractHeadings(content);
  return allHeadings
    .filter(h => h.depth === 2)
    .map(h => ({ slug: h.slug, text: h.text }));
}
