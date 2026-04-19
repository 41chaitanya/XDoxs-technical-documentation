import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Clone response to add headers
  const newHeaders = new Headers(response.headers);

  // ─── Security Headers (Lighthouse Best Practices) ───
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // ─── Caching Strategy ───
  // Static assets: aggressive caching
  if (/\.(js|css|svg|png|jpg|jpeg|webp|avif|woff2?|ttf|eot|ico)$/i.test(pathname)) {
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // HTML pages: revalidate
  else if (response.headers.get('content-type')?.includes('text/html')) {
    newHeaders.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  // API routes: no cache (use private + no-cache instead of no-store to allow bfcache)
  else if (pathname.startsWith('/api/')) {
    newHeaders.set('Cache-Control', 'private, no-cache, must-revalidate');
  }
  // Sitemap & robots: moderate cache
  else if (pathname === '/sitemap-index.xml' || pathname.startsWith('/sitemap-') || pathname === '/robots.txt') {
    newHeaders.set('Cache-Control', 'public, max-age=3600');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});
