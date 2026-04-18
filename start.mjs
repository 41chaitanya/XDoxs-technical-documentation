/**
 * Production server entry point.
 * 
 * CloudFront handles gzip/brotli compression at the edge,
 * so the compression proxy is no longer needed.
 * 
 * Usage:  node start.mjs
 * Env:    PORT (default 4322), HOST (default 0.0.0.0)
 */

const PORT = Number(process.env.PORT) || 4322;
const HOST = process.env.HOST || '0.0.0.0';

process.env.PORT = String(PORT);
process.env.HOST = HOST;

console.log(`\n  XDoxs production server`);
console.log(`  Local:   http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}\n`);

await import('./dist/server/entry.mjs');
