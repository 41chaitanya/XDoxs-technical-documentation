:::en

## What is MCP Server?

MCP stands for **Model Context Protocol**. It's a standardized way for AI applications to connect with external tools and data sources.

Think of MCP as a universal adapter that lets AI assistants (like Claude, ChatGPT, or custom AI apps) interact with your tools, databases, APIs, and services in a consistent way.

### Key Concepts

**Server**: A program that provides tools and resources to AI applications.

**Client**: The AI application that uses these tools (like your IDE, chatbot, etc.).

**Protocol**: The standardized way they communicate with each other.

### Why MCP Matters

Before MCP, every AI tool needed custom integrations for each service. With MCP:

- Write once, use everywhere
- Standardized communication
- Easy to add new tools
- Secure and controlled access

### Real-World Example

Imagine you want your AI assistant to:
- Read files from your computer
- Query your database
- Call external APIs
- Run terminal commands

Without MCP, you'd need custom code for each AI tool. With MCP, you create one server, and any MCP-compatible AI can use it.

```javascript
// MCP Server Example
const server = new MCPServer({
  name: "my-tools",
  version: "1.0.0"
});

// Add a tool
server.addTool({
  name: "read_file",
  description: "Read a file from disk",
  parameters: {
    path: { type: "string", required: true }
  },
  handler: async (params) => {
    return await fs.readFile(params.path, 'utf-8');
  }
});

server.start();
```

### MCP Architecture

```
┌─────────────────┐
│   AI Client     │  (Your IDE, Chatbot, etc.)
│  (Claude, GPT)  │
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────┐
│   MCP Server    │  (Your custom server)
└────────┬────────┘
         │
    ┌────┴────┐
    │  Tools  │  (File system, Database, APIs)
    └─────────┘
```

### Components of MCP

**1. Tools**: Functions the AI can call
- Read files
- Query databases
- Call APIs
- Run commands

**2. Resources**: Data the AI can access
- File contents
- Database records
- API responses

**3. Prompts**: Pre-defined instructions
- Templates
- System prompts
- Context

### How MCP Works

1. **AI asks**: "Read the file config.json"
2. **Client sends**: MCP request to server
3. **Server executes**: Reads the file
4. **Server responds**: Returns file content
5. **AI receives**: Uses the data in response

### MCP vs Traditional APIs

| Feature | Traditional API | MCP |
|---------|----------------|-----|
| Protocol | Custom (REST, GraphQL) | Standardized MCP |
| Integration | One per service | Universal |
| AI-friendly | No | Yes |
| Discovery | Manual docs | Auto-discovery |
| Security | Custom auth | Built-in controls |

### Creating Your First MCP Server

```typescript
import { MCPServer } from '@modelcontextprotocol/sdk';

// Initialize server
const server = new MCPServer({
  name: "calculator",
  version: "1.0.0",
  description: "Simple calculator tools"
});

// Add tools
server.addTool({
  name: "add",
  description: "Add two numbers",
  parameters: {
    a: { type: "number", required: true },
    b: { type: "number", required: true }
  },
  handler: async ({ a, b }) => {
    return { result: a + b };
  }
});

server.addTool({
  name: "multiply",
  description: "Multiply two numbers",
  parameters: {
    a: { type: "number", required: true },
    b: { type: "number", required: true }
  },
  handler: async ({ a, b }) => {
    return { result: a * b };
  }
});

// Start server
server.start();
```

### Using MCP in Your App

```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["./calculator-server.js"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}
```

### Security Best Practices

- **Whitelist paths**: Only allow access to specific directories
- **Validate inputs**: Check all parameters
- **Rate limiting**: Prevent abuse
- **Audit logs**: Track all operations
- **Permissions**: Use least privilege principle

### Common Use Cases

**1. Development Tools**
- File operations
- Git commands
- Build tools
- Testing frameworks

**2. Data Access**
- Database queries
- API calls
- File system access
- Cloud storage

**3. Automation**
- Task scheduling
- Workflow automation
- CI/CD integration
- Monitoring

