# Node.js Basics and Fundamentals

## Introduction to Node.js

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It allows you to run JavaScript on the server side.

### Why Node.js?

- Fast and scalable
- Event-driven architecture
- Large ecosystem (npm)

```javascript
// Simple Node.js server
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Installing Node.js

You can download Node.js from the official website.

### Installation Steps

1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version
3. Run the installer
4. Verify installation:

```bash
node --version
npm --version
```

## NPM Package Manager

NPM (Node Package Manager) is the default package manager for Node.js.

### Basic NPM Commands

```bash
# Initialize a new project
npm init

# Install a package
npm install express

# Install as dev dependency
npm install --save-dev nodemon

# Run scripts
npm run start
```

## Creating Your First Server

Let's create a simple HTTP server using Node.js.

```javascript
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello from Node.js!</h1>');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

## Modules in Node.js

Node.js uses the CommonJS module system.

### Built-in Modules

```javascript
// File System module
const fs = require('fs');

// Read file
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Write file
fs.writeFile('output.txt', 'Hello Node.js', (err) => {
  if (err) throw err;
  console.log('File saved!');
});
```

### Creating Custom Modules

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };

// app.js
const math = require('./math');
console.log(math.add(5, 3)); // 8
```
