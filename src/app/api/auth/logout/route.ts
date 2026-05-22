import { clearAuthCookieHeader } from '@/auth';

export async function POST() {
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': clearAuthCookieHeader(),
      Location: '/login',
    },
  });
}

export async function GET() {
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': clearAuthCookieHeader(),
      Location: '/login',
    },
  });
}
