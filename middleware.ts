import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect routes based on user role
 * Admin users are restricted to admin-only pages
 * Regular users are restricted from admin pages
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  // In authOptions, the role is stored in 'randomKey'
  const userRole = token?.randomKey as string | undefined;
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
