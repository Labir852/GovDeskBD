import { clearAuthCookieHeader } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: true, redirect: '/login' },
    {
      status: 200,
      headers: {
        'Set-Cookie': clearAuthCookieHeader(),
      },
    }
  );
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
