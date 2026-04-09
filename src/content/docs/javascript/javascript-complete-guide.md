---
title: "JavaScript Complete Guide"
description: ""
date: 2026-04-08T20:02:16.546Z
author: "instructor@xdoxs.com"
category: "javascript"
tags: []
---

# JavaScript Complete Guide

JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. This guide covers JavaScript from basics to advanced concepts.

## Introduction to JavaScript

JavaScript was created in 1995 by Brendan Eich while he was working at Netscape Communications. Originally designed to make web pages interactive, JavaScript has evolved into a versatile language used for both client-side and server-side development.

Today, JavaScript runs in web browsers, on servers via Node.js, in mobile applications, desktop applications, and even in IoT devices. Its flexibility and widespread adoption make it one of the most important programming languages to learn.

## Strings

Strings are sequences of characters used to represent text.

### String Methods

```javascript
const str = "Hello World";

// Length
console.log(str.length);

// Case conversion
console.log(str.toUpperCase());
console.log(str.toLowerCase());

// Searching
console.log(str.indexOf("World"));
console.log(str.includes("Hello"));
console.log(str.startsWith("Hello"));
console.log(str.endsWith("World"));

// Extraction
console.log(str.slice(0, 5));
console.log(str.substring(0, 5));
console.log(str.substr(0, 5));

// Replacement
console.log(str.replace("World", "JavaScript"));
console.log(str.replaceAll("l", "L"));

// Splitting
console.log(str.split(" "));

// Trimming
console.log("  hello  ".trim());
console.log("  hello  ".trimStart());
console.log("  hello  ".trimEnd());

// Padding
console.log("5".padStart(3, "0"));  // "005"
console.log("5".padEnd(3, "0"));    // "500"
```

### Template Literals

```javascript
const name = "John";
const age = 30;

const message = `My name is ${name} and I'm ${age} years old`;

// Multi-line strings
const multiline = `
  This is a
  multi-line
  string
`;
```

## Operators

Operators are used to perform operations on variables and values. JavaScript supports arithmetic, comparison, logical, and assignment operators.

### Arithmetic Operators

```javascript
let a = 10;
let b = 3;

console.log(a + b);  // Addition: 13
console.log(a - b);  // Subtraction: 7
console.log(a * b);  // Multiplication: 30
console.log(a / b);  // Division: 3.333...
console.log(a % b);  // Modulus: 1
console.log(a ** b); // Exponentiation: 1000
```

### Comparison Operators

```javascript
let x = 5;
let y = "5";

console.log(x == y);   // true (loose equality)
console.log(x === y);  // false (strict equality)
console.log(x != y);   // false
console.log(x !== y);  // true
console.log(x > 3);    // true
console.log(x <= 5);   // true
```

### Logical Operators

```javascript
let isAdult = true;
let hasLicense = false;

console.log(isAdult && hasLicense);  // AND: false
console.log(isAdult || hasLicense);  // OR: true
console.log(!isAdult);               // NOT: false
```

## Variables and Data Types

Variables are containers for storing data values. JavaScript provides three ways to declare variables: var, let, and const.

### Variable Declaration

The var keyword was the original way to declare variables in JavaScript. However, it has function scope which can lead to unexpected behavior.

```javascript
var name = "John";
var age = 25;
```

The let keyword was introduced in ES6 and provides block scope, making code more predictable.

```javascript
let city = "New York";
let isActive = true;
```

The const keyword is used for values that should not be reassigned. It also has block scope.

```javascript
const PI = 3.14159;
const MAX_SIZE = 100;
```

### Primitive Data Types

JavaScript has seven primitive data types: String, Number, Boolean, Undefined, Null, Symbol, and BigInt.

```javascript
// String
let firstName = "Alice";
let lastName = 'Smith';
let greeting = `Hello, ${firstName}`;

// Number
let integer = 42;
let decimal = 3.14;
let negative = -10;

// Boolean
let isLoggedIn = true;
let hasPermission = false;

// Undefined
let notAssigned;
console.log(notAssigned); // undefined

// Null
let emptyValue = null;

// Symbol
let uniqueId = Symbol('id');

// BigInt
let largeNumber = 9007199254740991n;
```

## Control Flow

Control flow statements allow you to control the execution path of your program based on conditions.

### If-Else Statements

```javascript
let age = 18;

