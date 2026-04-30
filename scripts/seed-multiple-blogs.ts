import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/models';

async function seedMultipleBlogs() {
  try {
    const db = await getDb();

    // Get instructor and student users
    const instructor = await db.collection(COLLECTIONS.USERS).findOne({ role: 'instructor' });
    const student = await db.collection(COLLECTIONS.USERS).findOne({ role: 'student' });
    
    if (!instructor || !student) {
      console.error('Users not found. Please run seed-users.ts first.');
      process.exit(1);
    }

    const blogs = [
      {
        authorId: student._id.toString(),
        authorEmail: student.email,
        authorName: student.fullName,
        authorRole: 'student' as const,
        title: 'Understanding JavaScript Closures: A Beginner\'s Guide',
        slug: 'understanding-javascript-closures-beginners-guide',
        excerpt: 'Closures are one of the most powerful features in JavaScript. Learn what they are, how they work, and when to use them with practical examples.',
        content: `
<h2>What Are Closures?</h2>

<p>A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned. This is one of JavaScript's most powerful and often misunderstood features.</p>

<h2>Basic Example</h2>

<pre><code>function outer() {
  const message = 'Hello';
  
  function inner() {
    console.log(message); // Can access 'message'
  }
  
  return inner;
}

const myFunction = outer();
myFunction(); // Logs: "Hello"</code></pre>

<p>Even though <code>outer()</code> has finished executing, <code>inner()</code> still has access to the <code>message</code> variable. This is a closure!</p>

<h2>Practical Use Cases</h2>

<h3>1. Data Privacy</h3>

<pre><code>function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
// count is not directly accessible!</code></pre>

<h3>2. Event Handlers</h3>

<pre><code>function setupButton(buttonId) {
  const button = document.getElementById(buttonId);
  let clickCount = 0;
  
  button.addEventListener('click', () => {
    clickCount++;
    console.log(\`Clicked \${clickCount} times\`);
  });
}</code></pre>

<h2>Common Pitfalls</h2>

<blockquote>
<p>The most common mistake with closures is in loops!</p>
</blockquote>

<pre><code>// ❌ Wrong
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// Logs: 3, 3, 3

// ✅ Correct (using let)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 1000);
}
// Logs: 0, 1, 2</code></pre>

<h2>Key Takeaways</h2>

<ul>
  <li>Closures give functions access to their outer scope</li>
  <li>They're created every time a function is created</li>
  <li>Great for data privacy and encapsulation</li>
  <li>Be careful with loops and <code>var</code></li>
</ul>

<p>Master closures, and you'll write better JavaScript code!</p>
`,
        coverImage: null,
        category: 'javascript',
        tags: ['javascript', 'tutorial'],
        status: 'published' as const,
        views: 89,
        likes: 15,
        createdAt: new Date('2026-04-28'),
        updatedAt: new Date('2026-04-28'),
        publishedAt: new Date('2026-04-28'),
      },
      {
        authorId: instructor._id.toString(),
        authorEmail: instructor.email,
        authorName: instructor.fullName,
        authorRole: 'instructor' as const,
        title: 'Node.js vs Deno vs Bun: Which Runtime Should You Choose in 2026?',
        slug: 'nodejs-vs-deno-vs-bun-comparison-2026',
        excerpt: 'A comprehensive comparison of the three major JavaScript runtimes. Learn the pros, cons, and use cases for each to make an informed decision.',
        content: `
<h2>The JavaScript Runtime Landscape</h2>

<p>In 2026, JavaScript developers have three major runtime options: Node.js, Deno, and Bun. Each has its strengths and ideal use cases. Let's break them down.</p>

<h2>Node.js: The Veteran</h2>

<h3>Pros</h3>
<ul>
  <li>Massive ecosystem (npm has 2M+ packages)</li>
  <li>Battle-tested in production</li>
  <li>Excellent documentation and community</li>
  <li>Wide industry adoption</li>
</ul>

<h3>Cons</h3>
<ul>
  <li>Slower than newer alternatives</li>
  <li>CommonJS/ESM confusion</li>
  <li>No built-in TypeScript support</li>
  <li>Security model requires careful management</li>
</ul>

<h3>Best For</h3>
<p>Enterprise applications, projects requiring extensive npm packages, teams with existing Node.js expertise.</p>

<h2>Deno: The Secure Alternative</h2>

<h3>Pros</h3>
<ul>
  <li>Built-in TypeScript support</li>
  <li>Secure by default (explicit permissions)</li>
  <li>Modern standard library</li>
  <li>No package.json or node_modules</li>
</ul>

<h3>Cons</h3>
<ul>
  <li>Smaller ecosystem</li>
  <li>Some npm packages incompatible</li>
  <li>Less industry adoption</li>
</ul>

<h3>Best For</h3>
<p>Security-critical applications, TypeScript projects, modern web APIs.</p>

<h2>Bun: The Speed Demon</h2>

<h3>Pros</h3>
<ul>
  <li>Incredibly fast (3x faster than Node.js)</li>
  <li>Built-in bundler, transpiler, and test runner</li>
  <li>npm package compatibility</li>
  <li>Native TypeScript and JSX support</li>
</ul>

<h3>Cons</h3>
<ul>
  <li>Newest, less mature</li>
  <li>Smaller community</li>
  <li>Some edge cases still being ironed out</li>
</ul>

<h3>Best For</h3>
<p>Performance-critical applications, modern full-stack projects, developer experience.</p>

<h2>Performance Comparison</h2>

<pre><code>// HTTP Server Benchmark (requests/sec)
Bun:     ~135,000
Node.js: ~45,000
Deno:    ~50,000

// Cold Start Time
Bun:     ~15ms
Deno:    ~25ms
Node.js: ~30ms</code></pre>

<h2>My Recommendation</h2>

<blockquote>
<p>Choose based on your priorities: ecosystem (Node.js), security (Deno), or performance (Bun).</p>
</blockquote>

<p><strong>For most projects in 2026:</strong> Start with Bun if you want cutting-edge performance and DX. Use Node.js if you need maximum ecosystem compatibility. Choose Deno for security-first applications.</p>

<h2>Migration Path</h2>

<p>The good news? All three runtimes support similar APIs, making migration relatively straightforward. Start with one, and you can always switch later!</p>
`,
        coverImage: null,
        category: 'nodejs',
        tags: ['nodejs', 'javascript', 'tutorial'],
        status: 'published' as const,
        views: 203,
        likes: 42,
        createdAt: new Date('2026-04-26'),
        updatedAt: new Date('2026-04-26'),
        publishedAt: new Date('2026-04-26'),
      },
      {
        authorId: student._id.toString(),
        authorEmail: student.email,
        authorName: student.fullName,
        authorRole: 'student' as const,
        title: 'My Journey from Student to Junior Developer: Lessons Learned',
        slug: 'student-to-junior-developer-journey-lessons',
        excerpt: 'Real advice from someone who just landed their first dev job. What worked, what didn\'t, and what I wish I knew earlier.',
        content: `
<h2>The Beginning</h2>

<p>Six months ago, I was a student struggling with JavaScript basics. Today, I'm a junior developer at a tech startup. Here's what I learned along the way.</p>

<h2>What Actually Mattered</h2>

<h3>1. Build Real Projects</h3>

<p>Tutorials are great, but employers want to see what you can build. I created:</p>

<ul>
  <li>A task management app (React + Node.js)</li>
  <li>A weather dashboard (API integration)</li>
  <li>A blog platform (full-stack)</li>
</ul>

<p>These projects got me more interviews than my degree ever did.</p>

<h3>2. Learn Git Properly</h3>

<p>I can't stress this enough. Learn:</p>

<pre><code>git init
git add .
git commit -m "message"
git push origin main
git pull
git branch
git merge</code></pre>

<p>Also, write good commit messages! "Fixed stuff" won't cut it.</p>

<h3>3. Understand the Fundamentals</h3>

<p>Don't just learn frameworks. Understand:</p>

<ul>
  <li>How JavaScript actually works (closures, promises, async/await)</li>
  <li>HTTP and REST APIs</li>
  <li>Database basics (SQL and NoSQL)</li>
  <li>Authentication and security</li>
</ul>

<h2>What Didn't Matter (As Much)</h2>

<h3>1. Knowing Every Framework</h3>

<p>You don't need to know React, Vue, Angular, Svelte, and Solid. Pick one, master it, then learn others if needed.</p>

<h3>2. Perfect Code</h3>

<p>Your first code will be messy. That's okay! Focus on making it work, then make it better.</p>

<h3>3. Fancy Algorithms</h3>

<p>Yes, learn data structures and algorithms. But in my first 3 months, I've used them way less than I expected. CRUD operations and API calls are 90% of the job.</p>

<h2>The Interview Process</h2>

<blockquote>
<p>"Be honest about what you don't know. Employers value honesty and willingness to learn."</p>
</blockquote>

<p>I applied to 50+ companies. Got 8 interviews. Received 2 offers. The key?</p>

<ul>
  <li>Tailored resume for each application</li>
  <li>Portfolio website showcasing projects</li>
  <li>Active GitHub with regular commits</li>
  <li>LinkedIn presence with tech content</li>
</ul>

<h2>First Month on the Job</h2>

<p>Reality check: I felt lost for the first two weeks. The codebase was huge, the tools were new, and imposter syndrome hit hard.</p>

<p>But here's what helped:</p>

<ol>
  <li>Ask questions (lots of them)</li>
  <li>Take notes on everything</li>
  <li>Pair program with senior devs</li>
  <li>Read the existing code</li>
  <li>Start with small tasks</li>
</ol>

<h2>Advice for Current Students</h2>

<h3>Do This:</h3>
<ul>
  <li>✅ Build projects you're proud of</li>
  <li>✅ Contribute to open source</li>
  <li>✅ Network on Twitter/LinkedIn</li>
  <li>✅ Write technical blogs</li>
  <li>✅ Practice coding daily</li>
</ul>

<h3>Avoid This:</h3>
<ul>
  <li>❌ Tutorial hell (build instead)</li>
  <li>❌ Perfectionism (ship it!)</li>
  <li>❌ Comparing yourself to others</li>
  <li>❌ Giving up after rejections</li>
</ul>

<h2>Final Thoughts</h2>

<p>The journey from student to developer is challenging but absolutely achievable. Focus on consistent progress, not perfection. Build things, share your work, and keep learning.</p>

<p>You've got this! 🚀</p>

<hr>

<p><em>Feel free to reach out if you have questions. I'm happy to help fellow students on their journey!</em></p>
`,
        coverImage: null,
        category: 'career',
        tags: ['career', 'tutorial'],
        status: 'published' as const,
        views: 156,
        likes: 38,
        createdAt: new Date('2026-04-27'),
        updatedAt: new Date('2026-04-27'),
        publishedAt: new Date('2026-04-27'),
      },
    ];

    // Check and delete existing blogs
    for (const blog of blogs) {
      const existing = await db.collection(COLLECTIONS.BLOG_POSTS).findOne({ slug: blog.slug });
      if (existing) {
        await db.collection(COLLECTIONS.BLOG_POSTS).deleteOne({ _id: existing._id });
        console.log(`🗑️  Deleted existing blog: ${blog.title}`);
      }
    }

    // Insert all blogs
    const result = await db.collection(COLLECTIONS.BLOG_POSTS).insertMany(blogs);

    console.log('\n✅ Multiple sample blogs created successfully!\n');
    
    blogs.forEach((blog, index) => {
      console.log(`📝 Blog ${index + 1}:`);
      console.log(`   Title: ${blog.title}`);
      console.log(`   Author: ${blog.authorName} (${blog.authorRole})`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Views: ${blog.views}`);
      console.log(`   URL: http://localhost:4321/blogs/${blog.slug}\n`);
    });

    console.log('🎉 All blogs seeded! Visit http://localhost:4321/blogs to see them.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

seedMultipleBlogs();
