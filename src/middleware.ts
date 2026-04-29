import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth/jwt';

// Route-to-role mapping
const PROTECTED_ROUTES = {
  '/superadmin': ['super_admin'],
  '/admin': ['admin', 'super_admin'],
  '/instructor': ['instructor', 'super_admin'],
  '/student': ['student', 'instructor', 'admin', 'super_admin'],
  '/api/superadmin': ['super_admin'],
  '/api/admin': ['admin', 'super_admin'],
  '/api/instructor': ['instructor', 'super_admin'],
  '/api/student': ['student', 'instructor', 'admin', 'super_admin'],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/docs',
  '/learn',
  '/blogs',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/docs/nav',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(prefix)) {
      return roles;
    }
  }
  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    const response = await next();
    return addSecurityHeaders(response, pathname);
  }

  // Check authentication
  const token = context.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login');
  }

  // Verify token
  const payload = verifyToken(token);
  
  if (!payload) {
    // Invalid token
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/login');
  }

  // Check role authorization
  const requiredRoles = getRequiredRoles(pathname);
  
  if (requiredRoles && !requiredRoles.includes(payload.role)) {
    // Insufficient permissions
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Forbidden - Insufficient permissions' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/unauthorized');
  }

  // Attach user to context for use in pages
  context.locals.user = payload;

  const response = await next();
  return addSecurityHeaders(response, pathname);
});

function addSecurityHeaders(response: Response, pathname: string): Response {
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
  // API routes: no cache
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
}
