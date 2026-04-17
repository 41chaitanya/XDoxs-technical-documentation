---
title: Next.js Essentials - App Router, Server Components, and Routing
description: Learn Next.js 14+ fundamentals including App Router, Server Components, and file-based routing. Complete guide with examples in English and Hindi.
category: nextjs
slug: nextjs-essentials
tags: [nextjs, app-router, server-components, routing, react]
author: XDoxs Team
date: 2026-04-16
featured: true
---

# Next.js Essentials

:::lang en

## 1. App Router - Modern Next.js Routing

### What is App Router?

App Router is the **new routing system in Next.js 13+** that uses the `app/` directory. It's built on React Server Components and provides better performance and developer experience.

### File-Based Routing

Next.js uses your file structure to create routes automatically:

```
app/
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
├── blog/
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/:slug
└── dashboard/
    ├── page.tsx      → /dashboard
    └── settings/
        └── page.tsx  → /dashboard/settings
```

### Creating Pages

**Homepage (`app/page.tsx`):**
```tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <p>This is the homepage</p>
    </main>
  );
}
```

**About Page (`app/about/page.tsx`):**
```tsx
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Learn more about our company</p>
    </div>
  );
}
```

### Dynamic Routes

Use `[param]` for dynamic segments:

**Blog Post (`app/blog/[slug]/page.tsx`):**
```tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1>Blog Post: {params.slug}</h1>
      <p>Content for {params.slug}</p>
    </article>
  );
}
```

**Usage:**
- `/blog/hello-world` → `params.slug = "hello-world"`
- `/blog/nextjs-guide` → `params.slug = "nextjs-guide"`

### Nested Routes

**User Profile (`app/users/[id]/page.tsx`):**
```tsx
export default function UserProfile({ params }: { params: { id: string } }) {
  return <h1>User Profile: {params.id}</h1>;
}
```

**User Posts (`app/users/[id]/posts/page.tsx`):**
```tsx
export default function UserPosts({ params }: { params: { id: string } }) {
  return <h1>Posts by User {params.id}</h1>;
}
```

### Layouts

Layouts wrap multiple pages and persist across navigation:

**Root Layout (`app/layout.tsx`):**
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/blog">Blog</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>© 2026 My Site</footer>
      </body>
    </html>
  );
}
```

**Dashboard Layout (`app/dashboard/layout.tsx`):**
```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/settings">Settings</a>
        </nav>
      </aside>
      <div className="content">{children}</div>
    </div>
  );
}
```

---

## 2. Server Components - Default in Next.js

### What are Server Components?

Server Components **render on the server** and send HTML to the client. They're the default in Next.js App Router and provide better performance.

### Server Component (Default)

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function Posts() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Fetch data directly in component
- ✅ No client-side JavaScript needed
- ✅ Better performance
- ✅ Direct database access

### Client Component

Use `'use client'` for interactive components:

```tsx
// app/components/Counter.tsx
'use client'

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**When to use Client Components:**
- ❗ Need useState, useEffect, or other hooks
- ❗ Need event listeners (onClick, onChange)
- ❗ Need browser APIs (localStorage, window)
- ❗ Need third-party libraries that use hooks

### Mixing Server and Client Components

```tsx
// app/page.tsx (Server Component)
import Counter from './components/Counter'; // Client Component

async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Home() {
  const data = await getData();

  return (
    <div>
      <h1>Server Data: {data.title}</h1>
      <Counter /> {/* Client Component */}
    </div>
  );
}
```

### Data Fetching in Server Components

**Fetch API:**
```tsx
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: 'no-store' // Always fresh data
  });
  return res.json();
}

export default async function UserProfile({ params }) {
  const user = await getUser(params.id);
  
  return <h1>{user.name}</h1>;
}
```

**Database Query:**
```tsx
import { db } from '@/lib/db';

async function getPosts() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return posts;
}

export default async function Posts() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>{post.title}</article>
      ))}
    </div>
  );
}
```

---

## 3. Navigation and Links

### Link Component

Use `<Link>` for client-side navigation:

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
      <Link href="/blog/hello-world">
        First Post
      </Link>
    </nav>
  );
}
```

### Dynamic Links

```tsx
const posts = [
  { id: 1, slug: 'hello-world', title: 'Hello World' },
  { id: 2, slug: 'nextjs-guide', title: 'Next.js Guide' }
];

export default function PostList() {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### Programmatic Navigation

```tsx
'use client'

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Login logic...
    router.push('/dashboard'); // Navigate after login
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Login</button>
    </form>
  );
}
```

### Loading States

**Loading UI (`app/blog/loading.tsx`):**
```tsx
export default function Loading() {
  return (
    <div>
      <p>Loading posts...</p>
      <div className="spinner" />
    </div>
  );
}
```

### Error Handling

**Error UI (`app/blog/error.tsx`):**
```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Metadata for SEO

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
```

:::

:::lang hi

## 1. App Router - Modern Next.js Routing

### App Router Kya Hai?

App Router **Next.js 13+ me naya routing system** hai jo `app/` directory use karta hai. Ye React Server Components pe built hai aur better performance deta hai.

### File-Based Routing

Next.js aapki file structure se automatically routes banata hai:

```
app/
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
├── blog/
│   ├── page.tsx      → /blog
│   └── [slug]/
│       └── page.tsx  → /blog/:slug
```

### Pages Banana

**Homepage (`app/page.tsx`):**
```tsx
export default function Home() {
  return (
    <main>
      <h1>Next.js me Welcome!</h1>
      <p>Ye homepage hai</p>
    </main>
  );
}
```

**About Page (`app/about/page.tsx`):**
```tsx
export default function About() {
  return (
    <div>
      <h1>Hamare Baare Me</h1>
      <p>Humari company ke baare me jaane</p>
    </div>
  );
}
```

### Dynamic Routes

Dynamic segments ke liye `[param]` use karo:

**Blog Post (`app/blog/[slug]/page.tsx`):**
```tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1>Blog Post: {params.slug}</h1>
      <p>{params.slug} ka content</p>
    </article>
  );
}
```

**Usage:**
- `/blog/hello-world` → `params.slug = "hello-world"`
- `/blog/nextjs-guide` → `params.slug = "nextjs-guide"`

---

## 2. Server Components - Next.js me Default

### Server Components Kya Hain?

Server Components **server pe render hote hain** aur HTML client ko bhejte hain. Ye Next.js App Router me default hain aur better performance dete hain.

### Server Component (Default)

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function Posts() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ Component me directly data fetch karo
- ✅ Client-side JavaScript ki zarurat nahi
- ✅ Better performance
- ✅ Direct database access

### Client Component

Interactive components ke liye `'use client'` use karo:

```tsx
// app/components/Counter.tsx
'use client'

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

**Client Components kab use kare:**
- ❗ useState, useEffect, ya dusre hooks chahiye
- ❗ Event listeners chahiye (onClick, onChange)
- ❗ Browser APIs chahiye (localStorage, window)
- ❗ Third-party libraries jo hooks use karti hain

---

## 3. Navigation aur Links

### Link Component

Client-side navigation ke liye `<Link>` use karo:

```tsx
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

### Dynamic Links

```tsx
const posts = [
  { id: 1, slug: 'hello-world', title: 'Hello World' },
  { id: 2, slug: 'nextjs-guide', title: 'Next.js Guide' }
];

export default function PostList() {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### Programmatic Navigation

```tsx
'use client'

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Login logic...
    router.push('/dashboard'); // Login ke baad navigate karo
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Login</button>
    </form>
  );
}
```

:::
