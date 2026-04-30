# 📝 Blog System Guide

Complete guide for the XDoxs blog writing and publishing system.

---

## 🎯 Overview

The blog system allows instructors and students to write, submit, and publish technical blogs with a Notion-style editor. Blogs are displayed on the public `/blogs` page with categories, rankings, and related articles.

---

## 🚀 Quick Start

### 1. Seed Sample Blogs

```bash
# Create one sample blog (React + Vite 8 + Tailwind)
npm run seed:blog

# Create multiple sample blogs (4 blogs total)
npm run seed:blogs
```

### 2. Access the System

- **Write Blog (Instructor)**: http://localhost:4321/instructor/write-blog
- **Write Blog (Student)**: http://localhost:4321/student/write-blog
- **View All Blogs**: http://localhost:4321/blogs
- **View Single Blog**: http://localhost:4321/blogs/[slug]

---

## 👥 User Roles & Permissions

### Instructors
- ✅ Write and publish blogs
- ✅ Save drafts
- ✅ Submit for admin review
- ✅ View their own blogs in dashboard

### Students
- ✅ Write and publish blogs
- ✅ Save drafts
- ✅ Submit for admin review
- ✅ View their own blogs in dashboard

### Admins & Super Admins
- ✅ Review submitted blogs
- ✅ Approve or reject blogs
- ✅ Provide feedback
- ✅ Manage all blogs

---

## ✍️ Writing a Blog

### Notion-Style Editor Features

#### Top Bar
- **Breadcrumb**: Shows navigation path
- **Status Pill**: Current status (Draft, Pending Review, Published)
- **Save Draft**: Save without submitting
- **Submit for Review**: Send to admin for approval

#### Cover Image
- Click the cover area to upload an image
- Supports: JPG, PNG, WebP
- Recommended size: 1200x600px

#### Tags
- Select one or more tags
- Available tags:
  - JavaScript
  - React
  - Node.js
  - Tutorial
  - Design
  - Career
- First selected tag becomes the category

#### Title & Subtitle
- **Title**: Main blog heading (required)
- **Subtitle**: Short description/excerpt (optional)

#### Sidebar Formatting Tools
- **T**: Text blocks
- **H1**: Heading 1
- **H2**: Heading 2
- **H3**: Heading 3
- **≡**: Bullet list
- **1.**: Numbered list
- **❝**: Quote block
- **</>**: Code block
- **—**: Horizontal divider

