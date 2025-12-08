import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';

/**
 * Middleware to protect routes based on user role
 * Admin users are restricted to admin-only pages
 * Regular users are restricted from admin pages
 */
export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { randomKey?: string })?.randomKey;
  const { pathname } = request.nextUrl;

  // Admin-only routes
  const adminRoutes = ['/admin', '/admin/users'];

  // Regular user routes (restricted for admins)
  const regularUserRoutes = [
    '/matches',
    '/comparison',
    '/lifestyle-survey',
    '/profile',
    '/edit-profile',
    '/messages',
    '/home',
  ];

  // Check if admin trying to access regular user routes
  if (userRole === 'ADMIN' && regularUserRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Check if non-admin trying to access admin routes
  if (
    userRole !== 'ADMIN'
    && adminRoutes.some((route) => pathname === route || pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/not-authorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
