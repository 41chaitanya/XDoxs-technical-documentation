/**
 * Production server entry point.
 * 
 * CloudFront handles gzip/brotli compression at the edge,
 * so the compression proxy is no longer needed.
 * 
 * Usage:  node start.mjs
 * Env:    PORT (default 4322), HOST (default 0.0.0.0)
 */

import { readFileSync } from 'fs';

// Load .env file into process.env (for AWS, MongoDB, etc.)
try {
  const envContent = readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  // .env file not found — rely on system environment variables
}

const PORT = Number(process.env.PORT) || 4322;
const HOST = process.env.HOST || '0.0.0.0';

process.env.PORT = String(PORT);
process.env.HOST = HOST;

console.log(`\n  XDoxs production server`);
console.log(`  Local:   http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}\n`);

await import('./dist/server/entry.mjs');
