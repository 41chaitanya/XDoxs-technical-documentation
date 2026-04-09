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
