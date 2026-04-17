/**
 * Production server with gzip/brotli compression.
 * Uses a lightweight reverse proxy over the Astro Node.js standalone server.
 *
 * Usage:  node start.mjs
 * Env:    PORT (default 4322), HOST (default 0.0.0.0)
 */

import { createServer } from 'node:http';
import { request as httpRequest } from 'node:http';
import { createGzip, createBrotliCompress, constants } from 'node:zlib';

const EXTERNAL_PORT = Number(process.env.PORT) || 4322;
const HOST = process.env.HOST || '0.0.0.0';
const INTERNAL_PORT = EXTERNAL_PORT + 100; // Astro listens internally

// Compressible content-types
const COMPRESSIBLE = /text\/|application\/(json|javascript|xml|manifest\+json)/;

// Minimum size worth compressing (bytes)
const MIN_SIZE = 256;

// Start the Astro server on internal port (hidden)
process.env.PORT = String(INTERNAL_PORT);
process.env.HOST = '127.0.0.1';
process.env.ASTRO_NODE_LOGGING = 'disabled';
await import('./dist/server/entry.mjs');

// Create compression proxy
const proxy = createServer((clientReq, clientRes) => {
  const proxyReq = httpRequest(
    {
      hostname: '127.0.0.1',
      port: INTERNAL_PORT,
      path: clientReq.url,
      method: clientReq.method,
      headers: { ...clientReq.headers, host: `127.0.0.1:${INTERNAL_PORT}` },
    },
    (proxyRes) => {
      const ct = proxyRes.headers['content-type'] || '';
      const ae = (clientReq.headers['accept-encoding'] || '').toString();
      const cl = parseInt(proxyRes.headers['content-length'] || '0', 10);
      const headers = { ...proxyRes.headers };

      // Compress if: compressible type, not already compressed, big enough
      const shouldCompress =
        COMPRESSIBLE.test(ct) &&
        !headers['content-encoding'] &&
        (cl === 0 || cl >= MIN_SIZE); // cl=0 means chunked/unknown, still compress

      if (shouldCompress) {
        delete headers['content-length']; // length changes after compression
        headers['vary'] = 'Accept-Encoding';

        if (ae.includes('br')) {
          headers['content-encoding'] = 'br';
          clientRes.writeHead(proxyRes.statusCode, headers);
          proxyRes
            .pipe(
              createBrotliCompress({
                params: {
                  [constants.BROTLI_PARAM_QUALITY]: 4, // fast compression
                },
              })
            )
            .pipe(clientRes);
        } else if (ae.includes('gzip')) {
          headers['content-encoding'] = 'gzip';
          clientRes.writeHead(proxyRes.statusCode, headers);
          proxyRes.pipe(createGzip({ level: 6 })).pipe(clientRes);
        } else {
          clientRes.writeHead(proxyRes.statusCode, headers);
          proxyRes.pipe(clientRes);
        }
      } else {
        clientRes.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(clientRes);
      }
    }
  );

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502);
      clientRes.end('Bad Gateway');
    }
  });

  clientReq.pipe(proxyReq);
});

proxy.listen(EXTERNAL_PORT, HOST, () => {
  const addr = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`\n  XDoxs production server (with compression)`);
  console.log(`  Local:   http://${addr}:${EXTERNAL_PORT}\n`);
});
