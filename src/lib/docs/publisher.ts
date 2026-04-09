import fs from 'fs/promises';
import path from 'path';
import type { DocDraft } from '../db/models';

export async function publishDocToStatic(draft: DocDraft) {
  try {
    // Create category directory if it doesn't exist
    const categoryDir = path.join(process.cwd(), 'src', 'content', 'docs', draft.category);
    await fs.mkdir(categoryDir, { recursive: true });
    
    // Create markdown file
    const filePath = path.join(categoryDir, `${draft.slug}.md`);
    
    // Generate frontmatter
    const frontmatter = `---
title: "${draft.title}"
description: "${draft.description || ''}"
date: ${draft.publishedAt ? new Date(draft.publishedAt).toISOString() : new Date().toISOString()}
author: "${draft.instructorEmail}"
category: "${draft.category}"
tags: [${draft.tags.map(tag => `"${tag}"`).join(', ')}]
---

`;
    
    // Write file with full content
    const content = frontmatter + draft.content;
    await fs.writeFile(filePath, content, 'utf-8');
    
    console.log(`✅ Published: ${filePath}`);
    return { success: true, filePath };
  } catch (error) {
    console.error('❌ Publish error:', error);
    throw error;
  }
}

export async function unpublishDoc(category: string, slug: string) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'docs', category, `${slug}.md`);
    await fs.unlink(filePath);
    console.log(`✅ Unpublished: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Unpublish error:', error);
    throw error;
  }
}
