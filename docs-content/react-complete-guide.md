---
title: React Complete Guide - Components, Hooks, and JSX
description: Complete React guide covering components, hooks (useState, useEffect, useContext), and JSX. Learn React fundamentals with practical examples in English and Hindi.
category: react
slug: react-complete-guide
tags: [react, components, hooks, jsx, useState, useEffect, useContext]
author: XDoxs Team
date: 2026-04-16
featured: true
---

# React Complete Guide

:::lang en

## 1. React Components - Building Blocks

### What are Components?

React components are **independent, reusable pieces of code** that return HTML elements. Think of them as JavaScript functions that accept inputs (props) and return React elements.

### Functional Components

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="John" />
```

### Component with Props

```jsx
function UserCard({ name, email, avatar }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

### Component Composition

```jsx
function App() {
  return (
    <div>
      <Header />
      <UserCard name="John" email="john@example.com" />
      <Footer />
    </div>
  );
}
```

---

## 2. React Hooks - useState

### Managing State

`useState` lets you add state to functional components.

```jsx
import { useState } from 'react';

function Counter() {
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

### Multiple States

```jsx
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
    </form>
  );
}
```

### State with Objects

```jsx
function UserProfile() {
  const [user, setUser] = useState({
    name: 'John',
    age: 25
  });

  const updateName = (newName) => {
    setUser({ ...user, name: newName });
  };

  return <h2>{user.name}, Age: {user.age}</h2>;
}
```

---

## 3. React Hooks - useEffect

### Side Effects and Lifecycle

`useEffect` lets you perform side effects like data fetching, subscriptions, or DOM updates.

### Basic Usage

```jsx
import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    document.title = `Timer: ${seconds}s`;
  });

  return <p>Seconds: {seconds}</p>;
}
```

### With Dependency Array

```jsx
function UserData({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Only runs when userId changes

  return <div>{user?.name}</div>;
}
```

### Cleanup Function

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = connectToRoom(roomId);
    
    return () => {
      connection.disconnect(); // Cleanup
    };
  }, [roomId]);

  return <div>Chat Room</div>;
}
```

### Common Patterns

**Fetch Data Once:**
```jsx
useEffect(() => {
  fetch('/api/posts')
    .then(res => res.json())
    .then(data => setPosts(data));
}, []); // Empty array = run once
```

**Event Listeners:**
```jsx
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

:::

:::lang hi

## 1. React Components - Building Blocks

### Components Kya Hain?

React components **independent, reusable code pieces** hain jo HTML elements return karte hain. Inhe JavaScript functions ki tarah samjho jo inputs (props) accept karte hain.

### Functional Components

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="John" />
```

### Props ke Saath Component

```jsx
function UserCard({ name, email, avatar }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

### Component Composition

```jsx
function App() {
  return (
    <div>
      <Header />
      <UserCard name="John" email="john@example.com" />
      <Footer />
    </div>
  );
}
```

---

## 2. React Hooks - useState

### State Manage Karna

`useState` functional components me state add karne deta hai.

```jsx
import { useState } from 'react';

function Counter() {
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

### Multiple States

```jsx
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
    </form>
  );
}
```

### Objects ke Saath State

```jsx
function UserProfile() {
  const [user, setUser] = useState({
    name: 'John',
    age: 25
  });

  const updateName = (newName) => {
    setUser({ ...user, name: newName });
  };

  return <h2>{user.name}, Age: {user.age}</h2>;
}
```

---

## 3. React Hooks - useEffect

### Side Effects aur Lifecycle

`useEffect` side effects perform karne deta hai jaise data fetching, subscriptions, ya DOM updates.

### Basic Usage

```jsx
import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    document.title = `Timer: ${seconds}s`;
  });

  return <p>Seconds: {seconds}</p>;
}
```

### Dependency Array ke Saath

```jsx
function UserData({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Sirf userId change hone par chale

  return <div>{user?.name}</div>;
}
```

### Cleanup Function

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = connectToRoom(roomId);
    
    return () => {
      connection.disconnect(); // Cleanup
    };
  }, [roomId]);

  return <div>Chat Room</div>;
}
```

### Common Patterns

**Ek Baar Data Fetch Karo:**
```jsx
useEffect(() => {
  fetch('/api/posts')
    .then(res => res.json())
    .then(data => setPosts(data));
}, []); // Empty array = ek baar chalo
```

**Event Listeners:**
```jsx
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

:::
