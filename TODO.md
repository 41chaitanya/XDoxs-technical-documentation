# XDoxs — Task List

## ✅ Done

- Auth system (JWT, bcrypt, HTTP-only cookies)
- Role-based access: super_admin, instructor, student
- Login / Register pages
- MongoDB connection + models (users, doc_drafts, published_docs)
- Seed script for test users
- OKLCH theme system (8 themes, localStorage persistence)
- Theme selector in header (circular dropdown)
- Header: logo, nav, profile dropdown, login button
- Landing page (hero, categories, Sheryians branding)
- 3-column doc layout (sidebar, content, TOC)
- Roadmap-style TOC with scroll highlighting
- Instructor dashboard (stats, doc list, delete, shows unpublished docs)
- Upload page — TWO MODES:
  - Mode 1: Upload full .md file (auto-splits by ##)
  - Mode 2: Add single topic to new/existing doc
- Markdown splitter (splits by `##` into topics)
- Topic-based preview with sidebar navigation
- Markdown rendering with highlight.js (fixed marked v17 API)
- Admin dashboard (pending list, all docs, stats)
- Admin review page (topic preview, approve/reject modal)
- Approve API → updates status + calls publisher
- Reject API → saves feedback to doc_draft (shown on instructor dashboard)
- Unpublish API → deletes .md file + resets status to draft
- Publisher → writes approved doc to `src/content/docs/[cat]/[slug].md`
- FULL EDITOR PAGE `/instructor/docs/edit/[id]`:
  - 3-column layout (topics sidebar, editor/preview, metadata panel)
  - Edit mode: Notion-style contenteditable with toolbar (H2, H3, bold, italic, code, lists, blockquote, hr)
  - Preview mode: exact public render with syntax highlighting
  - Topic reordering (up/down arrows)
  - Add/delete topics
  - Auto-save (debounced 1s)
  - Manual save button
  - Submit for review button
  - Metadata editing (description, tags, category)

---

## ✅ Recently Completed

- Drag-and-drop topic reordering in editor (replaced arrow buttons)
- Topic hover effects (text glow with text-shadow)
- Active topic styling (left border only, no background)
- Delete button (✕) on hover for topics
- Dashboard "Edit" link (replaced old "Preview" link)
- Removed old preview directory
- TOPIC-BASED PUBLIC DOCS:
  - Publisher now creates separate files for each topic
  - Public docs show topic navigation in left sidebar
  - Each topic is a separate page with prev/next navigation
  - Structure: `/docs/[category]/[docSlug]/[topicNumber]-[topicSlug].md`

---

## ⚠️ Important Notes

- After admin approves docs, RESTART dev server to see published docs
- Old published docs need to be unpublished and re-approved to use new topic structure
- Current published doc (javascript-complete-guide) was removed - needs re-approval

---

## ❌ Not Done

- [ ] Student dashboard + personal doc creation (no publish to main site)

- [ ] Search across published docs

- [ ] 404 and error pages

- [ ] Loading states / skeleton screens on dashboards

- [ ] Home page category links (currently hardcoded to non-existent `/docs/javascript/arrays`)
