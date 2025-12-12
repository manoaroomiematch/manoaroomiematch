/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/lifestyle/categories
 * Returns all active lifestyle categories with descriptions (public endpoint)
 * No authentication required - only active categories with name and description are returned
 */
export async function GET() {
  try {
    let categories: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories = await (prisma as any).lifestyleCategory.findMany({
        where: {
          is_active: true, // Only return active categories
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
        orderBy: {
          name: 'asc', // Sort alphabetically by name
        },
      });
    } catch (err) {
      console.log('LifestyleCategory table query failed, returning empty list:', err);
      return NextResponse.json({
        categories: [],
      });
    }

    const response = NextResponse.json({
      categories,
    });
    // Disable caching so updates show immediately
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
