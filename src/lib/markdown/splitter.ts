// Split markdown file into separate topics based on H2 headings

export interface Topic {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
}

export function splitMarkdownIntoTopics(markdown: string): Topic[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const topics: Topic[] = [];
  
  // Split by H2 headings (##)
  const sections = trimmed.split(/^## /gm);
  
  // If there are no ## headings, wrap the entire content as a single topic
  if (sections.length <= 1) {
    // Try to extract a title from the first # heading, or use a default
    const h1Match = trimmed.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : 'Introduction';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    topics.push({
      id: 'topic-1',
      title,
      slug,
      content: trimmed,
      order: 0,
    });
    return topics;
  }

  // Content before the first ## heading — include as "Introduction" topic if non-trivial
  const preamble = sections[0].trim();
  if (preamble && preamble.length > 20) {
    const h1Match = preamble.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : 'Introduction';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    topics.push({
      id: 'topic-0',
      title,
      slug,
      content: preamble,
      order: 0,
    });
  }

  // Process all ## sections
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    if (title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      topics.push({
        id: `topic-${i}`,
        title,
        slug,
        content: `## ${title}\n\n${content}`,
        order: topics.length
      });
    }
  }
  
  return topics;
}

// Extract headings from a topic's content for TOC
export function extractHeadingsFromTopic(content: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ depth: number; slug: string; text: string }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    headings.push({ depth, slug, text });
  }

  return headings;
}
