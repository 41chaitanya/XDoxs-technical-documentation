import { parse, Renderer } from 'marked';
import hljs from 'highlight.js';

let mcqCounter = 0;

// Parse :::mcq blocks into interactive HTML
function processMcqBlocks(markdown: string): string {
  return markdown.replace(/:::mcq\n([\s\S]*?):::/g, (_, block) => {
    const lines = block.trim().split('\n');
    
    const questionLine = lines.find((l: string) => l.startsWith('question:'));
    const answerLine = lines.find((l: string) => l.startsWith('answer:'));
    const explanationLine = lines.find((l: string) => l.startsWith('explanation:'));
    const optionLines = lines.filter((l: string) => /^- [A-D]\)/.test(l));

    if (!questionLine || !answerLine || optionLines.length === 0) return block;

    const question = questionLine.replace('question:', '').trim();
    const correctAnswer = answerLine.replace('answer:', '').trim();
    const explanation = explanationLine ? explanationLine.replace('explanation:', '').trim() : '';

    const id = `mcq-${++mcqCounter}`;

    const optionsHtml = optionLines.map((line: string) => {
      const match = line.match(/^- ([A-D])\) (.+)$/);
      if (!match) return '';
      const [, letter, text] = match;
      return `
        <label class="mcq-option" data-letter="${letter}">
          <input type="radio" name="${id}" value="${letter}" />
          <span class="mcq-letter">${letter}</span>
          <span class="mcq-text">${text}</span>
        </label>`;
    }).join('');

    return `
<div class="mcq-block" id="${id}" data-answer="${correctAnswer}">
  <p class="mcq-question">${question}</p>
  <div class="mcq-options">${optionsHtml}</div>
  <button class="mcq-submit" onclick="checkMcq('${id}')">Check Answer</button>
  <div class="mcq-result" style="display:none">
    <div class="mcq-feedback"></div>
    ${explanation ? `<div class="mcq-explanation">${explanation}</div>` : ''}
  </div>
</div>`;
  });
}

// Process custom inline syntax before markdown parsing
function processCustomSyntax(markdown: string): string {
  return markdown
    // ==highlight== → yellow background
    .replace(/==(.+?)==/g, '<mark class="doc-highlight">$1</mark>')
    // ++underline++ → underline
    .replace(/\+\+(.+?)\+\+/g, '<u>$1</u>')
    // {accent:text} → theme-aware color using CSS variable
    .replace(/\{accent:(.*?)\}/g, '<span class="doc-color-accent">$1</span>');
}

// Configure marked for better rendering
export async function renderMarkdown(markdown: string): Promise<string> {
  mcqCounter = 0;

  // Process custom syntax + MCQ blocks before markdown parsing
  const processedMarkdown = processCustomSyntax(processMcqBlocks(markdown));
  const renderer = new Renderer();

  // Add IDs to headings for sidebar scroll navigation
  renderer.heading = function({ text, depth }) {
    const slug = text
      .toLowerCase()
      .replace(/<[^>]+>/g, '')       // strip HTML tags
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
  };

  renderer.code = function({ text, lang }) {
    const code = String(text || '');
    const language = String(lang || 'plaintext');
    const languageLabel = language.charAt(0).toUpperCase() + language.slice(1);
    
    // Generate unique ID for copy functionality
    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
    
    if (language && hljs.getLanguage(language)) {
      try {
        const highlighted = hljs.highlight(code, { language }).value;
        return `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-language">${languageLabel}</span>
    <button class="code-copy-btn" onclick="copyCode('${codeId}')" title="Copy code">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span class="copy-text">Copy</span>
    </button>
  </div>
  <pre><code id="${codeId}" class="hljs language-${language}">${highlighted}</code></pre>
</div>`;
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
    
    return `
<div class="code-block-wrapper">
  <div class="code-block-header">
    <span class="code-language">${languageLabel}</span>
    <button class="code-copy-btn" onclick="copyCode('${codeId}')" title="Copy code">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span class="copy-text">Copy</span>
    </button>
  </div>
  <pre><code id="${codeId}" class="hljs">${escaped}</code></pre>
</div>`;
  };
  
  // Configure marked options
  const html = await parse(processedMarkdown, {
    gfm: true, // GitHub Flavored Markdown
    breaks: false, // Don't convert single \n to <br>
    renderer: renderer,
    async: false,
  });
  
  return String(html);
}
