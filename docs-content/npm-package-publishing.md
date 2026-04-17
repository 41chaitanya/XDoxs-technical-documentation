:::en

## How to Publish Your Package on NPM Registry

NPM (Node Package Manager) is the world's largest software registry. Publishing your package makes it available to millions of developers worldwide.

**Official NPM Registry**: [https://www.npmjs.com](https://www.npmjs.com)

### Prerequisites

Before publishing, you need:

1. **Node.js installed**: [Download from nodejs.org](https://nodejs.org)
2. **NPM account**: [Create at npmjs.com/signup](https://www.npmjs.com/signup)
3. **Your package ready**: Code, documentation, tests

### Step 1: Create NPM Account

Visit [https://www.npmjs.com/signup](https://www.npmjs.com/signup) and create a free account.

**What you need**:
- Username (will be part of your package URL)
- Email address
- Strong password

**Verify your email** after signing up.

### Step 2: Login to NPM via Terminal

Open your terminal and login:

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

**Verify login**:
```bash
npm whoami
```

This should display your username.

### Step 3: Prepare Your Package

#### Create package.json

If you don't have one, create it:

```bash
npm init
```

Or create manually:

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "A brief description of your package",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["javascript", "utility", "helper"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-repo.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/your-repo/issues"
  },
  "homepage": "https://github.com/yourusername/your-repo#readme"
}
```

#### Important Fields

**name**: Must be unique on NPM
- Check availability: [https://www.npmjs.com/package/your-package-name](https://www.npmjs.com/package/your-package-name)
- Use lowercase, no spaces
- Can use scopes: `@username/package-name`

**version**: Follow [Semantic Versioning](https://semver.org)
- Format: `MAJOR.MINOR.PATCH`
- Example: `1.0.0`, `2.3.1`

**main**: Entry point file (usually `index.js`)

**keywords**: Help users find your package

### Step 4: Create README.md

Every package needs documentation:

```markdown
# My Awesome Package

Brief description of what your package does.

## Installation

\`\`\`bash
npm install my-awesome-package
\`\`\`

## Usage

\`\`\`javascript
const myPackage = require('my-awesome-package');

// Example usage
myPackage.doSomething();
\`\`\`

## API

### functionName(param1, param2)

Description of what this function does.

**Parameters**:
- `param1` (string): Description
- `param2` (number): Description

**Returns**: Description of return value

## License

MIT
```

### Step 5: Create .npmignore

Exclude files from your package:

```
# .npmignore
node_modules/
.git/
.gitignore
.env
.DS_Store
*.log
test/
examples/
.github/
```

**Tip**: If no `.npmignore`, NPM uses `.gitignore`

### Step 6: Test Your Package Locally

Before publishing, test it:

```bash
# Create a tarball
npm pack
```

This creates a `.tgz` file. Install it locally:

```bash
npm install ./my-awesome-package-1.0.0.tgz
```

Test in another project to ensure it works.

### Step 7: Publish to NPM

**First time publishing**:

```bash
npm publish
```

**For scoped packages** (free for public):

```bash
npm publish --access public
```

**Success message**:
```
+ my-awesome-package@1.0.0
```

### Step 8: Verify Publication

Visit your package page:
```
https://www.npmjs.com/package/your-package-name
```

**Check package info**:
```bash
npm info my-awesome-package
```

### Updating Your Package

When you make changes:

1. **Update version** in `package.json`:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

2. **Publish update**:
```bash
npm publish
```

### Semantic Versioning Guide

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

**Learn more**: [https://semver.org](https://semver.org)

### Publishing Scoped Packages

Scoped packages use your username:

```json
{
  "name": "@username/my-package"
}
```

**Benefits**:
- Avoid name conflicts
- Organize related packages
- Free for public packages

**Publish**:
```bash
npm publish --access public
```

### Best Practices

#### 1. Add a License

```bash
npm install -g license
license MIT > LICENSE
```

Popular licenses:
- **MIT**: Most permissive
- **Apache-2.0**: Patent protection
- **GPL-3.0**: Copyleft

**Learn more**: [https://choosealicense.com](https://choosealicense.com)

#### 2. Add Tests

```bash
npm install --save-dev jest
```

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

#### 3. Add CI/CD

Use GitHub Actions, Travis CI, or CircleCI.

**Example GitHub Action** (`.github/workflows/test.yml`):

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

#### 4. Add Badges

```markdown
![npm version](https://img.shields.io/npm/v/my-package.svg)
![downloads](https://img.shields.io/npm/dm/my-package.svg)
![license](https://img.shields.io/npm/l/my-package.svg)
```

**Generate badges**: [https://shields.io](https://shields.io)

#### 5. TypeScript Support

Add type definitions:

```json
{
  "types": "index.d.ts"
}
```

Or publish to [@types](https://github.com/DefinitelyTyped/DefinitelyTyped).

### Common Issues

#### Package Name Already Taken

**Solution**: Use scoped package or different name

```bash
npm search my-package-name
```

#### Permission Denied

**Solution**: Login again

```bash
npm logout
npm login
```

#### Version Already Published

**Solution**: Bump version

```bash
npm version patch
npm publish
```

#### 2FA Required

Enable 2FA for security:

```bash
npm profile enable-2fa auth-and-writes
```

**Learn more**: [https://docs.npmjs.com/configuring-two-factor-authentication](https://docs.npmjs.com/configuring-two-factor-authentication)

### Unpublishing Packages

**Within 72 hours**:
```bash
npm unpublish my-package@1.0.0
```

**Entire package**:
```bash
npm unpublish my-package --force
```

**Warning**: Unpublishing is discouraged. Use `npm deprecate` instead:

```bash
npm deprecate my-package@1.0.0 "This version has a critical bug"
```

### Package Statistics

View your package stats:

**NPM Website**: [https://www.npmjs.com/package/your-package](https://www.npmjs.com/package/your-package)

**Download stats**: [https://npm-stat.com](https://npm-stat.com)

**Package health**: [https://snyk.io/advisor/npm-package/your-package](https://snyk.io/advisor/npm-package/your-package)

### Useful NPM Commands

```bash
# Check package info
npm info package-name

# View package versions
npm view package-name versions

# Check outdated packages
npm outdated

# Update packages
npm update

# List installed packages
npm list

# Search packages
npm search keyword

# View package documentation
npm docs package-name

# View package repository
npm repo package-name
```

### Resources

**Official Documentation**:
- NPM Docs: [https://docs.npmjs.com](https://docs.npmjs.com)
- Publishing Guide: [https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

**Package Development**:
- Semantic Versioning: [https://semver.org](https://semver.org)
- Choose a License: [https://choosealicense.com](https://choosealicense.com)
- Package.json Guide: [https://docs.npmjs.com/cli/v9/configuring-npm/package-json](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

**Tools**:
- NPM Trends: [https://npmtrends.com](https://npmtrends.com)
- Bundlephobia: [https://bundlephobia.com](https://bundlephobia.com) (Check package size)
- NPM Graph: [https://npmgraph.js.org](https://npmgraph.js.org) (Visualize dependencies)

### Example: Complete Package Structure

```
my-awesome-package/
├── src/
│   └── index.js
├── test/
│   └── index.test.js
├── .gitignore
├── .npmignore
├── LICENSE
├── README.md
├── package.json
└── index.js
```

**package.json**:
```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "Does awesome things",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "prepublishOnly": "npm test"
  },
  "keywords": ["awesome", "utility"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### Congratulations!

Your package is now live on NPM! Anyone can install it:

```bash
npm install your-package-name
```

Share your package:
- Tweet about it
- Post on Reddit (r/javascript, r/node)
- Share on Dev.to
- Add to Awesome lists

:::

:::hi

## NPM Registry Par Apna Package Kaise Publish Kare

NPM (Node Package Manager) duniya ki sabse badi software registry hai. Apna package publish karne se woh millions developers ke liye available ho jata hai.

**Official NPM Registry**: [https://www.npmjs.com](https://www.npmjs.com)

### Prerequisites

Publish karne se pehle yeh chahiye:

1. **Node.js installed**: [nodejs.org se download karo](https://nodejs.org)
2. **NPM account**: [npmjs.com/signup par banao](https://www.npmjs.com/signup)
3. **Tumhara package ready**: Code, documentation, tests

### Step 1: NPM Account Banao

[https://www.npmjs.com/signup](https://www.npmjs.com/signup) par jao aur free account banao.

**Kya chahiye**:
- Username (tumhare package URL ka part banega)
- Email address
- Strong password

Sign up ke baad **email verify** karo.

### Step 2: Terminal Se NPM Login Karo

Terminal kholo aur login karo:

```bash
npm login
```

Yeh puchega:
- Username
- Password
- Email
- One-time password (agar 2FA enabled hai)

**Login verify karo**:
```bash
npm whoami
```

Yeh tumhara username dikhana chahiye.

### Step 3: Apna Package Prepare Karo

#### package.json Banao

Agar nahi hai toh banao:

```bash
npm init
```

Ya manually banao:

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "Apne package ka brief description",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["javascript", "utility", "helper"],
  "author": "Tumhara Naam <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-repo.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/your-repo/issues"
  },
  "homepage": "https://github.com/yourusername/your-repo#readme"
}
```

#### Important Fields

**name**: NPM par unique hona chahiye
- Availability check karo: [https://www.npmjs.com/package/your-package-name](https://www.npmjs.com/package/your-package-name)
- Lowercase use karo, spaces nahi
- Scopes use kar sakte ho: `@username/package-name`

**version**: [Semantic Versioning](https://semver.org) follow karo
- Format: `MAJOR.MINOR.PATCH`
- Example: `1.0.0`, `2.3.1`

**main**: Entry point file (usually `index.js`)

**keywords**: Users ko tumhara package dhundhne mein help karte hain

### Step 4: README.md Banao

Har package ko documentation chahiye:

```markdown
# My Awesome Package

Tumhara package kya karta hai uska brief description.

## Installation

\`\`\`bash
npm install my-awesome-package
\`\`\`

## Usage

\`\`\`javascript
const myPackage = require('my-awesome-package');

// Example usage
myPackage.doSomething();
\`\`\`

## API

### functionName(param1, param2)

Yeh function kya karta hai uska description.

**Parameters**:
- `param1` (string): Description
- `param2` (number): Description

**Returns**: Return value ka description

## License

MIT
```

### Step 5: .npmignore Banao

Apne package se files exclude karo:

```
# .npmignore
node_modules/
.git/
.gitignore
.env
.DS_Store
*.log
test/
examples/
.github/
```

**Tip**: Agar `.npmignore` nahi hai, NPM `.gitignore` use karega

### Step 6: Apne Package Ko Locally Test Karo

Publish karne se pehle test karo:

```bash
# Tarball banao
npm pack
```

Yeh ek `.tgz` file banata hai. Isko locally install karo:

```bash
npm install ./my-awesome-package-1.0.0.tgz
```

Dusre project mein test karo ki kaam kar raha hai ya nahi.

### Step 7: NPM Par Publish Karo

**Pehli baar publish kar rahe ho**:

```bash
npm publish
```

**Scoped packages ke liye** (public ke liye free):

```bash
npm publish --access public
```

**Success message**:
```
+ my-awesome-package@1.0.0
```

### Step 8: Publication Verify Karo

Apne package page par jao:
```
https://www.npmjs.com/package/your-package-name
```

**Package info check karo**:
```bash
npm info my-awesome-package
```

### Apne Package Ko Update Karna

Jab changes karo:

1. **Version update karo** `package.json` mein:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

2. **Update publish karo**:
```bash
npm publish
```

### Semantic Versioning Guide

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): Naye features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

**Aur seekho**: [https://semver.org](https://semver.org)

### Scoped Packages Publish Karna

Scoped packages tumhara username use karte hain:

```json
{
  "name": "@username/my-package"
}
```

**Benefits**:
- Name conflicts avoid karo
- Related packages organize karo
- Public packages ke liye free

**Publish karo**:
```bash
npm publish --access public
```

### Best Practices

#### 1. License Add Karo

```bash
npm install -g license
license MIT > LICENSE
```

Popular licenses:
- **MIT**: Sabse zyada permissive
- **Apache-2.0**: Patent protection
- **GPL-3.0**: Copyleft

**Aur seekho**: [https://choosealicense.com](https://choosealicense.com)

#### 2. Tests Add Karo

```bash
npm install --save-dev jest
```

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

#### 3. CI/CD Add Karo

GitHub Actions, Travis CI, ya CircleCI use karo.

**Example GitHub Action** (`.github/workflows/test.yml`):

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

#### 4. Badges Add Karo

```markdown
![npm version](https://img.shields.io/npm/v/my-package.svg)
![downloads](https://img.shields.io/npm/dm/my-package.svg)
![license](https://img.shields.io/npm/l/my-package.svg)
```

**Badges generate karo**: [https://shields.io](https://shields.io)

#### 5. TypeScript Support

Type definitions add karo:

```json
{
  "types": "index.d.ts"
}
```

Ya [@types](https://github.com/DefinitelyTyped/DefinitelyTyped) par publish karo.

### Common Issues

#### Package Name Pehle Se Liya Hua Hai

**Solution**: Scoped package ya different name use karo

```bash
npm search my-package-name
```

#### Permission Denied

**Solution**: Phir se login karo

```bash
npm logout
npm login
```

#### Version Pehle Se Published Hai

**Solution**: Version bump karo

```bash
npm version patch
npm publish
```

#### 2FA Required

Security ke liye 2FA enable karo:

```bash
npm profile enable-2fa auth-and-writes
```

**Aur seekho**: [https://docs.npmjs.com/configuring-two-factor-authentication](https://docs.npmjs.com/configuring-two-factor-authentication)

### Packages Unpublish Karna

**72 hours ke andar**:
```bash
npm unpublish my-package@1.0.0
```

**Pura package**:
```bash
npm unpublish my-package --force
```

**Warning**: Unpublish karna discouraged hai. `npm deprecate` use karo:

```bash
npm deprecate my-package@1.0.0 "Is version mein critical bug hai"
```

### Package Statistics

Apne package ke stats dekho:

**NPM Website**: [https://www.npmjs.com/package/your-package](https://www.npmjs.com/package/your-package)

**Download stats**: [https://npm-stat.com](https://npm-stat.com)

**Package health**: [https://snyk.io/advisor/npm-package/your-package](https://snyk.io/advisor/npm-package/your-package)

### Useful NPM Commands

```bash
# Package info check karo
npm info package-name

# Package versions dekho
npm view package-name versions

# Outdated packages check karo
npm outdated

# Packages update karo
npm update

# Installed packages list karo
npm list

# Packages search karo
npm search keyword

# Package documentation dekho
npm docs package-name

# Package repository dekho
npm repo package-name
```

### Resources

**Official Documentation**:
- NPM Docs: [https://docs.npmjs.com](https://docs.npmjs.com)
- Publishing Guide: [https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

**Package Development**:
- Semantic Versioning: [https://semver.org](https://semver.org)
- Choose a License: [https://choosealicense.com](https://choosealicense.com)
- Package.json Guide: [https://docs.npmjs.com/cli/v9/configuring-npm/package-json](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

**Tools**:
- NPM Trends: [https://npmtrends.com](https://npmtrends.com)
- Bundlephobia: [https://bundlephobia.com](https://bundlephobia.com) (Package size check karo)
- NPM Graph: [https://npmgraph.js.org](https://npmgraph.js.org) (Dependencies visualize karo)

### Example: Complete Package Structure

```
my-awesome-package/
├── src/
│   └── index.js
├── test/
│   └── index.test.js
├── .gitignore
├── .npmignore
├── LICENSE
├── README.md
├── package.json
└── index.js
```

**package.json**:
```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "Awesome cheezein karta hai",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "prepublishOnly": "npm test"
  },
  "keywords": ["awesome", "utility"],
  "author": "Tumhara Naam",
  "license": "MIT",
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### Congratulations!

Tumhara package ab NPM par live hai! Koi bhi install kar sakta hai:

```bash
npm install your-package-name
```

Apna package share karo:
- Tweet karo
- Reddit par post karo (r/javascript, r/node)
- Dev.to par share karo
- Awesome lists mein add karo

:::