if (age >= 18) {
  console.log("You are an adult");
} else if (age >= 13) {
  console.log("You are a teenager");
} else {
  console.log("You are a child");
}
```

### Switch Statement

```javascript
let day = "Monday";

switch (day) {
  case "Monday":
    console.log("Start of the work week");
    break;
  case "Friday":
    console.log("End of the work week");
    break;
  case "Saturday":
  case "Sunday":
    console.log("Weekend");
    break;
  default:
    console.log("Midweek day");
}
```

### Ternary Operator

```javascript
let age = 20;
let status = age >= 18 ? "Adult" : "Minor";
console.log(status); // "Adult"
```

## Loops

Loops allow you to execute a block of code repeatedly.

### For Loop

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
// Output: 0, 1, 2, 3, 4
```

### While Loop

```javascript
let count = 0;
while (count < 5) {
  console.log(count);
  count++;
}
```

### Do-While Loop

```javascript
let num = 0;
do {
  console.log(num);
  num++;
} while (num < 5);
```

### For...of Loop

```javascript
const fruits = ["apple", "banana", "orange"];
for (const fruit of fruits) {
  console.log(fruit);
}
```

### For...in Loop

```javascript
const person = { name: "John", age: 30, city: "NYC" };
for (const key in person) {
  console.log(`${key}: ${person[key]}`);
}
```

## Functions

Functions are reusable blocks of code that perform specific tasks.

### Function Declaration

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Alice")); // "Hello, Alice!"
```

### Function Expression

```javascript
const multiply = function(a, b) {
  return a * b;
};

console.log(multiply(5, 3)); // 15
```

### Arrow Functions

```javascript
// Single parameter, single expression
const square = x => x * x;

// Multiple parameters
const add = (a, b) => a + b;

// Multiple statements
const calculate = (a, b) => {
  const sum = a + b;
  return sum * 2;
};
```

### Default Parameters

```javascript
function greet(name = "Guest") {
  return `Hello, ${name}!`;
}

console.log(greet());        // "Hello, Guest!"
console.log(greet("John"));  // "Hello, John!"
```

### Rest Parameters

```javascript
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4)); // 10
```

## Arrays

Arrays are ordered collections that can store multiple values.

### Creating Arrays

```javascript
const fruits = ["apple", "banana", "orange"];
const numbers = new Array(1, 2, 3, 4, 5);
const mixed = [1, "hello", true, null];
```

### Array Methods

```javascript
const arr = [1, 2, 3, 4, 5];

// Add/Remove elements
arr.push(6);           // Add to end
arr.pop();             // Remove from end
arr.unshift(0);        // Add to beginning
arr.shift();           // Remove from beginning

// Slice and Splice
const sliced = arr.slice(1, 3);       // Extract portion
arr.splice(2, 1, 99);                 // Remove and insert

// Iteration methods
arr.forEach(num => console.log(num));
const doubled = arr.map(num => num * 2);
const filtered = arr.filter(num => num > 2);
const sum = arr.reduce((acc, num) => acc + num, 0);

// Search methods
const found = arr.find(num => num > 3);
const index = arr.findIndex(num => num > 3);
const includes = arr.includes(3);
const indexOf = arr.indexOf(3);

// Other methods
const joined = arr.join(", ");
const reversed = arr.reverse();
const sorted = arr.sort((a, b) => a - b);
const combined = arr.concat([6, 7, 8]);
```

## Objects

Objects are collections of key-value pairs that represent entities.

### Creating Objects

```javascript
// Object literal
const person = {
  name: "John",
  age: 30,
  city: "New York"
};

// Constructor function
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const john = new Person("John", 30);

// Object.create()
const proto = { greet() { return "Hello"; } };
const obj = Object.create(proto);
```

### Accessing Properties

```javascript
const person = { name: "John", age: 30 };

// Dot notation
console.log(person.name);

// Bracket notation
console.log(person["age"]);

