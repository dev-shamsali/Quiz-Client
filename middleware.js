import { NextResponse } from 'next/server';

const publicPaths = ['/', '/login', '/register'];
const adminPaths = ['/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value ||
                request.headers.get('authorization')?.split(' ')[1];

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '?'));
  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect all non-public routes
  if (!isPublic && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
