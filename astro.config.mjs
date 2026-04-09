import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://xdoxs.com',
  output: 'server', // Server mode with selective prerendering
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    mdx(),
    sitemap()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});

// Architecture:
// - Public pages (/, /docs/*) → prerender: true (SSG - Fast!)
// - Instructor pages (/instructor/*) → Server-rendered (Dynamic)
// - API routes (/api/*) → Server-side (Database access)
