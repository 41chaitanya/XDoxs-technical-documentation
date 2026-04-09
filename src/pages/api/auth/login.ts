import type { APIRoute } from 'astro';
import { verifyPassword } from '../../../lib/auth/password';
import { findUserByEmail } from '../../../lib/auth/users';
import { generateToken } from '../../../lib/auth/jwt';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login API called');
    console.log('📧 Email:', email);

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Password verified');

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('✅ Token generated');

    // Set cookie using Astro's cookie API
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 604800,
      secure: false,
    });

    console.log('✅ Cookie set via Astro API');

    // Return success with redirect instruction
    return new Response(
      JSON.stringify({
        success: true,
        redirect: '/',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('💥 Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
