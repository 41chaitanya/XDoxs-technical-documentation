---
title: TypeScript Basics - Types, Interfaces, and Type Safety
description: Learn TypeScript fundamentals including basic types, interfaces, and type annotations. Complete guide with practical examples in English and Hindi.
category: typescript
slug: typescript-basics
tags: [typescript, types, interfaces, type-safety, javascript]
author: XDoxs Team
date: 2026-04-16
featured: true
---

# TypeScript Basics

:::lang en

## 1. Basic Types - Type Annotations

### What is TypeScript?

TypeScript is **JavaScript with syntax for types**. It helps catch errors early and makes code more maintainable.

### Primitive Types

```typescript
// String
let name: string = "John";
let message: string = 'Hello World';

// Number
let age: number = 25;
let price: number = 99.99;

// Boolean
let isActive: boolean = true;
let isCompleted: boolean = false;

// Null and Undefined
let nothing: null = null;
let notDefined: undefined = undefined;
```

### Arrays

```typescript
// Array of numbers
let numbers: number[] = [1, 2, 3, 4, 5];

// Array of strings
let fruits: string[] = ['apple', 'banana', 'orange'];

// Alternative syntax
let scores: Array<number> = [90, 85, 95];

// Mixed types (not recommended)
let mixed: any[] = [1, 'hello', true];
```

### Objects

```typescript
// Object type
let user: {
  name: string;
  age: number;
  email: string;
} = {
  name: "John",
  age: 25,
  email: "john@example.com"
};

// Optional properties
let product: {
  name: string;
  price: number;
  description?: string; // Optional
} = {
  name: "Laptop",
  price: 999
};
```

### Functions

```typescript
// Function with typed parameters and return type
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => {
  return a * b;
};

// Void return type (no return value)
function logMessage(message: string): void {
  console.log(message);
}

// Optional parameters
function greet(name: string, greeting?: string): string {
  return greeting ? `${greeting}, ${name}!` : `Hello, ${name}!`;
}

// Default parameters
function createUser(name: string, age: number = 18): object {
  return { name, age };
}
```

### Union Types

Allow multiple types:

```typescript
// Can be string OR number
let id: string | number;
id = "abc123"; // ✅ Valid
id = 123;      // ✅ Valid
// id = true;  // ❌ Error

// Function with union type
function printId(id: string | number): void {
  console.log(`ID: ${id}`);
}

printId(101);      // ✅
printId("abc123"); // ✅

// Array with union types
let mixed: (string | number)[] = [1, "two", 3, "four"];
```

### Type Aliases

Create reusable type definitions:

```typescript
// Type alias
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

let userId: ID = "user123";
let orderStatus: Status = "pending";

// Complex type alias
type User = {
  id: ID;
  name: string;
  email: string;
  age: number;
  status: Status;
};

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  age: 25,
  status: "approved"
};
```

---

## 2. Interfaces - Object Shapes

### What are Interfaces?

Interfaces define the **structure of objects**. They're like contracts that objects must follow.

### Basic Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

// ❌ Error: Missing properties
// const invalidUser: User = {
//   id: 1,
//   name: "John"
// };
```

### Optional Properties

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string; // Optional
  image?: string;       // Optional
}

const product1: Product = {
  id: 1,
  name: "Laptop",
  price: 999
}; // ✅ Valid (optional properties not required)

const product2: Product = {
  id: 2,
  name: "Phone",
  price: 699,
  description: "Latest smartphone"
}; // ✅ Valid
```

### Readonly Properties

```typescript
interface Config {
  readonly apiKey: string;
  readonly apiUrl: string;
  timeout: number;
}

const config: Config = {
  apiKey: "abc123",
  apiUrl: "https://api.example.com",
  timeout: 5000
};

config.timeout = 10000; // ✅ Can modify
// config.apiKey = "xyz"; // ❌ Error: Cannot modify readonly
```

### Function Types in Interfaces

```typescript
interface Calculator {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
}

const calc: Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};

console.log(calc.add(5, 3));      // 8
console.log(calc.subtract(5, 3)); // 2
```

### Extending Interfaces

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: number;
  department: string;
}

const employee: Employee = {
  name: "John",
  age: 30,
  employeeId: 12345,
  department: "Engineering"
};
```

### Interface vs Type Alias

```typescript
// Interface
interface UserInterface {
  name: string;
  age: number;
}

// Type Alias
type UserType = {
  name: string;
  age: number;
};

// Both work similarly for objects
const user1: UserInterface = { name: "John", age: 25 };
const user2: UserType = { name: "Jane", age: 30 };

// Key differences:
// 1. Interfaces can be extended
interface Admin extends UserInterface {
  role: string;
}

// 2. Type aliases can use unions
type ID = string | number;

// 3. Interfaces can be merged (declaration merging)
interface Window {
  title: string;
}
interface Window {
  size: number;
}
// Window now has both title and size
```

---

## 3. Type Safety - Catching Errors

### What is Type Safety?

Type safety means **TypeScript checks types at compile time** and prevents type-related errors before code runs.

### Type Inference

TypeScript automatically infers types:

```typescript
// Type inferred as string
let name = "John";
// name = 123; // ❌ Error