#### Floating Toolbar (Text Selection)
- **B**: Bold
- **I**: Italic
- **U**: Underline
- **S**: Strikethrough
- **`**: Inline code
- **🔗**: Link

#### Word Count
- Real-time word count
- Estimated reading time (200 words/min)

---

## 📊 Blog Status Workflow

```
Draft → Pending Admin Review → Approved/Rejected → Published
```

### Status Types

1. **draft**: Saved but not submitted
2. **pending_admin_review**: Submitted, waiting for admin
3. **approved**: Admin approved, ready to publish
4. **rejected**: Admin rejected with feedback
5. **published**: Live on the blogs page

---

## 🎨 Blog Display

### Blogs Listing Page (`/blogs`)

#### Sections
1. **Top Ranking**: Top 3 blogs by views
2. **Latest Blogs**: 6 most recent blogs
3. **Category-wise**: Blogs grouped by category

#### Blog Card Info
- Category badge
- Title
- Excerpt
- Author name
- Published date
- View count (for top ranking)

### Blog Detail Page (`/blogs/[slug]`)

#### Features
- Cover image (if uploaded)
- Breadcrumb navigation
- Full title and excerpt
- Author info with avatar
- Published date, reading time, view count
- Tags
- Formatted content with syntax highlighting
- Share buttons (Twitter, LinkedIn, Copy Link)
- Related articles (same category)

#### Content Styling
- Responsive typography
- Code syntax highlighting
- Blockquotes with left border
- Lists with proper spacing
- Images with rounded corners
- Horizontal dividers

---

## 🗄️ Database Structure

### BlogPost Model

```typescript
{
  _id: ObjectId,
  authorId: string,
  authorEmail: string,
  authorName: string,
  authorRole: 'instructor' | 'student',
  title: string,
  slug: string,
  excerpt: string,
  content: string, // HTML content
  coverImage: string | null,
  category: string,
  tags: string[],
  status: 'draft' | 'pending_admin_review' | 'published' | 'rejected',
  views: number,
  likes: number,
  feedback?: string,
  createdAt: Date,
  updatedAt: Date,
  publishedAt?: Date
}
```

---

## 🔌 API Endpoints

### Submit Blog (Instructor)
```
POST /api/instructor/submit-blog
```

**Body:**
```json
{
  "title": "Blog Title",
  "excerpt": "Short description",
  "content": "<p>HTML content</p>",
  "coverImage": "data:image/png;base64,...",
  "category": "react",
  "tags": ["react", "javascript"],
  "slug": "blog-title",
  "status": "draft" | "pending_admin_review"
}
```

### Submit Blog (Student)
```
POST /api/student/submit-blog
```

Same body structure as instructor endpoint.

---

## 📝 Sample Blogs

### 1. React + Vite 8 + Tailwind Issue
- **Slug**: `react-vite-8-tailwind-compatibility-issue-solved`
- **Category**: React
- **Author**: Instructor
- **Topics**: Configuration, troubleshooting, PostCSS

### 2. JavaScript Closures
- **Slug**: `understanding-javascript-closures-beginners-guide`
- **Category**: JavaScript
- **Author**: Student
- **Topics**: Fundamentals, examples, best practices

### 3. Node.js vs Deno vs Bun
- **Slug**: `nodejs-vs-deno-vs-bun-comparison-2026`
- **Category**: Node.js
- **Author**: Instructor
- **Topics**: Comparison, performance, use cases

### 4. Student to Developer Journey
- **Slug**: `student-to-junior-developer-journey-lessons`
- **Category**: Career
- **Author**: Student
- **Topics**: Career advice, learning path, interview tips

---

## 🎯 SEO Best Practices

### For Blog Writers

1. **Title**: 50-60 characters, include main keyword
2. **Excerpt**: 150-160 characters, compelling summary
3. **Headings**: Use H2, H3 hierarchy properly
4. **Images**: Add alt text (if feature added)
5. **Links**: Include relevant internal/external links
6. **Keywords**: Use naturally in content
7. **Length**: Aim for 1000+ words for better ranking

### Technical SEO (Already Implemented)

- ✅ Clean URLs (slug-based)
- ✅ Meta descriptions (from excerpt)
- ✅ Semantic HTML
- ✅ Mobile responsive
- ✅ Fast page load
- ✅ Proper heading hierarchy

---

## 🛠️ Customization

### Adding New Tags

Edit both write-blog pages:
- `src/pages/instructor/write-blog.astro`
- `src/pages/student/write-blog.astro`

```html
<div class="tag" data-tag="new-tag">New Tag</div>
```

### Changing Categories

Categories are automatically derived from the first selected tag. To add new categories, just add new tags.

### Styling

All styles are scoped within each component. Main style variables:
- `--primary`: Primary color
- `--bg-primary`: Background color
- `--text-primary`: Text color
- `--border`: Border color

---

## 🐛 Troubleshooting

### Blog Not Appearing

1. Check status is `published`
2. Verify slug is unique
3. Check MongoDB connection
4. Clear browser cache

### Editor Not Working

1. Check JavaScript console for errors
2. Verify auth token is valid
3. Ensure user has correct role

### Images Not Uploading

1. Check file size (< 5MB recommended)
2. Verify file format (JPG, PNG, WebP)
3. Check browser console for errors

---

## 📚 Scripts Reference

```bash
# Seed one sample blog
npm run seed:blog

# Seed multiple sample blogs
npm run seed:blogs

# Clear all blogs (create this if needed)
# npm run clear:blogs

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🚀 Future Enhancements

### Potential Features
- [ ] Rich text editor with markdown support
- [ ] Image upload to S3
- [ ] Blog comments system
- [ ] Like/bookmark functionality
- [ ] Author profiles
- [ ] Blog search and filters
- [ ] Draft auto-save
- [ ] Blog analytics dashboard
- [ ] RSS feed
- [ ] Email notifications
- [ ] Social media auto-posting

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the code comments
3. Check MongoDB for data issues
4. Verify authentication and roles

---

**Last Updated**: April 30, 2026  
**Version**: 1.0.0
