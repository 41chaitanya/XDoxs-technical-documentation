---
title: "ReactFADFADF"
description: ""
date: 2026-04-09T11:01:41.323Z
author: "instructor@xdoxs.com"
category: "react"
tags: []
---

# React Components Basics

React components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.

## What are Components

Components are JavaScript functions or classes that return React elements describing what should appear on the screen. They accept inputs called props and return a tree of elements.

## Function Components

Function components are JavaScript functions that return JSX.

### Basic Function Component

```javascript
function Welcome() {
  return <h1>Hello, World!</h1>;
}
```

### Component with Props

```javascript
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Usage
<Greeting name="Alice" />
```

### Destructuring Props

```javascript
function UserCard({ name, email, age }) {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>Email: {email}</p>
      <p>Age: {age}</p>
    </div>
  );
}

// Usage
<UserCard name="John" email="john@example.com" age={30} />
```

## JSX Syntax

JSX is a syntax extension for JavaScript that looks similar to HTML.

### Basic JSX

```javascript
function App() {
  return (
    <div>
      <h1>Welcome to React</h1>
      <p>This is a paragraph</p>
    </div>
  );
}
```

### JavaScript Expressions in JSX

```javascript
function Calculator() {
  const a = 5;
  const b = 10;
  
  return (
    <div>
      <p>Sum: {a + b}</p>
      <p>Product: {a * b}</p>
    </div>
  );
}
```

### Conditional Rendering

```javascript
function LoginButton({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </div>
  );
}
```

### Lists and Keys

```javascript
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// Usage
const todos = [
  { id: 1, text: 'Learn React' },
  { id: 2, text: 'Build a project' },
  { id: 3, text: 'Deploy app' }
];

<TodoList todos={todos} />
```

## Props

Props are arguments passed to React components. They are read-only and should not be modified.

### Passing Props

```javascript
function Parent() {
  return (
    <Child 
      title="Hello" 
      count={42} 
      isActive={true}
      items={['a', 'b', 'c']}
    />
  );
}

function Child({ title, count, isActive, items }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <p>Active: {isActive ? 'Yes' : 'No'}</p>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Default Props

```javascript
function Button({ text, color }) {
  return (
    <button style={{ backgroundColor: color }}>
      {text}
    </button>
  );
}

Button.defaultProps = {
  text: 'Click me',
  color: 'blue'
};
```

### Children Prop

```javascript
function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content goes here</p>
</Card>
```

## Event Handling

React events are named using camelCase and you pass a function as the event handler.

### Click Events

```javascript
function ClickButton() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}
```

### Event with Parameters

```javascript
function ItemList() {
  const handleDelete = (id) => {
    console.log(`Deleting item ${id}`);
  };

  return (
    <div>
      <button onClick={() => handleDelete(1)}>
        Delete Item 1
      </button>
      <button onClick={() => handleDelete(2)}>
        Delete Item 2
      </button>
    </div>
  );
}
```

### Form Events

```javascript
function LoginForm() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    console.log({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Input Change Events

```javascript
function SearchBox() {
  const handleChange = (event) => {
    console.log('Search query:', event.target.value);
  };

  return (
    <input 
      type="text" 
      placeholder="Search..." 
      onChange={handleChange}
    />
  );
}
```


# React Hooks Guide

React Hooks are functions that let you use state and other React features in functional components. Introduced in React 16.8, hooks have revolutionized how we write React applications.

## Introduction to Hooks

Before hooks, state and lifecycle methods were only available in class components. Hooks allow functional components to have the same capabilities, making code more reusable and easier to understand.

Hooks follow two main rules:
- Only call hooks at the top level of your component
- Only call hooks from React function components or custom hooks

## useState Hook

The useState hook allows you to add state to functional components.

### Basic Usage

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

### Multiple State Variables

```javascript
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

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
      <input 
        type="number"
        value={age} 
        onChange={(e) => setAge(Number(e.target.value))} 
        placeholder="Age"
      />
    </form>
  );
}
```

### State with Objects

```javascript
function UserProfile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    age: 0
  });

  const updateName = (name) => {
    setUser(prevUser => ({
      ...prevUser,
      name: name
    }));
  };

  return (
    <div>
      <input 
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  );
}
```

### Functional Updates

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    // Use functional update when new state depends on previous state
    setCount(prevCount => prevCount + 1);
  };

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}
```

## useEffect Hook

The useEffect hook lets you perform side effects in functional components. It combines componentDidMount, componentDidUpdate, and componentWillUnmount.

### Basic Usage

```javascript
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []); // Empty array means run once on mount

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
```

### Dependency Array

```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // This effect runs whenever query changes
    fetch(`https://api.example.com/search?q=${query}`)
      .then(response => response.json())
      .then(data => setResults(data));
  }, [query]); // Re-run when query changes

  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Cleanup Function