### MCP Server Examples

**File System Server**:
```bash
npx @modelcontextprotocol/server-filesystem /path/to/files
```

**Database Server**:
```bash
npx @modelcontextprotocol/server-postgres postgresql://localhost/mydb
```

**Custom Server**:
```bash
node my-custom-server.js
```

### Benefits for Developers

- **Reusability**: Write once, use with any MCP client
- **Standardization**: No need to learn different APIs
- **Discoverability**: Tools are auto-discovered
- **Type Safety**: Built-in parameter validation
- **Documentation**: Self-documenting tools

### MCP Ecosystem

Popular MCP servers:
- **Filesystem**: File operations
- **GitHub**: Repository management
- **Postgres**: Database queries
- **Brave Search**: Web search
- **Slack**: Team communication
- **Google Drive**: Cloud storage

### Getting Started

1. **Install SDK**:
```bash
npm install @modelcontextprotocol/sdk
```

2. **Create server**:
```bash
npx create-mcp-server my-server
```

3. **Add to config**:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./my-server.js"]
    }
  }
}
```

4. **Use in AI app**: Tools automatically available!

### Advanced Features

**Streaming**: Real-time data updates
**Caching**: Improve performance
**Error Handling**: Graceful failures
**Logging**: Debug and monitor
**Testing**: Built-in test utilities

### Future of MCP

MCP is becoming the standard for AI-tool integration:
- More AI apps adopting it
- Growing ecosystem of servers
- Better tooling and SDKs
- Enterprise features
- Cloud-hosted servers

:::

:::hi

## MCP Server Kya Hai?

MCP ka matlab hai **Model Context Protocol**. Yeh ek standardized tarika hai jisse AI applications external tools aur data sources ke saath connect kar sakti hain.

MCP ko ek universal adapter samjho jo AI assistants (jaise Claude, ChatGPT, ya custom AI apps) ko tumhare tools, databases, APIs, aur services ke saath consistent tarike se interact karne deta hai.

### Mukhya Concepts

**Server**: Ek program jo AI applications ko tools aur resources provide karta hai.

**Client**: AI application jo in tools ka use karti hai (jaise tumhari IDE, chatbot, etc.).

**Protocol**: Standardized tarika jisse woh ek dusre se communicate karte hain.

### MCP Kyun Zaroori Hai

MCP se pehle, har AI tool ko har service ke liye custom integrations chahiye hote the. MCP ke saath:

- Ek baar likho, har jagah use karo
- Standardized communication
- Naye tools add karna aasaan
- Secure aur controlled access

### Real-World Example

Socho tumhe apne AI assistant se yeh karna hai:
- Computer se files padhna
- Database query karna
- External APIs call karna
- Terminal commands run karna

Bina MCP ke, tumhe har AI tool ke liye custom code likhna padta. MCP ke saath, ek server banao, aur koi bhi MCP-compatible AI use kar sakta hai.

```javascript
// MCP Server Example
const server = new MCPServer({
  name: "my-tools",
  version: "1.0.0"
});

// Tool add karo
server.addTool({
  name: "read_file",
  description: "Disk se file read karo",
  parameters: {
    path: { type: "string", required: true }
  },
  handler: async (params) => {
    return await fs.readFile(params.path, 'utf-8');
  }
});

server.start();
```

### MCP Architecture

```
┌─────────────────┐
│   AI Client     │  (Tumhari IDE, Chatbot, etc.)
│  (Claude, GPT)  │
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────┐
│   MCP Server    │  (Tumhara custom server)
└────────┬────────┘
         │
    ┌────┴────┐
    │  Tools  │  (File system, Database, APIs)
    └─────────┘