// Dynamic property access
const prop = "name";
console.log(person[prop]);
```

### Object Methods

```javascript
const person = {
  name: "John",
  age: 30,
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

console.log(person.greet());
```

### Object Destructuring

```javascript
const person = { name: "John", age: 30, city: "NYC" };

const { name, age } = person;
console.log(name, age); // "John" 30

// With different variable names
const { name: personName } = person;
console.log(personName); // "John"
```

## ES6 Plus Features

Modern JavaScript features introduced in ES6 and later versions.

### Destructuring

```javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age, ...others } = { name: "John", age: 30, city: "NYC" };
```

### Spread Operator

```javascript
// Array spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];

// Object spread
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };

// Function arguments
const numbers = [1, 2, 3];
console.log(Math.max(...numbers));
```

### Classes

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    return `Hello, I'm ${this.name}`;
  }

  static species() {
    return "Homo sapiens";
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age);
    this.grade = grade;
  }

  study() {
    return `${this.name} is studying`;
  }
}

const student = new Student("Alice", 20, "A");
```

### Promises

```javascript
// Creating a promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 1000);
});

// Using promises
promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));

// Promise methods
Promise.all([promise1, promise2]);
Promise.race([promise1, promise2]);
Promise.allSettled([promise1, promise2]);
Promise.any([promise1, promise2]);
```

### Async Await

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Using async/await
fetchData().then(data => console.log(data));
```

## DOM Manipulation

The Document Object Model allows JavaScript to interact with HTML elements.

### Selecting Elements

```javascript
// By ID
document.getElementById('myId');

// By class
document.getElementsByClassName('myClass');

// By tag
document.getElementsByTagName('div');

// Query selector
document.querySelector('.myClass');
document.querySelectorAll('.myClass');
```

### Modifying Elements

```javascript
const element = document.getElementById('myId');

// Content
element.textContent = "New text";
element.innerHTML = "<strong>Bold text</strong>";

// Attributes
element.setAttribute('class', 'newClass');
element.getAttribute('class');
element.removeAttribute('class');

// Styles
element.style.color = 'red';
element.style.fontSize = '20px';

// Classes
element.classList.add('newClass');
element.classList.remove('oldClass');
element.classList.toggle('active');
element.classList.contains('active');
```

### Event Handling

```javascript
const button = document.getElementById('myButton');

// Add event listener
button.addEventListener('click', function(event) {
  console.log('Button clicked!');
  event.preventDefault();
});

// Remove event listener
function handleClick() {
  console.log('Clicked');
}
button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);

// Common events
element.addEventListener('click', handler);
element.addEventListener('mouseover', handler);
element.addEventListener('mouseout', handler);
element.addEventListener('keydown', handler);
element.addEventListener('submit', handler);
```

## Error Handling

Proper error handling makes your code more robust and maintainable.

### Try-Catch

```javascript
try {
  // Code that might throw an error
  const result = riskyOperation();
} catch (error) {
  console.error('Error occurred:', error.message);
} finally {
  console.log('This always runs');
}
```

### Throwing Errors

```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (error) {
  console.error(error.message);
}
```

### Custom Errors

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid input');
```

## Modules

Modules help organize code into reusable pieces.

### Exporting

```javascript
// Named exports
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}

// Default export
export default class Calculator {
  add(a, b) {
    return a + b;
  }
}
```

### Importing

```javascript
// Named imports
import { PI, add } from './math.js';

// Default import
import Calculator from './calculator.js';

// Import all
import * as Math from './math.js';

// Rename imports
import { add as sum } from './math.js';
```

## Best Practices

Following best practices leads to cleaner, more maintainable code.

### Use Strict Mode

```javascript
'use strict';

// Prevents common mistakes
x = 10; // Error: x is not defined
```

### Const by Default

```javascript
// Use const for values that won't change
const MAX_SIZE = 100;

// Use let only when reassignment is needed
let counter = 0;
counter++;
```

### Avoid Global Variables

```javascript
// Bad
var globalVar = "I'm global";

// Good
(function() {
  const localVar = "I'm local";
})();
```

### Use Strict Equality

```javascript
// Bad
if (x == "5") { }

// Good
if (x === 5) { }
```

### Handle Errors

```javascript
// Always handle potential errors
try {
  const data = JSON.parse(jsonString);
} catch (error) {
  console.error('Invalid JSON:', error);
}
```

## Conclusion

JavaScript is a powerful and versatile language that continues to evolve. This guide covered the fundamental concepts from variables and data types to advanced features like promises and async/await. Practice these concepts regularly to become proficient in JavaScript programming.