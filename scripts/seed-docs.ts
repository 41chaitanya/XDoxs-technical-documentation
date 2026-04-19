// Seed sample documentation into MongoDB for testing
import { MongoClient } from 'mongodb';
import { parse, Renderer } from 'marked';
import hljs from 'highlight.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xdoxs';

// ---------- Minimal markdown renderer (mirrors src/lib/markdown/render.ts) ----------

function renderMarkdownSync(markdown: string): string {
  const renderer = new Renderer();

  renderer.heading = function ({ text, depth }) {
    const slug = text
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `<h${depth} id="${slug}">${text}</h${depth}>\n`;
  };

  renderer.code = function ({ text, lang }) {
    const code = String(text || '');
    const language = String(lang || '');
    if (language && hljs.getLanguage(language)) {
      try {
        const highlighted = hljs.highlight(code, { language }).value;
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
      } catch { /* fall through */ }
    }
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return `<pre><code class="hljs">${escaped}</code></pre>`;
  };

  return parse(markdown, { gfm: true, breaks: false, renderer, async: false }) as string;
}

// ---------- Sample documentation content ----------

interface SeedDoc {
  category: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  content: string;   // raw markdown (English)
}

const sampleDocs: SeedDoc[] = [
  // ─── JavaScript ───
  {
    category: 'javascript',
    title: 'JavaScript Fundamentals',
    slug: 'fundamentals',
    description: 'Core JavaScript concepts including variables, data types, operators, and control flow — the building blocks of every JS program.',
    tags: ['javascript', 'basics', 'fundamentals', 'beginner'],
    content: `## Introduction

JavaScript is one of the most popular programming languages in the world. It powers the web, runs on servers via Node.js, and even drives mobile and desktop applications.

This guide covers the essential building blocks you need to start writing JavaScript with confidence.

## Variables and Data Types

JavaScript provides three ways to declare variables:

\`\`\`javascript
// const — block-scoped, cannot be reassigned
const API_URL = 'https://api.example.com';

// let — block-scoped, can be reassigned
let count = 0;
count = 1; // ✅ allowed

// var — function-scoped (legacy, avoid in modern code)
var name = 'XDoxs';
\`\`\`

### Primitive Types

| Type | Example | Notes |
|------|---------|-------|
| \`string\` | \`'hello'\` | Text values |
| \`number\` | \`42\`, \`3.14\` | Integers & floats |
| \`boolean\` | \`true\`, \`false\` | Logical values |
| \`null\` | \`null\` | Intentional absence |
| \`undefined\` | \`undefined\` | Uninitialized |
| \`bigint\` | \`9007199254740991n\` | Arbitrary precision |
| \`symbol\` | \`Symbol('id')\` | Unique identifiers |

### Reference Types

\`\`\`javascript
// Object
const user = { name: 'Alice', age: 30 };

// Array
const colors = ['red', 'green', 'blue'];

// Function
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## Operators

### Comparison: \`==\` vs \`===\`

Always prefer strict equality (\`===\`) to avoid type coercion surprises:

\`\`\`javascript
console.log(0 == '0');   // true  — type coercion
console.log(0 === '0');  // false — strict comparison ✅
\`\`\`

### Logical Operators

\`\`\`javascript
// AND — both must be true
const isAdmin = true && hasPermission;

// OR — at least one must be true
const canView = isOwner || isAdmin;

// Nullish coalescing — fallback for null/undefined only
const port = config.port ?? 3000;

// Optional chaining — safe property access
const city = user?.address?.city;
\`\`\`

## Control Flow

### Conditionals

\`\`\`javascript
function getDiscount(tier) {
  if (tier === 'gold') return 0.2;
  if (tier === 'silver') return 0.1;
  return 0;
}
\`\`\`

### Loops

\`\`\`javascript
// for…of — iterate values (arrays, strings, maps)
for (const color of ['red', 'green', 'blue']) {
  console.log(color);
}

// for…in — iterate keys (objects)
for (const key in user) {
  console.log(key, user[key]);
}

// Array methods (preferred for transformations)
const doubled = [1, 2, 3].map(n => n * 2); // [2, 4, 6]
const evens   = [1, 2, 3, 4].filter(n => n % 2 === 0); // [2, 4]
\`\`\`

## Functions

### Arrow Functions vs Regular Functions

\`\`\`javascript
// Arrow function (lexical \`this\`)
const add = (a, b) => a + b;

// Regular function (own \`this\`)
function multiply(a, b) {
  return a * b;
}

// Default parameters
function createUser(name, role = 'student') {
  return { name, role };
}
\`\`\`

### Destructuring Parameters

\`\`\`javascript
function printUser({ name, age, role = 'member' }) {
  console.log(\`\${name} (\${age}) — \${role}\`);
}

printUser({ name: 'Alice', age: 30 }); // Alice (30) — member
\`\`\`

## Error Handling

\`\`\`javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error.message);
    return null;
  } finally {
    console.log('Request complete');
  }
}
\`\`\`

## Summary

- Use \`const\` by default, \`let\` when reassignment is needed.
- Prefer \`===\` over \`==\`.
- Use \`for…of\` for arrays, array methods for transformations.
- Arrow functions for short callbacks; regular functions when you need \`this\`.
- Always handle errors with \`try/catch\` in async code.
`,
  },

  {
    category: 'javascript',
    title: 'Async JavaScript',
    slug: 'async-javascript',
    description: 'Master Promises, async/await, and common asynchronous patterns in modern JavaScript.',
    tags: ['javascript', 'async', 'promises', 'await'],
    content: `## Introduction

Asynchronous programming is at the heart of JavaScript. From network requests to file I/O, understanding asynchronous patterns is essential for writing efficient, non-blocking code.

## Callbacks

The original async pattern — a function passed as an argument to be called later:

\`\`\`javascript
function loadData(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = () => callback(null, JSON.parse(xhr.responseText));
  xhr.onerror = () => callback(new Error('Request failed'));
  xhr.send();
}

// Usage — leads to "callback hell" when nested
loadData('/api/user', (err, user) => {
  if (err) return console.error(err);
  loadData(\`/api/posts/\${user.id}\`, (err, posts) => {
    // deeply nested...
  });
});
\`\`\`

## Promises

Promises provide a cleaner way to handle asynchronous operations:

\`\`\`javascript
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    fetch(\`/api/users/\${id}\`)
      .then(res => {
        if (!res.ok) reject(new Error('User not found'));
        return res.json();
      })
      .then(resolve)
      .catch(reject);
  });
}

// Chaining
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(err => console.error(err));
\`\`\`

### Promise Combinators

\`\`\`javascript
// Run in parallel, wait for all
const [users, posts] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
]);

// First one to settle wins
const fastest = await Promise.race([
  fetch('/api/primary'),
  fetch('/api/fallback'),
]);

// All settled (never rejects)
const results = await Promise.allSettled([
  fetch('/api/a'),
  fetch('/api/b'),
]);
results.forEach(r => {
  if (r.status === 'fulfilled') console.log(r.value);
  else console.error(r.reason);
});
\`\`\`

## Async / Await

The modern, readable way to work with Promises:

\`\`\`javascript
async function getUserPosts(userId) {
  try {
    const userRes = await fetch(\`/api/users/\${userId}\`);
    if (!userRes.ok) throw new Error('User not found');

    const user = await userRes.json();
    const postsRes = await fetch(\`/api/posts?author=\${user.id}\`);
    const posts = await postsRes.json();

    return { user, posts };
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}
\`\`\`

### Parallel Async Operations

\`\`\`javascript
async function loadDashboard() {
  // ❌ Sequential — slow
  const users = await fetchUsers();
  const analytics = await fetchAnalytics();

  // ✅ Parallel — fast
  const [users2, analytics2] = await Promise.all([
    fetchUsers(),
    fetchAnalytics(),
  ]);
}
\`\`\`

## Event Loop

JavaScript is single-threaded. The event loop processes:

1. **Call Stack** — synchronous code runs here
2. **Microtask Queue** — \`Promise.then()\`, \`queueMicrotask()\`
3. **Macrotask Queue** — \`setTimeout\`, \`setInterval\`, I/O callbacks

\`\`\`javascript
console.log('1 — sync');

setTimeout(() => console.log('2 — macrotask'), 0);

Promise.resolve().then(() => console.log('3 — microtask'));

console.log('4 — sync');

// Output: 1, 4, 3, 2
\`\`\`

## Summary

| Pattern | When to Use |
|---------|------------|
| Callbacks | Legacy APIs, event handlers |
| Promises | Composable async chains |
| async/await | Modern, readable async code |
| Promise.all | Parallel independent tasks |
| Promise.race | Timeouts, fastest response |
`,
  },

  // ─── TypeScript ───
  {
    category: 'typescript',
    title: 'TypeScript Essentials',
    slug: 'essentials',
    description: 'Learn TypeScript type annotations, interfaces, generics, and utility types to write safer, more maintainable code.',
    tags: ['typescript', 'types', 'generics', 'interfaces'],
    content: `## Introduction

TypeScript adds static types to JavaScript, catching errors at compile time rather than runtime. It's the de-facto standard for large-scale JavaScript applications.

## Basic Type Annotations

\`\`\`typescript
// Primitives
let name: string = 'Alice';
let age: number = 30;
let isActive: boolean = true;

// Arrays
let scores: number[] = [95, 87, 92];
let names: Array<string> = ['Alice', 'Bob'];

// Tuple
let entry: [string, number] = ['Alice', 30];
\`\`\`

## Interfaces and Types

\`\`\`typescript
// Interface — prefer for object shapes
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

// Type alias — prefer for unions, intersections, mapped types
type Status = 'active' | 'inactive' | 'suspended';
type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };
\`\`\`

### Extending Interfaces

\`\`\`typescript
interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface User extends BaseEntity {
  name: string;
  email: string;
}

interface Post extends BaseEntity {
  title: string;
  content: string;
  author: User;
}
\`\`\`

## Generics

Generics let you write reusable, type-safe code:

\`\`\`typescript
// Generic function
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = first([1, 2, 3]);       // number | undefined
const str = first(['a', 'b', 'c']); // string | undefined

// Generic interface
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
\`\`\`

### Generic Constraints

\`\`\`typescript
interface HasId {
  id: string | number;
}

function findById<T extends HasId>(items: T[], id: T['id']): T | undefined {
  return items.find(item => item.id === id);
}
\`\`\`

## Utility Types

TypeScript includes powerful built-in utility types:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type PublicUser = Pick<User, 'id' | 'name' | 'email'>;

// Omit specific properties
type CreateUserDto = Omit<User, 'id'>;

// Record type for dictionaries
type UserRoles = Record<string, 'admin' | 'user'>;

// Exclude from union
type NonAdmin = Exclude<'admin' | 'user' | 'guest', 'admin'>; // 'user' | 'guest'
\`\`\`

## Type Guards

\`\`\`typescript
// typeof guard
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value;
  }
  return padding + value;
}

// Custom type guard
interface Dog { bark(): void; breed: string; }
interface Cat { meow(): void; color: string; }

function isDog(animal: Dog | Cat): animal is Dog {
  return 'bark' in animal;
}
\`\`\`

## Enums vs Const Objects

\`\`\`typescript
// Numeric enum (generates reverse mapping)
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}

// ✅ Prefer const objects for smaller bundles
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

type Role = typeof ROLES[keyof typeof ROLES]; // 'admin' | 'user' | 'guest'
\`\`\`

## Summary

- Annotate function parameters and return types explicitly.
- Prefer \`interface\` for objects, \`type\` for unions and computed types.
- Use generics to write flexible, reusable functions and classes.
- Leverage utility types (\`Partial\`, \`Pick\`, \`Omit\`, etc.) instead of redefining shapes.
- Use \`as const\` objects over \`enum\` for smaller bundles.
`,
  },

  // ─── React ───
  {
    category: 'react',
    title: 'React Components & Hooks',
    slug: 'components-and-hooks',
    description: 'Build modern React applications with functional components, hooks, and best practices for state and side-effect management.',
    tags: ['react', 'hooks', 'components', 'useState', 'useEffect'],
    content: `## Introduction

React is a declarative, component-based library for building user interfaces. Modern React is built around **functional components** and **hooks**.

## Functional Components

\`\`\`tsx
interface GreetingProps {
  name: string;
  role?: string;
}

function Greeting({ name, role = 'member' }: GreetingProps) {
  return (
    <div className="greeting">
      <h2>Hello, {name}!</h2>
      <span className="badge">{role}</span>
    </div>
  );
}
\`\`\`

## useState

Manage local component state:

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
\`\`\`

### Complex State with Objects

\`\`\`tsx
interface FormData {
  name: string;
  email: string;
  message: string;
}

function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form>
      <input
        value={form.name}
        onChange={e => updateField('name', e.target.value)}
        placeholder="Name"
      />
      <input
        value={form.email}
        onChange={e => updateField('email', e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={form.message}
        onChange={e => updateField('message', e.target.value)}
        placeholder="Message"
      />
    </form>
  );
}
\`\`\`

## useEffect

Handle side effects like API calls, subscriptions, and DOM manipulation:

\`\`\`tsx
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        setLoading(true);
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error('Failed to load user');
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => { cancelled = true; }; // cleanup
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return null;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

## useRef

Access DOM elements and persist values across renders:

\`\`\`tsx
import { useRef, useEffect } from 'react';

function AutoFocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} placeholder="Auto-focused" />;
}
\`\`\`

## Custom Hooks

Extract reusable logic into custom hooks:

\`\`\`tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current: {theme}
    </button>
  );
}
\`\`\`

## Conditional Rendering

\`\`\`tsx
function Dashboard({ user }: { user: User | null }) {
  return (
    <div>
      {user ? (
        <h1>Welcome, {user.name}</h1>
      ) : (
        <h1>Please log in</h1>
      )}

      {user?.role === 'admin' && <AdminPanel />}
    </div>
  );
}
\`\`\`

## Summary

| Hook | Purpose |
|------|---------|
| \`useState\` | Local component state |
| \`useEffect\` | Side effects (fetch, subscriptions) |
| \`useRef\` | DOM access, mutable values |
| \`useMemo\` | Expensive computation caching |
| \`useCallback\` | Stable function references |
| \`useContext\` | Shared state without props |
`,
  },

  // ─── Node.js ───
  {
    category: 'nodejs',
    title: 'Node.js & Express Guide',
    slug: 'express-guide',
    description: 'Build REST APIs with Node.js and Express — routing, middleware, error handling, and best practices.',
    tags: ['nodejs', 'express', 'api', 'rest', 'backend'],
    content: `## Introduction

Node.js lets you run JavaScript on the server. Combined with Express, it's the most popular stack for building REST APIs and web backends.

## Setting Up Express

\`\`\`bash
npm init -y
npm install express cors helmet
npm install -D typescript @types/express @types/node tsx
\`\`\`

\`\`\`typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());           // Security headers
app.use(cors());             // CORS
app.use(express.json());     // Parse JSON bodies

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

## Routing

\`\`\`typescript
import { Router } from 'express';

const router = Router();

// GET — list all users
router.get('/users', async (req, res) => {
  const users = await db.users.findAll();
  res.json(users);
});

// GET — single user by ID
router.get('/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST — create user
router.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  const user = await db.users.create({ name, email });
  res.status(201).json(user);
});

// PUT — update user
router.put('/users/:id', async (req, res) => {
  const updated = await db.users.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json(updated);
});

// DELETE — remove user
router.delete('/users/:id', async (req, res) => {
  const deleted = await db.users.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.status(204).send();
});

export default router;
\`\`\`

## Middleware

Middleware functions run before route handlers:

\`\`\`typescript
// Logging middleware
function logger(req, res, next) {
  console.log(\`\${req.method} \${req.path} — \${new Date().toISOString()}\`);
  next();
}

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Usage
app.use(logger);
app.use('/api/admin', authenticate, adminRoutes);
\`\`\`

## Error Handling

\`\`\`typescript
// Custom error class
class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Global error handler (must have 4 parameters)
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Usage in routes
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user) throw new AppError(404, 'User not found');
    res.json(user);
  } catch (error) {
    next(error); // Forward to error handler
  }
});
\`\`\`

## Environment Variables

\`\`\`typescript
// .env
// PORT=3000
// DATABASE_URL=mongodb://localhost:27017/myapp
// JWT_SECRET=super-secret-key

import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT || '3000'),
  dbUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
};
\`\`\`

## Project Structure

\`\`\`
src/
├── index.ts          # App entry point
├── routes/
│   ├── users.ts      # User routes
│   └── posts.ts      # Post routes
├── middleware/
│   ├── auth.ts       # Authentication
│   └── validate.ts   # Request validation
├── models/
│   └── user.ts       # Database models
└── utils/
    └── errors.ts     # Custom error classes
\`\`\`

## Summary

- Use **Router** to organize routes by resource.
- Apply middleware for cross-cutting concerns (auth, logging, validation).
- Always have a global error handler.
- Validate request bodies before processing.
- Use environment variables for configuration — never hard-code secrets.
`,
  },

  // ─── Git ───
  {
    category: 'git',
    title: 'Git Version Control',
    slug: 'version-control',
    description: 'Essential Git commands, branching strategies, and workflows for effective collaboration.',
    tags: ['git', 'version-control', 'github', 'collaboration'],
    content: `## Introduction

Git is the industry-standard version control system. It tracks changes to your code, enables collaboration, and provides a safety net for experimentation through branching.

## Basic Commands

\`\`\`bash
# Initialize a new repository
git init

# Clone an existing repository
git clone https://github.com/user/repo.git

# Check status
git status

# Stage changes
git add file.txt          # specific file
git add .                 # all changes

# Commit
git commit -m "feat: add user authentication"

# Push to remote
git push origin main
\`\`\`

## Branching

\`\`\`bash
# Create and switch to a new branch
git checkout -b feature/user-auth

# List branches
git branch -a

# Switch branches
git checkout main

# Merge a branch
git merge feature/user-auth

# Delete a branch (local)
git branch -d feature/user-auth

# Delete a branch (remote)
git push origin --delete feature/user-auth
\`\`\`

## Commit Message Convention

Follow the **Conventional Commits** standard:

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
\`\`\`

| Type | When to Use |
|------|-------------|
| \`feat\` | New feature |
| \`fix\` | Bug fix |
| \`docs\` | Documentation only |
| \`style\` | Formatting, no code change |
| \`refactor\` | Code restructure (no feature/fix) |
| \`test\` | Adding/updating tests |
| \`chore\` | Build, CI, tooling |

**Examples:**

\`\`\`bash
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(api): handle null user in response"
git commit -m "docs: update README with setup instructions"
\`\`\`

## Undoing Changes

\`\`\`bash
# Unstage a file
git reset HEAD file.txt

# Discard working directory changes
git checkout -- file.txt

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert abc1234
\`\`\`

## Stashing

Save work-in-progress without committing:

\`\`\`bash
# Stash changes
git stash

# Stash with a message
git stash push -m "WIP: refactoring auth"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}
\`\`\`

## Git Flow Workflow

\`\`\`
main ──────────────────────────────────────
  \\                                      /
   develop ─────────────────────────────
     \\            \\              /
      feature/a    feature/b ───
\`\`\`

1. **main** — production-ready code
2. **develop** — integration branch
3. **feature/** — individual features
4. **hotfix/** — urgent production fixes
5. **release/** — prepare for release

## .gitignore

Essential entries for a Node.js project:

\`\`\`
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/settings.json
\`\`\`

## Summary

- Commit early, commit often with meaningful messages.
- Use feature branches — never commit directly to \`main\`.
- Write clear commit messages following Conventional Commits.
- Use \`git stash\` for quick context switches.
- Keep \`.gitignore\` up to date.
`,
  },

  // ─── CSS ───
  {
    category: 'css',
    title: 'Modern CSS Techniques',
    slug: 'modern-css',
    description: 'Master Flexbox, Grid, custom properties, container queries, and modern CSS features for responsive design.',
    tags: ['css', 'flexbox', 'grid', 'responsive', 'variables'],
    content: `## Introduction

Modern CSS has evolved far beyond floats and clearfixes. With Flexbox, Grid, custom properties, and new selectors, you can build sophisticated layouts with clean, maintainable code.

## Custom Properties (CSS Variables)

\`\`\`css
:root {
  --color-primary: oklch(0.65 0.24 265);
  --color-surface: oklch(0.15 0.02 265);
  --radius: 0.5rem;
  --shadow: 0 2px 8px oklch(0 0 0 / 0.15);
  --transition: 200ms ease;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform var(--transition);
}

.card:hover {
  transform: translateY(-2px);
}
\`\`\`

## Flexbox

The go-to for one-dimensional layouts:

\`\`\`css
/* Navigation bar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  gap: 1rem;
}

/* Center anything */
.center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* Responsive card row */
.card-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card-row > * {
  flex: 1 1 300px; /* grow, shrink, min-width */
}
\`\`\`

## CSS Grid

For two-dimensional layouts:

\`\`\`css
/* Page layout */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar content"
    "footer  footer";
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer  { grid-area: footer; }

/* Responsive grid — auto-fill columns */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
\`\`\`

## Responsive Design

\`\`\`css
/* Mobile-first approach */
.container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}

/* Container queries — scope styles to parent */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
  }
}
\`\`\`

## Modern Selectors

\`\`\`css
/* :has() — parent selector */
.card:has(img) {
  grid-template-rows: 200px 1fr;
}

/* :is() — reduce repetition */
:is(h1, h2, h3, h4) {
  line-height: 1.2;
  font-weight: 700;
}

/* :where() — zero specificity */
:where(.card, .panel, .dialog) {
  border-radius: var(--radius);
}

/* :not() — exclusion */
.list > *:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}
\`\`\`

## Animations

\`\`\`css
/* Transition */
.button {
  transition: background 200ms ease, transform 150ms ease;
}

.button:hover {
  transform: scale(1.02);
}

.button:active {
  transform: scale(0.98);
}

/* Keyframe animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 300ms ease forwards;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

## Summary

| Feature | Use Case |
|---------|----------|
| Custom properties | Theming, consistent values |
| Flexbox | Navbar, centering, card rows |
| Grid | Page layouts, galleries |
| Container queries | Component-level responsiveness |
| \`:has()\` | Style parent based on child |
| \`:is()\` / \`:where()\` | Reduce selector repetition |
`,
  },
];


