/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * DELETE /api/admin/categories
 * Deletes a lifestyle category by id (admin only)
 * Expects JSON body: { id: number }
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.randomKey !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    await prisma.lifestyleCategory.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/categories
 * Adds a new lifestyle category (admin only)
 * Expects JSON body: { name: string, description?: string }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.randomKey !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Missing category name' }, { status: 400 });
    }

    const newCategory = await prisma.lifestyleCategory.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json({ category: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/categories
 * Returns paginated lifestyle categories with question counts
 * Query parameters: ?page=1&limit=10
 * Admin-only endpoint
 */
export async function GET(req: Request) {
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

    // Parse pagination parameters from URL
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    // Get total count for pagination
    let total = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total = await (prisma as any).lifestyleCategory.count();
    } catch (err) {
      console.log('LifestyleCategory table count failed:', err);
      return NextResponse.json({
        categories: [],
        pagination: { total: 0, page, limit, pages: 0 },
      });
    }

    // Fetch paginated lifestyle categories with their question counts
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
        skip,
        take: limit,
      });
    } catch (err) {
      console.log('LifestyleCategory table query failed, returning empty list:', err);
      return NextResponse.json({
        categories: [],
        pagination: { total: 0, page, limit, pages: 0 },
      });
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

    return NextResponse.json({
      categories: formattedCategories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
