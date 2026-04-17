f---
title: JavaScript Fundamentals - Variables, Functions, and Arrays
description: Master JavaScript basics including variables (let, const, var), functions (arrow functions, callbacks), and arrays (map, filter, reduce). Complete guide in English and Hindi.
category: javascript
slug: javascript-fundamentals
tags: [javascript, variables, functions, arrays, es6, arrow-functions]
author: XDoxs Team
date: 2026-04-16
featured: true
---

# JavaScript Fundamentals

:::lang en

## 1. Variables - let, const, var

### Understanding Variables

Variables are containers for storing data values. JavaScript has three ways to declare variables.

### var (Old Way - Avoid)

```javascript
var name = "John";
var age = 25;

// Problems with var:
// 1. Function-scoped (not block-scoped)
// 2. Can be redeclared
// 3. Hoisting issues

if (true) {
  var x = 10;
}
console.log(x); // 10 (accessible outside block!)
```

### let (Modern - Use for Changing Values)

```javascript
let count = 0;
count = 1; // ✅ Can reassign

let name = "John";
name = "Jane"; // ✅ Can change

// Block-scoped
if (true) {
  let y = 10;
}
// console.log(y); // ❌ Error: y is not defined
```

### const (Modern - Use for Constants)

```javascript
const PI = 3.14159;
// PI = 3.14; // ❌ Error: Cannot reassign

const user = { name: "John" };
user.name = "Jane"; // ✅ Can modify object properties
// user = {}; // ❌ Error: Cannot reassign

const numbers = [1, 2, 3];
numbers.push(4); // ✅ Can modify array
// numbers = []; // ❌ Error: Cannot reassign
```

### When to Use What?

- **Use `const` by default** - Most variables don't need to change
- **Use `let`** - When you need to reassign (counters, loops)
- **Avoid `var`** - It's outdated and has issues

```javascript
// ✅ Good
const name = "John";
const age = 25;
let count = 0;

// ❌ Bad
var name = "John";
var age = 25;
```

---

## 2. Functions - Regular and Arrow Functions

### Function Declaration

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("John")); // "Hello, John!"
```

### Function Expression

```javascript
const greet = function(name) {
  return `Hello, ${name}!`;
};
```

### Arrow Functions (Modern)

```javascript
// Basic syntax
const greet = (name) => {
  return `Hello, ${name}!`;
};

// Shorter syntax (implicit return)
const greet = (name) => `Hello, ${name}!`;

// No parameters
const sayHi = () => "Hi!";

// One parameter (parentheses optional)
const double = x => x * 2;

// Multiple parameters
const add = (a, b) => a + b;
```

### Arrow Functions vs Regular Functions

```javascript
// Regular function
function multiply(a, b) {
  return a * b;
}

// Arrow function (shorter)
const multiply = (a, b) => a * b;

// With multiple lines
const calculate = (a, b) => {
  const sum = a + b;
  const product = a * b;
  return { sum, product };
};
```

### Callback Functions

Functions passed as arguments to other functions:

```javascript
// setTimeout with callback
setTimeout(() => {
  console.log("Hello after 2 seconds");
}, 2000);

// Array methods with callbacks
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((num) => {
  console.log(num * 2);
});

// Event listeners
button.addEventListener('click', () => {
  console.log('Button clicked!');
});
```

### Higher-Order Functions

Functions that take or return other functions:

```javascript
// Function that returns a function
function createMultiplier(multiplier) {
  return (number) => number * multiplier;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

## 3. Arrays - map, filter, reduce

### Array Basics

```javascript
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];

// Access elements
console.log(fruits[0]); // 'apple'

// Length
console.log(fruits.length); // 3

// Add elements
fruits.push('mango'); // Add to end
fruits.unshift('grape'); // Add to start

// Remove elements
fruits.pop(); // Remove from end
fruits.shift(); // Remove from start
```

### map() - Transform Each Element

Creates a new array by transforming each element:

```javascript
const numbers = [1, 2, 3, 4, 5];

// Double each number
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Square each number
const squared = numbers.map(num => num ** 2);
console.log(squared); // [1, 4, 9, 16, 25]

// Transform objects
const users = [
  { name: 'John', age: 25 },
  { name: 'Jane', age: 30 }
];

const names = users.map(user => user.name);
console.log(names); // ['John', 'Jane']

// Add property to objects
const usersWithId = users.map((user, index) => ({
  ...user,
  id: index + 1
}));
```

### filter() - Select Elements

Creates a new array with elements that pass a test:

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Get even numbers
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// Get numbers greater than 5
const greaterThan5 = numbers.filter(num => num > 5);
console.log(greaterThan5); // [6, 7, 8, 9, 10]

// Filter objects
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true }
];

const activeUsers = users.filter(user => user.active);
const adults = users.filter(user => user.age >= 30);
```

### reduce() - Combine to Single Value

Reduces array to a single value:

```javascript
const numbers = [1, 2, 3, 4, 5];

// Sum all numbers
const sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 15