// ---------- Main seeder ----------

async function seedDocs() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('xdoxs');
    const collection = db.collection('doc_drafts');

    let inserted = 0;
    let skipped = 0;

    for (const doc of sampleDocs) {
      // Skip if a doc with the same category+slug already exists
      const exists = await collection.findOne({ category: doc.category, slug: doc.slug });
      if (exists) {
        console.log(`⏭️  ${doc.category}/${doc.slug} already exists, skipping...`);
        skipped++;
        continue;
      }

      // Pre-render the markdown to HTML
      const renderedHtml = renderMarkdownSync(doc.content);

      const draft = {
        instructorId: 'seed-script',
        instructorEmail: 'instructor@xdoxs.com',
        category: doc.category,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        content: doc.content,
        renderedHtml,
        tags: doc.tags,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      };

      await collection.insertOne(draft);
      console.log(`✅ Created: ${doc.category}/${doc.slug} — "${doc.title}"`);
      inserted++;
    }

    console.log(`\n🎉 Seeding complete! ${inserted} created, ${skipped} skipped.`);
    console.log('\n📚 Sample docs:');
    for (const doc of sampleDocs) {
      console.log(`   /docs/${doc.category}/${doc.slug}`);
    }
    console.log('\n💡 Run "npm run build" or "npm run dev" to see the docs.');

  } catch (error) {
    console.error('❌ Error seeding docs:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedDocs();
