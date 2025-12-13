import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import authOptions from '@/lib/authOptions';
import { clearExpiredSuspensionsAsync } from '@/lib/suspensionUtils';

/**
 * Middleware to protect routes based on user role
 * Admin users are restricted to admin-only pages
 * Regular users are restricted from admin pages
 *
 * Suspension Cleanup:
 * - Triggers async suspension cleanup (non-blocking)
 * - Optimized to skip frequent runs (max once every 5 minutes)
 * - Alternatively, could be moved to a dedicated cron endpoint for better separation of concerns
 * - Current middleware approach is simpler and doesn't require additional secret keys
 */
export async function middleware(request: NextRequest) {
  // Clear expired suspensions asynchronously (doesn't block request)
  // Throttled to max once every 5 minutes to avoid database load
  clearExpiredSuspensionsAsync();
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role;
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
