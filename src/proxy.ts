import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const COOKIE_NAME = "govdesk_jwt";
  const isLoggedIn = !!req.cookies.get(COOKIE_NAME)?.value;

  const isProtectedRoute = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = nextUrl.pathname.startsWith('/login');

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
  ],
};
