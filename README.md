# XDoxs — Local Dev Setup

A documentation platform built with Astro, MongoDB, and JWT auth. Instructors upload docs, admins review and publish them.

---

## Prerequisites

- Node.js `>= 22.12.0`
- MongoDB running locally (or a MongoDB Atlas URI)

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd xdoxs
npm install
```

---

## 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

`.env` values:

```env
# Local MongoDB (default)
MONGODB_URI=mongodb://localhost:27017/xdoxs

# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xdoxs

# JWT secret — change this to anything for local dev
JWT_SECRET=your-local-dev-secret

# Gemini API Key (Optional - for AI documentation generation)
# Get free API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here
```

> **Note**: The Gemini API key is optional. If not configured, the AI generation feature will show an error message with setup instructions.

---

## 3. Seed Test Users

Run the seed script to create the default test accounts:

```bash
npm run seed
```

This creates three users (all with password `ramram`):

| Role        | Email                    | Password |
|-------------|--------------------------|----------|
| Super Admin | admin@xdoxs.com          | ramram   |
| Instructor  | instructor@xdoxs.com     | ramram   |
| Student     | student@xdoxs.com        | ramram   |

> Safe to run multiple times — skips existing users.

---

## 4. Start Dev Server

```bash
npm run dev
```

App runs at `http://localhost:4321`

---

## 5. Key Routes

| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/instructor/dashboard` | Instructor view (requires instructor role) |
| `/instructor/docs/upload` | Upload or add a doc topic |
| `/instructor/docs/ai-generate` | 🤖 AI-powered documentation generation |
| `/admin/dashboard` | Admin review queue (requires super_admin role) |
| `/docs/[category]/[slug]` | Published public docs |

---

## 6. 🤖 AI Documentation Generation (New!)

XDoxs now includes an AI-powered documentation generator using Google's Gemini API.

### Features:
- Interactive chat interface to describe what you want
- Real-time markdown preview
- Bilingual support (English + Hinglish)
- Create new docs or append to existing ones
- Free to use with Gemini API

### Setup:
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file as `GEMINI_API_KEY`
3. Access via "🤖 Generate with AI" button on instructor dashboard

📖 **Full Guide**: See [AI-GENERATION-GUIDE.md](./AI-GENERATION-GUIDE.md) for detailed instructions and examples.

---

## 7. Workflow Overview

1. **Instructor** logs in → uploads a `.md` file, adds a topic, or generates with AI 🤖
2. Instructor submits doc for review
3. **Admin** logs in → reviews, approves or rejects
4. On approval, doc is published to `src/content/docs/[category]/[slug]/`
5. **Restart the dev server** after approving docs to see them appear on the public site

---

## 8. Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run seed      # Seed test users into MongoDB
```

---

## Troubleshooting

### `tsx: command not found`

`tsx` is missing. Install it first, then re-run the seed:

```bash
npm install -D tsx
npm run seed
```
