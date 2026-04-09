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
