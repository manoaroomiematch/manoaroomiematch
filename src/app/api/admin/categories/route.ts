/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/admin/categories
 * Returns all lifestyle categories with question counts
 * Admin-only endpoint
 */
export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // Check if user has admin role
    if (session.user.randomKey !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    // Fetch all lifestyle categories with their question counts
    // Wrapped in try-catch to handle cases where LifestyleCategory table doesn't exist yet
    let categories: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories = await (prisma as any).lifestyleCategory.findMany({
        include: {
          _count: {
            select: { questions: true }, // Count related questions for each category
          },
        },
        orderBy: {
          id: 'asc',
        },
      });
    } catch (err) {
      console.log('LifestyleCategory table query failed, returning empty list:', err);
      return NextResponse.json({ categories: [] });
    }

    // Transform the data to match the expected format for the admin UI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      // eslint-disable-next-line no-underscore-dangle
      items: category._count.questions, // Number of questions in this category
      lastUpdated: new Date().toISOString().split('T')[0], // Use current date as placeholder
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