```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div>Seconds: {seconds}</div>;
}
```

### Multiple Effects

```javascript
function UserDashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // Effect for fetching user
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  // Effect for fetching posts
  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then(res => res.json())
      .then(setPosts);
  }, [userId]);

  return (
    <div>
      <h1>{user?.name}</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## useContext Hook

The useContext hook provides a way to pass data through the component tree without prop drilling.

### Creating Context

```javascript
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Using Context

```javascript
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      Toggle Theme
    </button>
  );
}
```

### App Structure

```javascript
function App() {
  return (
    <ThemeProvider>
      <div>
        <ThemedButton />
        <ThemedContent />
      </div>
    </ThemeProvider>
  );
}
```


# React State Management

State management is crucial for building interactive React applications. This guide covers different approaches to managing state in React.

## Component State

Component state is data that changes over time and affects what the component renders.

## useState for Local State

The useState hook is the simplest way to add state to functional components.

### Counter Example

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Form State

```javascript
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

## useReducer for Complex State

useReducer is useful when state logic is complex or involves multiple sub-values.

### Basic Reducer

```javascript
import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error('Unknown action');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        Increment
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        Decrement
      </button>
      <button onClick={() => dispatch({ type: 'reset' })}>
        Reset
      </button>
    </div>
  );
}
```

### Todo List with Reducer

```javascript
function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, {
        id: Date.now(),
        text: action.text,
        completed: false
      }];
    case 'toggle':
      return state.map(todo =>
        todo.id === action.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case 'delete':
      return state.filter(todo => todo.id !== action.id);
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      dispatch({ type: 'add', text: input });
      setInput('');
    }
  };

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add todo"
      />
      <button onClick={handleAdd}>Add</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'toggle', id: todo.id })}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch({ type: 'delete', id: todo.id })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Lifting State Up

When multiple components need to share state, lift it up to their closest common ancestor.

### Shared State Example

```javascript
function TemperatureConverter() {
  const [celsius, setCelsius] = useState('');

  const handleCelsiusChange = (value) => {
    setCelsius(value);
  };

  const fahrenheit = celsius ? (celsius * 9/5 + 32).toFixed(1) : '';

  return (
    <div>
      <TemperatureInput
        scale="Celsius"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      <TemperatureInput
        scale="Fahrenheit"
        temperature={fahrenheit}
        onTemperatureChange={(f) => {
          const c = ((f - 32) * 5/9).toFixed(1);
          setCelsius(c);
        }}
      />
    </div>
  );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  return (
    <div>
      <label>
        Temperature in {scale}:
        <input
          value={temperature}
          onChange={(e) => onTemperatureChange(e.target.value)}
        />
      </label>
    </div>
  );
}
```

## Context for Global State

Context provides a way to pass data through the component tree without prop drilling.

### Auth Context Example

```javascript
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in components
function LoginButton() {
  const { user, login, logout } = useAuth();

  if (user) {
    return (
      <div>
        <span>Welcome, {user.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <button onClick={() => login({ name: 'John', email: 'john@example.com' })}>
      Login
    </button>
  );
}

// App setup
function App() {
  return (
    <AuthProvider>
      <LoginButton />
    </AuthProvider>
  );
}
```
