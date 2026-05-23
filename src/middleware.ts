import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const COOKIE_NAME = "govdesk_jwt";
  const isLoggedIn = !!req.cookies.get(COOKIE_NAME)?.value;

  const isProtectedRoute = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = nextUrl.pathname.startsWith('/login');

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
