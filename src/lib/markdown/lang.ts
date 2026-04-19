// Extract language blocks from markdown content

export function extractLangBlocks(content: string): { en: string; hi: string } {
  const enTag = ':::en';
  const hiTag = ':::hi';
  const closeTag = ':::';

  const enStart = content.indexOf(enTag);
  const hiStart = content.indexOf(hiTag);

  if (enStart === -1 && hiStart === -1) {
    // No language blocks — treat whole content as English
    const clean = content.replace(/^---[\s\S]*?---\n?/, '').trim();
    return { en: clean, hi: '' };
  }

  let enContent = '';
  if (enStart !== -1) {
    const afterEnTag = content.indexOf('\n', enStart) + 1;
    const enEnd = content.indexOf(closeTag, afterEnTag);
    enContent = enEnd !== -1 ? content.slice(afterEnTag, enEnd).trim() : '';
  }

  let hiContent = '';
  if (hiStart !== -1) {
    const afterHiTag = content.indexOf('\n', hiStart) + 1;
    const hiEnd = content.indexOf(closeTag, afterHiTag);
    hiContent = hiEnd !== -1 ? content.slice(afterHiTag, hiEnd).trim() : '';
  }

  return { en: enContent, hi: hiContent };
}
