---
title: "Docker Basics - Complete Beginner's Guide"
description: "Learn Docker fundamentals - containers, images, and essential commands"
category: "devops"
tags: ["docker", "containers", "devops", "deployment"]
author: "XDoxs Team"
date: 2026-04-04
featured: true
---

# Docker Basics - Complete Beginner's Guide

Docker is a platform for developing, shipping, and running applications in containers. Containers package your application with all its dependencies.

## What is Docker?

Docker allows you to:
- Package applications with dependencies
- Run applications consistently across environments
- Isolate applications from each other
- Deploy applications quickly

## Key Concepts

### Images
A Docker image is a template containing application code, libraries, and dependencies.

### Containers
A container is a running instance of an image.

### Dockerfile
A text file with instructions to build a Docker image.

## Installation

```bash
# macOS (using Homebrew)
brew install --cask docker

# Ubuntu
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Verify installation
docker --version
```

## Basic Commands

### Working with Images

```bash
# Pull an image from Docker Hub
docker pull nginx

# List images
docker images

# Remove an image
docker rmi nginx
```

### Working with Containers

```bash
# Run a container
docker run nginx

# Run in detached mode
docker run -d nginx

# Run with port mapping
docker run -d -p 8080:80 nginx

# List running containers
docker ps

# List all containers
docker ps -a

# Stop a container
docker stop <container-id>

# Remove a container
docker rm <container-id>
```

## Creating a Dockerfile

```dockerfile
# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

## Building an Image

```bash
# Build image
docker build -t myapp:1.0 .

# Run the built image
docker run -d -p 3000:3000 myapp:1.0
```

## Docker Compose

Docker Compose allows you to define multi-container applications:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

Run with:
```bash
docker-compose up -d
```

## Best Practices

1. Use official base images
2. Keep images small (use alpine variants)
3. Use .dockerignore file
4. Don't run containers as root
5. Use multi-stage builds for production
6. Tag images properly

## Common Use Cases

- Development environments
- CI/CD pipelines
- Microservices deployment
- Testing isolated environments

## Conclusion

Docker simplifies application deployment and ensures consistency across environments. Start with basic commands and gradually explore advanced features.