```

### MCP Ke Components

**1. Tools**: Functions jo AI call kar sakta hai
- Files read karna
- Database query karna
- APIs call karna
- Commands run karna

**2. Resources**: Data jo AI access kar sakta hai
- File contents
- Database records
- API responses

**3. Prompts**: Pre-defined instructions
- Templates
- System prompts
- Context

### MCP Kaise Kaam Karta Hai

1. **AI puchta hai**: "config.json file read karo"
2. **Client bhejta hai**: MCP request server ko
3. **Server execute karta hai**: File read karta hai
4. **Server respond karta hai**: File content return karta hai
5. **AI receive karta hai**: Data ko response mein use karta hai

### MCP vs Traditional APIs

| Feature | Traditional API | MCP |
|---------|----------------|-----|
| Protocol | Custom (REST, GraphQL) | Standardized MCP |
| Integration | Har service ke liye alag | Universal |
| AI-friendly | Nahi | Haan |
| Discovery | Manual docs | Auto-discovery |
| Security | Custom auth | Built-in controls |

### Apna Pehla MCP Server Banao

```typescript
import { MCPServer } from '@modelcontextprotocol/sdk';

// Server initialize karo
const server = new MCPServer({
  name: "calculator",
  version: "1.0.0",
  description: "Simple calculator tools"
});

// Tools add karo
server.addTool({
  name: "add",
  description: "Do numbers add karo",
  parameters: {
    a: { type: "number", required: true },
    b: { type: "number", required: true }
  },
  handler: async ({ a, b }) => {
    return { result: a + b };
  }
});

server.addTool({
  name: "multiply",
  description: "Do numbers multiply karo",
  parameters: {
    a: { type: "number", required: true },
    b: { type: "number", required: true }
  },
  handler: async ({ a, b }) => {
    return { result: a * b };
  }
});

// Server start karo
server.start();
```

### Apne App Mein MCP Use Karo

```json
{
  "mcpServers": {
    "calculator": {
      "command": "node",
      "args": ["./calculator-server.js"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}
```

### Security Best Practices

- **Whitelist paths**: Sirf specific directories ko access allow karo
- **Validate inputs**: Saare parameters check karo
- **Rate limiting**: Abuse prevent karo
- **Audit logs**: Saari operations track karo
- **Permissions**: Least privilege principle use karo

### Common Use Cases

**1. Development Tools**
- File operations
- Git commands
- Build tools
- Testing frameworks

**2. Data Access**
- Database queries
- API calls
- File system access
- Cloud storage

**3. Automation**
- Task scheduling
- Workflow automation
- CI/CD integration
- Monitoring

### MCP Server Examples

**File System Server**:
```bash
npx @modelcontextprotocol/server-filesystem /path/to/files
```

**Database Server**:
```bash
npx @modelcontextprotocol/server-postgres postgresql://localhost/mydb
```

**Custom Server**:
```bash
node my-custom-server.js
```

### Developers Ke Liye Benefits

- **Reusability**: Ek baar likho, kisi bhi MCP client ke saath use karo
- **Standardization**: Alag alag APIs seekhne ki zaroorat nahi
- **Discoverability**: Tools automatically discover ho jate hain
- **Type Safety**: Built-in parameter validation
- **Documentation**: Self-documenting tools

### MCP Ecosystem

Popular MCP servers:
- **Filesystem**: File operations
- **GitHub**: Repository management
- **Postgres**: Database queries
- **Brave Search**: Web search
- **Slack**: Team communication
- **Google Drive**: Cloud storage

### Shuru Kaise Kare

1. **SDK install karo**:
```bash
npm install @modelcontextprotocol/sdk
```

2. **Server banao**:
```bash
npx create-mcp-server my-server
```

3. **Config mein add karo**:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["./my-server.js"]
    }
  }
}
```

4. **AI app mein use karo**: Tools automatically available ho jayenge!

### Advanced Features

**Streaming**: Real-time data updates
**Caching**: Performance improve karo
**Error Handling**: Graceful failures
**Logging**: Debug aur monitor karo
**Testing**: Built-in test utilities

### MCP Ka Future

MCP AI-tool integration ke liye standard ban raha hai:
- Zyada AI apps isko adopt kar rahe hain
- Servers ka ecosystem badh raha hai
- Better tooling aur SDKs aa rahe hain
- Enterprise features
- Cloud-hosted servers

:::