// Type inferred as number
let age = 25;
// age = "25"; // ❌ Error

// Type inferred from function return
function getUser() {
  return { name: "John", age: 25 };
}

const user = getUser();
// user is inferred as { name: string; age: number }
```

### Type Assertions

Tell TypeScript the specific type:

```typescript
// Type assertion with 'as'
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;

// Alternative syntax
let strLength2: number = (<string>someValue).length;

// Useful with DOM elements
const input = document.getElementById('email') as HTMLInputElement;
input.value = "test@example.com";
```

### Type Guards

Check types at runtime:

```typescript
function printValue(value: string | number) {
  // Type guard with typeof
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // TypeScript knows it's string
  } else {
    console.log(value.toFixed(2)); // TypeScript knows it's number
  }
}

// Type guard with instanceof
class Dog {
  bark() {
    console.log("Woof!");
  }
}

class Cat {
  meow() {
    console.log("Meow!");
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows it's Dog
  } else {
    animal.meow(); // TypeScript knows it's Cat
  }
}
```

### Generics - Reusable Types

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

let num = identity<number>(42);       // T is number
let str = identity<string>("hello");  // T is string

// Generic array function
function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

let firstNum = getFirstElement([1, 2, 3]);      // number
let firstStr = getFirstElement(["a", "b", "c"]); // string

// Generic interface
interface Box<T> {
  value: T;
}

let numberBox: Box<number> = { value: 42 };
let stringBox: Box<string> = { value: "hello" };

// Generic with constraints
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): void {
  console.log(item.length);
}

logLength("hello");     // ✅ string has length
logLength([1, 2, 3]);   // ✅ array has length
// logLength(123);      // ❌ number doesn't have length
```

### Practical Example: API Response

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
}

// Type-safe API responses
async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function fetchPosts(): Promise<ApiResponse<Post[]>> {
  const response = await fetch('/api/posts');
  return response.json();
}

// Usage
const userResponse = await fetchUser(1);
console.log(userResponse.data.name); // TypeScript knows it's User

const postsResponse = await fetchPosts();
console.log(postsResponse.data[0].title); // TypeScript knows it's Post[]
```

:::

:::lang hi

## 1. Basic Types - Type Annotations

### TypeScript Kya Hai?

TypeScript **types ke saath JavaScript** hai. Ye errors jaldi catch karne me help karta hai aur code ko zyada maintainable banata hai.

### Primitive Types

```typescript
// String
let name: string = "John";
let message: string = 'Hello World';

// Number
let age: number = 25;
let price: number = 99.99;

// Boolean
let isActive: boolean = true;
let isCompleted: boolean = false;
```

### Arrays

```typescript
// Numbers ka array
let numbers: number[] = [1, 2, 3, 4, 5];

// Strings ka array
let fruits: string[] = ['apple', 'banana', 'orange'];

// Alternative syntax
let scores: Array<number> = [90, 85, 95];
```

### Objects

```typescript
// Object type
let user: {
  name: string;
  age: number;
  email: string;
} = {
  name: "John",
  age: 25,
  email: "john@example.com"
};

// Optional properties
let product: {
  name: string;
  price: number;
  description?: string; // Optional
} = {
  name: "Laptop",
  price: 999
};
```

### Functions

```typescript
// Typed parameters aur return type ke saath function
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => {
  return a * b;
};

// Void return type (koi return value nahi)
function logMessage(message: string): void {
  console.log(message);
}
```

---

## 2. Interfaces - Object Shapes

### Interfaces Kya Hain?

Interfaces **objects ki structure define** karte hain. Ye contracts ki tarah hain jo objects ko follow karna padta hai.

### Basic Interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};
```

### Optional Properties

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description?: string; // Optional
  image?: string;       // Optional
}

const product: Product = {
  id: 1,
  name: "Laptop",
  price: 999
}; // ✅ Valid (optional properties zaruri nahi)
```

### Interfaces Ko Extend Karna

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: number;
  department: string;
}

const employee: Employee = {
  name: "John",
  age: 30,
  employeeId: 12345,
  department: "Engineering"
};
```

---

## 3. Type Safety - Errors Catch Karna

### Type Safety Kya Hai?

Type safety ka matlab hai **TypeScript compile time pe types check karta hai** aur code run hone se pehle type-related errors rok deta hai.

### Type Inference

TypeScript automatically types infer karta hai:

```typescript
// Type string infer hua
let name = "John";
// name = 123; // ❌ Error

// Type number infer hua
let age = 25;
// age = "25"; // ❌ Error
```

### Generics - Reusable Types

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

let num = identity<number>(42);       // T number hai
let str = identity<string>("hello");  // T string hai

// Generic array function
function getFirstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

let firstNum = getFirstElement([1, 2, 3]);      // number
let firstStr = getFirstElement(["a", "b", "c"]); // string
```

:::
