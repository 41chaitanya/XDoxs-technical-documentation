/**
 * Local Testing Setup Script
 * 
 * This script sets up test data in MongoDB for local development
 * Run this when you don't have AWS credentials and want to test locally
 * 
 * Usage: npm run test-setup
 */

import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/models';
import { hashPassword } from '../src/lib/auth/password';

async function setupTestData() {
  console.log('🔧 Setting up local test data...\n');

  try {
    const db = await getDb();

    // 1. Create test users
    console.log('👤 Creating test users...');
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
    // Check if users already exist
    const existingAdmin = await usersCollection.findOne({ email: 'admin@test.com' });
    const existingInstructor = await usersCollection.findOne({ email: 'instructor@test.com' });
    const existingStudent = await usersCollection.findOne({ email: 'student@test.com' });

    if (!existingAdmin) {
      await usersCollection.insertOne({
        email: 'admin@test.com',
        passwordHash: await hashPassword('ramram'),
        role: 'super_admin',
        createdAt: new Date(),
      });
      console.log('   ✅ Admin user created: admin@test.com / ramram');
    } else {
      console.log('   ℹ️  Admin user already exists');
    }

    if (!existingInstructor) {
      await usersCollection.insertOne({
        email: 'instructor@test.com',
        passwordHash: await hashPassword('ramram'),
        role: 'instructor',
        createdAt: new Date(),
      });
      console.log('   ✅ Instructor user created: instructor@test.com / ramram');
    } else {
      console.log('   ℹ️  Instructor user already exists');
    }

    if (!existingStudent) {
      await usersCollection.insertOne({
        email: 'student@test.com',
        passwordHash: await hashPassword('ramram'),
        role: 'student',
        createdAt: new Date(),
      });
      console.log('   ✅ Student user created: student@test.com / ramram');
    } else {
      console.log('   ℹ️  Student user already exists');
    }

    // 2. Create sample documentation
    console.log('\n📚 Creating sample documentation...');
    const draftsCollection = db.collection(COLLECTIONS.DOC_DRAFTS);

    const instructor = await usersCollection.findOne({ email: 'instructor@test.com' });
    const instructorId = instructor?._id.toString() || 'test-instructor-id';

    // Sample React doc
    const sampleReactDoc = {
      instructorId,
      instructorEmail: 'instructor@test.com',
      category: 'react',
      title: 'React Hooks Complete Guide',
      slug: 'react-hooks-complete-guide',
      description: 'Learn React Hooks from basics to advanced concepts',
      content: `## Introduction to React Hooks

React Hooks allow you to use state and other React features without writing a class.

### What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components.

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

## useState Hook

The useState hook lets you add state to function components.

### Basic Usage

\`\`\`javascript
const [state, setState] = useState(initialValue);
\`\`\`

## useEffect Hook

The useEffect hook lets you perform side effects in function components.

### Example

\`\`\`javascript
import { useEffect } from 'react';

function Example() {
  useEffect(() => {
    document.title = 'Component Mounted';
    
    return () => {
      document.title = 'Component Unmounted';
    };
  }, []);
}
\`\`\``,
      topics: [
        {
          id: 'intro-hooks',
          title: 'Introduction to React Hooks',
          content: `## Introduction to React Hooks

React Hooks allow you to use state and other React features without writing a class.

### What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components.

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\``,
          order: 0,
        },
        {
          id: 'usestate-hook',
          title: 'useState Hook',
          content: `## useState Hook

The useState hook lets you add state to function components.

### Basic Usage

\`\`\`javascript
const [state, setState] = useState(initialValue);
\`\`\``,
          order: 1,
        },
        {
          id: 'useeffect-hook',
          title: 'useEffect Hook',
          content: `## useEffect Hook

The useEffect hook lets you perform side effects in function components.

### Example

\`\`\`javascript
import { useEffect } from 'react';

function Example() {
  useEffect(() => {
    document.title = 'Component Mounted';
    
    return () => {
      document.title = 'Component Unmounted';
    };
  }, []);
}
\`\`\``,
          order: 2,
        },
      ],
      tags: ['react', 'hooks', 'beginner'],
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Sample JavaScript doc
    const sampleJSDoc = {
      instructorId,
      instructorEmail: 'instructor@test.com',
      category: 'javascript',
      title: 'JavaScript ES6 Features',
      slug: 'javascript-es6-features',
      description: 'Modern JavaScript features introduced in ES6',
      content: `## Arrow Functions

Arrow functions provide a shorter syntax for writing functions.

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\`

## Destructuring

Destructuring allows you to extract values from arrays or objects.

\`\`\`javascript
const person = { name: 'John', age: 30 };
const { name, age } = person;

const numbers = [1, 2, 3];
const [first, second] = numbers;
\`\`\`

## Template Literals

Template literals allow embedded expressions and multi-line strings.

\`\`\`javascript
const name = 'World';
const greeting = \`Hello, \${name}!\`;
\`\`\``,
      topics: [
        {
          id: 'arrow-functions',
          title: 'Arrow Functions',
          content: `## Arrow Functions

Arrow functions provide a shorter syntax for writing functions.

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\``,
          order: 0,
        },
        {
          id: 'destructuring',
          title: 'Destructuring',
          content: `## Destructuring

Destructuring allows you to extract values from arrays or objects.

\`\`\`javascript
const person = { name: 'John', age: 30 };
const { name, age } = person;

const numbers = [1, 2, 3];
const [first, second] = numbers;
\`\`\``,
          order: 1,
        },
        {
          id: 'template-literals',
          title: 'Template Literals',
          content: `## Template Literals

Template literals allow embedded expressions and multi-line strings.

\`\`\`javascript
const name = 'World';
const greeting = \`Hello, \${name}!\`;
\`\`\``,
          order: 2,
        },
      ],
      tags: ['javascript', 'es6', 'beginner'],
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if docs already exist
    const existingReactDoc = await draftsCollection.findOne({ slug: 'react-hooks-complete-guide' });
    const existingJSDoc = await draftsCollection.findOne({ slug: 'javascript-es6-features' });

    if (!existingReactDoc) {
      await draftsCollection.insertOne(sampleReactDoc);
      console.log('   ✅ React Hooks doc created');
    } else {
      console.log('   ℹ️  React Hooks doc already exists');
    }

    if (!existingJSDoc) {
      await draftsCollection.insertOne(sampleJSDoc);
      console.log('   ✅ JavaScript ES6 doc created');
    } else {
      console.log('   ℹ️  JavaScript ES6 doc already exists');
    }

    console.log('\n✅ Test data setup complete!\n');
    console.log('📝 You can now:');
    console.log('   1. Login as admin: admin@test.com / ramram');
    console.log('   2. Login as instructor: instructor@test.com / ramram');
    console.log('   3. Login as student: student@test.com / ramram');
    console.log('   4. View docs at: http://localhost:4321/docs/react/react-hooks-complete-guide');
    console.log('   5. View docs at: http://localhost:4321/docs/javascript/javascript-es6-features');
    console.log('\n🚀 Run: npm run test-mongo\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();
