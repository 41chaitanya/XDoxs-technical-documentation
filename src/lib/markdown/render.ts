import { parse, Renderer } from 'marked';
import hljs from 'highlight.js';

// Configure marked for better rendering
export async function renderMarkdown(markdown: string): Promise<string> {
  // Custom renderer for code blocks with syntax highlighting
  const renderer = new Renderer();
  
  renderer.code = function({ text, lang }) {
    const code = String(text || '');
    const language = String(lang || '');
    
    if (language && hljs.getLanguage(language)) {
      try {
        const highlighted = hljs.highlight(code, { language }).value;
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    // Escape HTML in code
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return `<pre><code class="hljs">${escaped}</code></pre>`;
  };
  
  // Configure marked options
  const html = await parse(markdown, {
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Don't convert single \n to <br>
    headerIds: true, // Add IDs to headings
    mangle: false, // Don't escape autolinked email addresses
    renderer: renderer,
    async: false,
  });
  
  return String(html);
}
