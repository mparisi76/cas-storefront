import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const middleware = (request: NextRequest) => {
  // We check for the cookie we'll set during login
  const token = request.cookies.get('directus_session')?.value;
  const { pathname } = request.nextUrl;

  // If the user is trying to get into the dashboard without a token...
  if (pathname.startsWith('/dashboard') && !token) {
    // ...send them to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If they ARE logged in and try to go to /login, send them to the dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// This 'matcher' tells Next.js exactly which routes to protect
export const config = {
  matcher: ['/dashboard/:path*', '/artifact/:path*', '/login'],
};

export default middleware;