# XDoxs - Production-Level Documentation Platform

Fast, SEO-optimized documentation platform built with Astro.

## 🚀 Features

- ⚡ Lightning fast static site generation
- 🎯 SEO optimized (meta tags, sitemap, structured data)
- 📱 Fully responsive design
- 🎨 Beautiful UI with TailwindCSS
- 📝 Markdown/MDX support
- 🔍 Category-based organization
- 🏷️ Tag system
- 🌐 Open source

## 🛠️ Tech Stack

- **Astro** - Static site generator
- **TailwindCSS** - Styling
- **MDX** - Enhanced markdown
- **TypeScript** - Type safety

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
xdoxs/
├── src/
│   ├── content/
│   │   ├── config.ts          # Content collection schema
│   │   └── docs/              # Documentation files
│   │       ├── javascript/
│   │       ├── devops/
│   │       └── python/
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Base HTML layout
│   │   └── DocLayout.astro    # Documentation page layout
│   ├── components/
│   │   ├── Header.astro       # Site header
│   │   └── Sidebar.astro      # Documentation sidebar
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   └── docs/
│   │       └── [...slug].astro # Dynamic doc pages
│   └── styles/
│       └── global.css         # Global styles
├── public/
│   ├── favicon.svg
│   └── robots.txt
└── astro.config.mjs           # Astro configuration
```

## 📝 Adding Documentation

Create a new `.md` file in `src/content/docs/`:

```markdown
---
title: "Your Doc Title"
description: "Brief description"
category: "javascript"
tags: ["tag1", "tag2"]
author: "Your Name"
date: 2026-04-04
featured: true
---

# Your Content Here

Write your documentation...
```

## 🎨 Customization

- Edit `tailwind.config.mjs` for theme customization
- Modify `src/styles/global.css` for global styles
- Update `astro.config.mjs` for site configuration

## 🚀 Deployment

### Cloudflare Pages

```bash
npm run build
# Upload dist/ folder to Cloudflare Pages
```

### Vercel

```bash
vercel deploy
```

### Netlify

```bash
netlify deploy --prod
```

## 📊 Performance

- Lighthouse Score: 95+
- First Contentful Paint: <1s
- Time to Interactive: <1s

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://xdoxs.com/docs)
- [GitHub](https://github.com/yourusername/xdoxs)

---

Built with ❤️ using Astro
