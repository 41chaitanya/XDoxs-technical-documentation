import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  const isProduction = import.meta.env.PROD;
  const securePart = isProduction ? ' Secure;' : '';
  return new Response(
    JSON.stringify({ success: true, message: 'Logged out successfully' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=; Path=/; HttpOnly; SameSite=Lax;${securePart} Max-Age=0`,
      },
    }
  );
};
