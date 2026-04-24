# React Hooks Complete Guide

:::en

## Introduction to React Hooks

React Hooks allow you to use state and other React features without writing a class component.

### What are Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components.

```javascript
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

## useState Hook

The `useState` hook lets you add state to function components.

### Basic Syntax

```javascript
const [state, setState] = useState(initialValue);
```

### Example with Multiple States

```javascript
function UserProfile() {
  const [name, setName] = useState('John');
  const [age, setAge] = useState(25);
  const [email, setEmail] = useState('john@example.com');
  
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

## useEffect Hook

The `useEffect` hook lets you perform side effects in function components.

### Basic Usage

```javascript
import { useEffect } from 'react';

function Example() {
  useEffect(() => {
    document.title = 'Component Mounted';
    
    // Cleanup function
    return () => {
      document.title = 'Component Unmounted';
    };
  }, []); // Empty array = run once on mount
}
```

### Effect with Dependencies

```javascript
function UserData({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // Re-run when userId changes
  
  return <div>{user?.name}</div>;
}
```

## useContext Hook

The `useContext` hook lets you consume context values without wrapping components.

```javascript
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button className={theme}>
      I'm a {theme} button
    </button>
  );
}
```

## Custom Hooks

You can create your own hooks to reuse stateful logic.

```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// Usage
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  
  return (
    <input 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
    />
  );
}
```

:::

:::hi

## React Hooks ka Introduction

React Hooks aapko class component likhe bina state aur React features use karne dete hain.

### Hooks kya hain?

Hooks aise functions hain jo aapko function components se React state aur lifecycle features ko "hook" karne dete hain.

```javascript
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

## useState Hook

`useState` hook aapko function components mein state add karne deta hai.

### Basic Syntax

```javascript
const [state, setState] = useState(initialValue);
```

### Multiple States ke saath Example

```javascript
function UserProfile() {
  const [name, setName] = useState('John');
  const [age, setAge] = useState(25);
  const [email, setEmail] = useState('john@example.com');
  
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

## useEffect Hook

`useEffect` hook aapko function components mein side effects perform karne deta hai.

### Basic Usage

```javascript
import { useEffect } from 'react';

function Example() {
  useEffect(() => {
    document.title = 'Component Mounted';
    
    // Cleanup function
    return () => {
      document.title = 'Component Unmounted';
    };
  }, []); // Empty array = sirf ek baar mount par run hoga
}
```

### Dependencies ke saath Effect

```javascript
function UserData({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, [userId]); // userId change hone par re-run hoga
  
  return <div>{user?.name}</div>;
}
```

## useContext Hook

`useContext` hook aapko components wrap kiye bina context values consume karne deta hai.

```javascript
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button className={theme}>
      Main ek {theme} button hoon
    </button>
  );
}
```

## Custom Hooks

Aap apne khud ke hooks bana sakte hain stateful logic reuse karne ke liye.

```javascript
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// Usage
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
  
  return (
    <input 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
    />
  );
}
```

:::
