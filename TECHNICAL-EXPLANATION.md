# XDoxs - Complete Technical Explanation

Ye document step-by-step explain karega ki XDoxs platform kaise kaam karta hai, data kahan store hota hai, aur har component ka kya role hai.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [File Storage System](#file-storage-system)
4. [Authentication System](#authentication-system)
5. [Instructor Workflow](#instructor-workflow)
6. [Admin Workflow](#admin-workflow)
7. [Public Documentation](#public-documentation)
8. [Astro Framework Role](#astro-framework-role)
9. [Database Schema](#database-schema)
10. [API Endpoints](#api-endpoints)

---

## 1. Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        XDoxs Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │   Database   │     │
│  │   (Astro)    │◄─┤  (API Routes)│◄─┤  (MongoDB)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  UI Pages    │  │  Auth Logic  │  │  Collections │     │
│  │  Components  │  │  Business    │  │  - users     │     │
│  │  Layouts     │  │  Logic       │  │  - drafts    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Static Files (Published Docs)                │  │
│  │         src/content/docs/[category]/[slug].md        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Astro (Static Site Generator + SSR)
- **Backend**: Astro API Routes (Node.js)
- **Database**: MongoDB (NoSQL)
- **Auth**: JWT + bcrypt
- **Markdown**: marked + highlight.js

---

## 2. Data Flow

### Complete Data Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    INSTRUCTOR UPLOADS MD                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Upload Page (src/pages/instructor/docs/upload.astro)    │
│     - User uploads .md file OR writes content               │
│     - File is read in browser (FileReader API)              │
│     - Content is sent to API                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Create API (src/pages/api/docs/create.ts)               │
│     - Receives: title, category, content, tags              │
│     - Splits content by ## headings into topics             │
│     - Creates draft document in MongoDB                     │
│     - Status: "draft"                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. MongoDB Storage (Database: xdoxs)                        │
│     Collection: doc_drafts                                   │
│     {                                                        │
│       _id: ObjectId,                                         │
│       instructorId: "user123",                               │
│       title: "JavaScript Guide",                             │
│       category: "javascript",                                │
│       content: "full markdown content...",                   │
│       topics: [                                              │
│         { id: "1", title: "Intro", content: "##..." },      │
│         { id: "2", title: "Variables", content: "##..." }   │
│       ],                                                     │
│       status: "draft",                                       │
│       createdAt: Date,                                       │
│       updatedAt: Date                                        │
│     }                                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Editor Page (src/pages/instructor/docs/edit/[id].astro) │
│     - Instructor edits topics                                │
│     - Drag-drop reordering                                   │
│     - Add/delete topics                                      │
│     - Upload additional topic files                          │
│     - Auto-save every 1 second                               │
│     - Click "Submit for Review"                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Update API (src/pages/api/docs/update.ts)               │
│     - Updates MongoDB document                               │
│     - Changes status: "draft" → "pending_review"            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Admin Dashboard (src/pages/admin/dashboard.astro)       │
│     - Shows all pending docs                                 │
│     - Admin clicks "Review"                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Review Page (src/pages/admin/review/[id].astro)         │
│     - Admin previews each topic                              │
│     - Clicks "Approve" or "Reject"                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Approve API (src/pages/api/admin/approve.ts)            │
│     - Updates status: "pending_review" → "approved"         │
│     - Calls Publisher                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  9. Publisher (src/lib/docs/publisher.ts)                    │
│     - Reads draft from MongoDB                               │
│     - Creates markdown file with frontmatter                 │
│     - Writes to: src/content/docs/[category]/[slug].md      │
│     - File is now on disk!                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  10. Astro Content Collection                                │
│      - Astro reads all .md files from src/content/docs/     │
│      - Generates static pages at build time                  │
│      - Route: /docs/[category]/[slug]                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  11. Public Documentation Page                               │
│      (src/pages/docs/[...slug].astro)                        │
│      - Users can view published docs                         │
│      - Topic navigation in sidebar                           │
│      - Smooth scroll to sections                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. File Storage System

### Where is Data Stored?

#### A. MongoDB (Database) - Draft Stage

**Location**: Cloud (MongoDB Atlas) or Local MongoDB

**What is stored**:
```javascript
// Collection: doc_drafts
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  instructorId: "user_123",
  instructorEmail: "instructor@xdoxs.com",
  title: "JavaScript Complete Guide",
  slug: "javascript-complete-guide",
  category: "javascript",
  description: "Complete JS guide from basics to advanced",
  content: "# JavaScript Complete Guide\n\n## Introduction\n...",
  topics: [
    {
      id: "topic_1",
      title: "Introduction to JavaScript",
      content: "## Introduction to JavaScript\n\nJS is...",
      order: 0
    },
    {
      id: "topic_2",
      title: "Variables and Data Types",
      content: "## Variables and Data Types\n\nLet, const...",
      order: 1
    }
  ],
  tags: ["javascript", "beginner", "tutorial"],
  status: "draft", // or "pending_review", "approved", "rejected"
  feedback: null,
  publishedAt: null,
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T11:45:00Z")
}
```

**Purpose**: 
- Store drafts while instructor is working
- Store pending docs waiting for admin approval
- Keep history of approved/rejected docs

#### B. File System - Published Stage

**Location**: `src/content/docs/[category]/[slug].md`

**Example**: `src/content/docs/javascript/javascript-complete-guide.md`

**What is stored**:
```markdown
---
title: "JavaScript Complete Guide"
description: "Complete JS guide from basics to advanced"
date: 2024-01-15T12:00:00.000Z
author: "instructor@xdoxs.com"
category: "javascript"
tags: ["javascript", "beginner", "tutorial"]
---

# JavaScript Complete Guide

JavaScript is a high-level programming language...

## Introduction to JavaScript

JavaScript was created in 1995...

## Variables and Data Types

Variables are containers for storing data...
```

**Purpose**:
- Astro reads these files at build time
- Generates static HTML pages
- Fast loading for users
- SEO-friendly

#### C. Users Collection

```javascript
// Collection: users
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  email: "instructor@xdoxs.com",
  password: "$2b$10$hashed_password_here",
  role: "instructor", // or "super_admin", "student"
  createdAt: ISODate("2024-01-01T00:00:00Z")
}
```

---

## 4. Authentication System

### How Login Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. User enters email + password                             │
│     (src/pages/login.astro)                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. POST /api/auth/login                                     │
│     (src/pages/api/auth/login.ts)                            │
│     - Finds user in MongoDB by email                         │
│     - Compares password with bcrypt                          │
│     - If valid: generates JWT token                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. JWT Token Generation                                     │
│     (src/lib/auth/jwt.ts)                                    │
│                                                              │
│     const token = jwt.sign(                                  │
│       {                                                      │
│         userId: user._id,                                    │
│         email: user.email,                                   │
│         role: user.role                                      │
│       },                                                     │
│       JWT_SECRET,                                            │
│       { expiresIn: '7d' }                                    │
│     );                                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Set HTTP-Only Cookie                                     │
│     - Cookie name: "auth_token"                              │
│     - HttpOnly: true (JavaScript can't access)               │
│     - Secure: true (HTTPS only in production)                │
│     - SameSite: 'lax'                                        │
│     - Max-Age: 7 days                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Every Request                                            │
│     - Browser automatically sends cookie                     │
│     - Server verifies JWT token                              │
│     - Extracts user info (userId, role)                      │
│     - Checks permissions                                     │
└─────────────────────────────────────────────────────────────┘
```

### Role-Based Access

```javascript
// Example: Instructor Dashboard
const token = Astro.cookies.get('auth_token')?.value;
if (!token) return Astro.redirect('/login');

const payload = verifyToken(token);
if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
  return Astro.redirect('/login');
}

// User is authenticated and authorized!
```

---

## 5. Instructor Workflow

### Step-by-Step Process

#### Step 1: Upload Documentation

**File**: `src/pages/instructor/docs/upload.astro`

**Two Modes**:

**Mode A: Upload Full .md File**
```
User selects file → FileReader reads content → 
Splits by ## headings → Creates topics array → 
Sends to /api/docs/create → Saves in MongoDB
```

**Mode B: Add Single Topic**
```
User writes/uploads topic → Selects existing doc or creates new → 
Sends to /api/docs/add-topic → Appends to MongoDB doc
```

#### Step 2: Edit in Editor

**File**: `src/pages/instructor/docs/edit/[id].astro`

**Features**:
- Left sidebar: Topic list with drag-drop
- Center: Editor (write) or Preview (rendered HTML)
- Right sidebar: Metadata (description, tags, category)

**Auto-save**:
```javascript
// Saves every 1 second after typing stops
let saveTimeout;
editor.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    // Update topics array in memory
    topic.content = editor.value;
  }, 1000);
});
```

**Manual Save**:
```javascript
// Sends all topics + metadata to /api/docs/update
await fetch('/api/docs/update', {
  method: 'PUT',
  body: JSON.stringify({
    draftId,
    topics,
    content: topics.map(t => t.content).join('\n\n'),
    description,
    tags,
    category
  })
});
```

#### Step 3: Submit for Review

```javascript
// Changes status from "draft" to "pending_review"
await fetch('/api/docs/update', {
  method: 'PUT',
  body: JSON.stringify({
    draftId,
    status: 'pending_review'
  })
});
```

---

## 6. Admin Workflow

### Step-by-Step Process

#### Step 1: View Pending Docs

**File**: `src/pages/admin/dashboard.astro`

```javascript
// Fetches all docs with status "pending_review"
const pendingDocs = await DocDraft.find({
  status: 'pending_review'
}).sort({ updatedAt: -1 });
```

#### Step 2: Review Doc

**File**: `src/pages/admin/review/[id].astro`

- Shows doc metadata
- Lists all topics
- Click topic to preview rendered HTML
- Approve or Reject buttons

#### Step 3: Approve

**File**: `src/pages/api/admin/approve.ts`

```javascript
// 1. Update status in MongoDB
await DocDraft.findByIdAndUpdate(draftId, {
  status: 'approved',
  publishedAt: new Date()
});

// 2. Call Publisher
await publishDocToStatic(draft);
```

**Publisher** (`src/lib/docs/publisher.ts`):
```javascript
export async function publishDocToStatic(draft) {
  // 1. Create directory
  const categoryDir = `src/content/docs/${draft.category}`;
  await fs.mkdir(categoryDir, { recursive: true });
  
  // 2. Generate frontmatter
  const frontmatter = `---
title: "${draft.title}"
description: "${draft.description}"
date: ${new Date().toISOString()}
author: "${draft.instructorEmail}"
category: "${draft.category}"
tags: [${draft.tags.map(t => `"${t}"`).join(', ')}]
---

`;
  
  // 3. Write file
  const filePath = `${categoryDir}/${draft.slug}.md`;
  await fs.writeFile(filePath, frontmatter + draft.content);
  
  console.log(`✅ Published: ${filePath}`);
}
```

#### Step 4: Reject (Optional)

**File**: `src/pages/api/admin/reject.ts`

```javascript
// Updates status and saves feedback
await DocDraft.findByIdAndUpdate(draftId, {
  status: 'rejected',
  feedback: "Please fix the code examples in topic 3"
});
```

Instructor sees feedback on dashboard and can edit + resubmit.

---

## 7. Public Documentation

### How Users See Published Docs

#### Step 1: Astro Content Collection

**File**: `src/content.config.ts`

```javascript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ 
    pattern: '**/*.md', 
    base: './src/content/docs' 
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    author: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = { docs };
```

**What happens**:
- Astro scans `src/content/docs/` for all .md files
- Validates frontmatter against schema
- Creates a collection of docs

#### Step 2: Generate Pages

**File**: `src/pages/docs/[...slug].astro`

```javascript
export async function getStaticPaths() {
  const docs = await getCollection('docs');
  
  return docs.map(doc => ({
    params: { slug: doc.id }, // e.g., "javascript/javascript-complete-guide"
    props: { doc },
  }));
}

// Astro generates:
// /docs/javascript/javascript-complete-guide
// /docs/react/react-hooks-guide
// etc.
```

#### Step 3: Render Page

**File**: `src/layouts/DocLayout.astro`

```javascript
const { doc } = Astro.props;
const { Content, headings } = await render(doc);

// Extract H2 headings as topics
const topics = headings.filter(h => h.depth === 2);
```

**Layout**:
- Left sidebar: Topics (H2 headings) with smooth scroll
- Center: Full markdown content rendered as HTML
- Syntax highlighting for code blocks

---

## 8. Astro Framework Role

### What is Astro Doing?

#### A. Static Site Generation (SSG)

```
Build Time:
┌─────────────────────────────────────────┐
│  1. Astro reads all .md files           │
│  2. Parses frontmatter + content        │
│  3. Renders markdown to HTML            │
│  4. Generates static HTML pages         │
│  5. Outputs to dist/ folder             │
└─────────────────────────────────────────┘

Result: Fast, SEO-friendly pages
```

#### B. Server-Side Rendering (SSR)

```
Request Time (for dynamic pages):
┌─────────────────────────────────────────┐
│  1. User requests /instructor/dashboard │
│  2. Astro runs page code on server      │
│  3. Checks authentication               │
│  4. Fetches data from MongoDB           │
│  5. Renders HTML with data              │
│  6. Sends to browser                    │
└─────────────────────────────────────────┘

Result: Dynamic, personalized pages
```

#### C. API Routes

```
API Request:
┌─────────────────────────────────────────┐
│  1. POST /api/docs/create               │
│  2. Astro runs create.ts file           │
│  3. Validates input                     │
│  4. Saves to MongoDB                    │
│  5. Returns JSON response               │
└─────────────────────────────────────────┘

Result: Backend API without separate server
```

### Astro Config

**File**: `astro.config.mjs`

```javascript
export default defineConfig({
  output: 'hybrid', // SSG + SSR
  adapter: vercel(), // Deploy to Vercel
  integrations: [],
});
```

**Hybrid Mode**:
- Static pages: `/docs/*` (fast, cached)
- Dynamic pages: `/instructor/*`, `/admin/*` (personalized)
- API routes: `/api/*` (server-side logic)

---

## 9. Database Schema

### MongoDB Collections

#### Collection: users

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (enum: 'super_admin', 'instructor', 'student'),
  createdAt: Date
}
```

#### Collection: doc_drafts

```javascript
{
  _id: ObjectId,
  instructorId: String,
  instructorEmail: String,
  title: String,
  slug: String,
  category: String,
  description: String,
  content: String (full markdown),
  topics: [
    {
      id: String,
      title: String,
      content: String (markdown),
      order: Number
    }
  ],
  tags: [String],
  status: String (enum: 'draft', 'pending_review', 'approved', 'rejected'),
  feedback: String (nullable),
  publishedAt: Date (nullable),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// For fast queries
db.users.createIndex({ email: 1 }, { unique: true });
db.doc_drafts.createIndex({ instructorId: 1 });
db.doc_drafts.createIndex({ status: 1 });
db.doc_drafts.createIndex({ slug: 1 });
```

---

## 10. API Endpoints

### Complete API Map

#### Authentication APIs

```
POST   /api/auth/register
       Input: { email, password, role }
       Output: { success, user }
       
POST   /api/auth/login
       Input: { email, password }
       Output: { success, user }
       Sets: auth_token cookie
       
POST   /api/auth/logout
       Output: { success }
       Clears: auth_token cookie
       
GET    /api/auth/me
       Output: { user } (from JWT token)
```

#### Documentation APIs (Instructor)

```
POST   /api/docs/create
       Input: { title, category, slug, content, description, tags }
       Output: { success, draft }
       Action: Creates draft in MongoDB
       
GET    /api/docs/list
       Output: { success, drafts }
       Action: Lists instructor's drafts
       
PUT    /api/docs/update
       Input: { draftId, topics?, content?, status?, description?, tags?, category? }
       Output: { success }
       Action: Updates draft in MongoDB
       
DELETE /api/docs/delete
       Input: { draftId }
       Output: { success }
       Action: Deletes draft from MongoDB
       
POST   /api/docs/add-topic
       Input: { draftId, title, content }
       Output: { success }
       Action: Appends topic to draft
       
DELETE /api/docs/delete-topic
       Input: { draftId, topicId }
       Output: { success }
       Action: Removes topic from draft
       
POST   /api/docs/reorder-topics
       Input: { draftId, topicIds: [id1, id2, ...] }
       Output: { success }
       Action: Reorders topics in draft
       
POST   /api/docs/render-topic
       Input: { content }
       Output: { html }
       Action: Renders markdown to HTML (preview)
```

#### Admin APIs

```
POST   /api/admin/approve
       Input: { draftId }
       Output: { success }
       Action: 
         1. Updates status to 'approved'
         2. Calls publisher
         3. Creates .md file in src/content/docs/
       
POST   /api/admin/reject
       Input: { draftId, feedback }
       Output: { success }
       Action: Updates status to 'rejected' + saves feedback
       
POST   /api/admin/unpublish
       Input: { draftId }
       Output: { success }
       Action:
         1. Updates status to 'draft'
         2. Deletes .md file from src/content/docs/
```

---

## Summary: Complete Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM FLOW                       │
└──────────────────────────────────────────────────────────────┘

1. INSTRUCTOR UPLOADS
   ├─ Upload .md file or write content
   ├─ Stored in MongoDB (doc_drafts collection)
   └─ Status: "draft"

2. INSTRUCTOR EDITS
   ├─ Opens editor page
   ├─ Edits topics, reorders, adds new topics
   ├─ Auto-saves to MongoDB
   └─ Submits for review → Status: "pending_review"

3. ADMIN REVIEWS
   ├─ Views pending docs
   ├─ Previews each topic
   └─ Approves or Rejects

4. IF APPROVED
   ├─ Status: "approved"
   ├─ Publisher creates .md file
   ├─ File location: src/content/docs/[category]/[slug].md
   └─ Astro reads file at build time

5. PUBLIC ACCESS
   ├─ Astro generates static page
   ├─ Route: /docs/[category]/[slug]
   ├─ Users see published documentation
   └─ Topic navigation in sidebar

6. IF REJECTED
   ├─ Status: "rejected"
   ├─ Feedback saved
   ├─ Instructor sees feedback
   └─ Can edit and resubmit

7. REPUBLISH (for updates)
   ├─ Instructor edits approved doc
   ├─ Clicks "Republish Changes"
   ├─ Status: "approved" → "pending_review"
   ├─ Admin reviews again
   └─ Approves → File is overwritten
```

---

## Key Takeaways

1. **MongoDB** stores drafts (work in progress)
2. **File System** stores published docs (static .md files)
3. **Astro** generates HTML from .md files
4. **JWT** handles authentication
5. **Publisher** bridges MongoDB → File System
6. **API Routes** handle all backend logic
7. **Hybrid Mode** = Static docs + Dynamic dashboards

---

**Ye hai complete technical explanation! Har step, har file, har data flow samajh aa gaya? 🚀**
