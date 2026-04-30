import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/models';

async function seedSampleBlog() {
  try {
    const db = await getDb();

    // Get an instructor user to be the author
    const instructor = await db.collection(COLLECTIONS.USERS).findOne({ role: 'instructor' });
    
    if (!instructor) {
      console.error('No instructor found. Please run seed-users.ts first.');
      process.exit(1);
    }

    // Check if blog already exists
    const existingBlog = await db.collection(COLLECTIONS.BLOG_POSTS).findOne({ 
      slug: 'react-vite-8-tailwind-compatibility-issue-solved' 
    });

    if (existingBlog) {
      console.log('Sample blog already exists. Deleting and recreating...');
      await db.collection(COLLECTIONS.BLOG_POSTS).deleteOne({ _id: existingBlog._id });
    }

    const blogContent = `
<h2>The Problem: Vite 8 Breaking Tailwind CSS</h2>

<p>If you've recently upgraded to Vite 8 in your React project, you might have encountered a frustrating issue where Tailwind CSS suddenly stops working. Your styles disappear, and your beautifully designed components look like they're from the 90s. Don't panic – you're not alone, and there's a solution!</p>

<h2>Understanding the Root Cause</h2>

<p>Vite 8 introduced significant changes to how it handles CSS processing and PostCSS plugins. The main issue stems from:</p>

<ul>
  <li><strong>PostCSS Configuration Changes:</strong> Vite 8 now requires explicit PostCSS configuration in certain scenarios</li>
  <li><strong>Import Resolution:</strong> The way Vite resolves CSS imports has been updated for better performance</li>
  <li><strong>Build Optimization:</strong> New tree-shaking algorithms can sometimes incorrectly remove Tailwind utilities</li>
</ul>

<h2>Quick Fix: Update Your Configuration</h2>

<p>Here's the step-by-step solution that worked for me and hundreds of other developers:</p>

<h3>Step 1: Update Your Dependencies</h3>

<p>First, make sure you're using compatible versions:</p>

<pre><code>npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npm install vite@^8.0.0</code></pre>

<h3>Step 2: Create/Update postcss.config.js</h3>

<p>In your project root, create or update <code>postcss.config.js</code>:</p>

<pre><code>export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}</code></pre>

<p><strong>Important:</strong> Use ES module syntax (<code>export default</code>) instead of CommonJS (<code>module.exports</code>) for Vite 8 compatibility.</p>

<h3>Step 3: Update vite.config.js</h3>

<p>Add explicit CSS configuration to your Vite config:</p>

<pre><code>import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
})</code></pre>

<h3>Step 4: Verify Your Tailwind Config</h3>

<p>Make sure your <code>tailwind.config.js</code> has the correct content paths:</p>

<pre><code>/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}</code></pre>

<h3>Step 5: Check Your CSS Import</h3>

<p>In your main CSS file (usually <code>index.css</code> or <code>App.css</code>), ensure you have:</p>

<pre><code>@tailwind base;
@tailwind components;
@tailwind utilities;</code></pre>

<p>And import it in your <code>main.jsx</code> or <code>main.tsx</code>:</p>

<pre><code>import './index.css'</code></pre>

<h2>Advanced Solution: Content Configuration</h2>

<p>If the basic fix doesn't work, you might need to be more explicit with your content configuration:</p>

<pre><code>export default {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    extract: {
      // Include dynamic class names
      include: ['**/*.{js,jsx,ts,tsx}'],
    },
  },
  // ... rest of config
}</code></pre>

<h2>Common Pitfalls to Avoid</h2>

<blockquote>
<p>"The devil is in the details" – and with Vite 8 + Tailwind, this couldn't be more true.</p>
</blockquote>

<ol>
  <li><strong>Mixing Module Systems:</strong> Don't mix CommonJS and ES modules in your config files</li>
  <li><strong>Cache Issues:</strong> Clear your <code>node_modules/.vite</code> cache if styles still don't appear</li>
  <li><strong>Dynamic Classes:</strong> Avoid string concatenation for Tailwind classes – use complete class names</li>
  <li><strong>Import Order:</strong> Make sure your CSS import comes before component imports</li>
</ol>

<h2>Testing Your Fix</h2>

<p>After making these changes:</p>

<pre><code># Clear cache and reinstall
rm -rf node_modules/.vite
rm -rf dist

# Restart dev server
npm run dev</code></pre>

<p>Your Tailwind styles should now work perfectly with Vite 8!</p>

<h2>Why This Happens</h2>

<p>Vite 8's improved performance comes from stricter module resolution and better tree-shaking. While this makes your builds faster and smaller, it requires more explicit configuration for CSS processors like Tailwind.</p>

<p>The Vite team made these changes to:</p>

<ul>
  <li>Improve cold start times by 40%</li>
  <li>Reduce bundle sizes through better dead code elimination</li>
  <li>Enhance HMR (Hot Module Replacement) reliability</li>
</ul>

<h2>Alternative: Using Vite's CSS Modules</h2>

<p>If you're still having issues, consider using Vite's built-in CSS modules alongside Tailwind:</p>

<pre><code>// Component.module.css
.container {
  @apply flex items-center justify-center;
}

// Component.jsx
import styles from './Component.module.css'

function Component() {
  return &lt;div className={styles.container}&gt;...&lt;/div&gt;
}</code></pre>

<h2>Conclusion</h2>

<p>The Vite 8 and Tailwind compatibility issue is frustrating but easily fixable. The key is ensuring your configuration files use ES module syntax and explicitly define PostCSS processing.</p>

<p>Remember:</p>
<ul>
  <li>✅ Use <code>export default</code> in config files</li>
  <li>✅ Explicitly configure PostCSS in Vite config</li>
  <li>✅ Clear cache when making config changes</li>
  <li>✅ Use complete class names (no string concatenation)</li>
</ul>

<p>Have you encountered this issue? What solution worked for you? Drop a comment below and let's help the community!</p>

<hr>

<p><em>Last updated: April 2026 | Tested with Vite 8.0.0, React 18.3.0, and Tailwind CSS 4.0.0</em></p>
`;

    const blog = {
      authorId: instructor._id.toString(),
      authorEmail: instructor.email,
      authorName: instructor.fullName,
      authorRole: 'instructor' as const,
      title: 'React + Vite 8 Not Compatible with Tailwind? Here\'s the Fix!',
      slug: 'react-vite-8-tailwind-compatibility-issue-solved',
      excerpt: 'Upgraded to Vite 8 and your Tailwind styles disappeared? Learn why this happens and how to fix it in 5 minutes with this comprehensive guide.',
      content: blogContent,
      coverImage: null,
      category: 'react',
      tags: ['react', 'javascript', 'tutorial'],
      status: 'published' as const,
      views: 127,
      likes: 23,
      createdAt: new Date('2026-04-25'),
      updatedAt: new Date('2026-04-25'),
      publishedAt: new Date('2026-04-25'),
    };

    const result = await db.collection(COLLECTIONS.BLOG_POSTS).insertOne(blog);

    console.log('✅ Sample blog created successfully!');
    console.log(`   Blog ID: ${result.insertedId}`);
    console.log(`   Title: ${blog.title}`);
    console.log(`   Slug: ${blog.slug}`);
    console.log(`   Author: ${blog.authorName}`);
    console.log(`   Category: ${blog.category}`);
    console.log(`   Status: ${blog.status}`);
    console.log('\n📝 View at: http://localhost:4321/blogs/' + blog.slug);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample blog:', error);
    process.exit(1);
  }
}

seedSampleBlog();
