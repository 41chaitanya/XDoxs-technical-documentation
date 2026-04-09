// Split markdown file into separate topics based on H2 headings

export interface Topic {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
}

export function splitMarkdownIntoTopics(markdown: string): Topic[] {
  const topics: Topic[] = [];
  
  // Split by H2 headings (##)
  const sections = markdown.split(/^## /gm);
  
  // First section is usually intro (before first H2)
  const intro = sections[0].trim();
  if (intro) {
    topics.push({
      id: 'intro',
      title: 'Introduction',
      slug: 'introduction',
      content: intro,
      order: 0
    });
  }
  
  // Process remaining sections (each starts with H2)
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
        order: i
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