// Find maximum
const max = numbers.reduce((max, num) => num > max ? num : max, numbers[0]);
console.log(max); // 5

// Count occurrences
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];

const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log(count); // { apple: 3, banana: 2, orange: 1 }

// Group by property
const users = [
  { name: 'John', role: 'admin' },
  { name: 'Jane', role: 'user' },
  { name: 'Bob', role: 'admin' }
];

const grouped = users.reduce((acc, user) => {
  if (!acc[user.role]) acc[user.role] = [];
  acc[user.role].push(user);
  return acc;
}, {});
```

### Chaining Array Methods

Combine multiple methods for powerful transformations:

```javascript
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true },
  { name: 'Alice', age: 28, active: true }
];

// Get names of active users over 25
const result = users
  .filter(user => user.active)
  .filter(user => user.age > 25)
  .map(user => user.name);

console.log(result); // ['Bob', 'Alice']

// Calculate average age of active users
const avgAge = users
  .filter(user => user.active)
  .map(user => user.age)
  .reduce((sum, age, _, arr) => sum + age / arr.length, 0);
```

:::

:::lang hi

## 1. Variables - let, const, var

### Variables Ko Samajhna

Variables data values store karne ke containers hain. JavaScript me variables declare karne ke teen tarike hain.

### var (Purana Tarika - Avoid Karo)

```javascript
var name = "John";
var age = 25;

// var ke problems:
// 1. Function-scoped (block-scoped nahi)
// 2. Redeclare ho sakta hai
// 3. Hoisting issues

if (true) {
  var x = 10;
}
console.log(x); // 10 (block ke bahar bhi accessible!)
```

### let (Modern - Changing Values ke Liye)

```javascript
let count = 0;
count = 1; // ✅ Reassign kar sakte ho

let name = "John";
name = "Jane"; // ✅ Change kar sakte ho

// Block-scoped
if (true) {
  let y = 10;
}
// console.log(y); // ❌ Error: y defined nahi hai
```

### const (Modern - Constants ke Liye)

```javascript
const PI = 3.14159;
// PI = 3.14; // ❌ Error: Reassign nahi kar sakte

const user = { name: "John" };
user.name = "Jane"; // ✅ Object properties modify kar sakte ho
// user = {}; // ❌ Error: Reassign nahi kar sakte

const numbers = [1, 2, 3];
numbers.push(4); // ✅ Array modify kar sakte ho
// numbers = []; // ❌ Error: Reassign nahi kar sakte
```

### Kab Kya Use Kare?

- **`const` by default use karo** - Zyada tar variables change nahi hote
- **`let` use karo** - Jab reassign karna ho (counters, loops)
- **`var` avoid karo** - Ye outdated hai aur issues hain

---

## 2. Functions - Regular aur Arrow Functions

### Function Declaration

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("John")); // "Hello, John!"
```

### Arrow Functions (Modern)

```javascript
// Basic syntax
const greet = (name) => {
  return `Hello, ${name}!`;
};

// Shorter syntax (implicit return)
const greet = (name) => `Hello, ${name}!`;

// No parameters
const sayHi = () => "Hi!";

// Ek parameter (parentheses optional)
const double = x => x * 2;

// Multiple parameters
const add = (a, b) => a + b;
```

### Callback Functions

Functions jo dusre functions ko arguments me pass hote hain:

```javascript
// setTimeout with callback
setTimeout(() => {
  console.log("2 seconds ke baad Hello");
}, 2000);

// Array methods with callbacks
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((num) => {
  console.log(num * 2);
});
```

---

## 3. Arrays - map, filter, reduce

### Array Basics

```javascript
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];

// Elements access karo
console.log(fruits[0]); // 'apple'

// Length
console.log(fruits.length); // 3
```

### map() - Har Element Ko Transform Karo

Har element ko transform karke naya array banata hai:

```javascript
const numbers = [1, 2, 3, 4, 5];

// Har number ko double karo
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Objects transform karo
const users = [
  { name: 'John', age: 25 },
  { name: 'Jane', age: 30 }
];

const names = users.map(user => user.name);
console.log(names); // ['John', 'Jane']
```

### filter() - Elements Select Karo

Test pass karne wale elements ka naya array banata hai:

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Even numbers nikalo
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// 5 se bade numbers
const greaterThan5 = numbers.filter(num => num > 5);
console.log(greaterThan5); // [6, 7, 8, 9, 10]
```

### reduce() - Single Value Me Combine Karo

Array ko ek single value me reduce karta hai:

```javascript
const numbers = [1, 2, 3, 4, 5];

// Sab numbers ka sum
const sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum); // 15

// Maximum find karo
const max = numbers.reduce((max, num) => num > max ? num : max, numbers[0]);
console.log(max); // 5
```

### Array Methods Ko Chain Karo

Multiple methods combine karke powerful transformations:

```javascript
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true }
];

// Active users ke names jo 25 se bade hain
const result = users
  .filter(user => user.active)
  .filter(user => user.age > 25)
  .map(user => user.name);

console.log(result); // ['Bob']
```

:::
