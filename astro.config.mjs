import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://d3ieh8o19x82n4.cloudfront.net',
  output: 'server', // Server mode with selective prerendering
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
    mdx(),
    sitemap({
      // Exclude admin/instructor/auth pages from sitemap
      filter: (page) =>
        !page.includes('/admin/') &&
        !page.includes('/instructor/') &&
        !page.includes('/login') &&
        !page.includes('/register') &&
        !page.includes('/test-auth') &&
        !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  // Disable dev toolbar to avoid injected links affecting Lighthouse SEO audits
  devToolbar: { enabled: false },
  // Build optimizations
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Enable CSS code splitting for smaller payloads
      cssCodeSplit: true,
      // Aggressive minification
      minify: 'esbuild',
      // Optimize chunk size
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  },
});

// Architecture:
// - Homepage, login, register, 404 → prerender: true (SSG)
// - Doc pages (/docs/*) → prerender: false (SSR — fetched from MongoDB at runtime)
// - Instructor / Admin pages → Server-rendered (Dynamic, auth-gated)
// - API routes (/api/*) → Server-side (Database access)
