/* eslint-disable import/prefer-default-export */
// src/app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    // Search for users by email, firstName, or lastName
    // Also exclude inactive/suspended users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: currentUser.id,
            },
          },
          {
            active: true, // Only show active users
          },
          {
            OR: [
              {
                suspendedUntil: null, // Not suspended
              },
              {
                suspendedUntil: {
                  lt: new Date(), // Suspension expired
                },
              },
            ],
          },
          {
            OR: [
              {
                email: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                profile: {
                  firstName: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
              {
                profile: {
                  lastName: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
              {
                profile: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            photoUrl: true,
            major: true,
            bio: true,
          },
        },
      },
      take: 20,
    });

    // Format results
    const formattedUsers = users.map((user) => {
      let displayName = 'Unknown User';

      if (user.profile) {
        if (user.profile.firstName && user.profile.lastName) {
          displayName = `${user.profile.firstName} ${user.profile.lastName}`;
        } else if (user.profile.name) {
          displayName = user.profile.name;
        } else if (user.profile.firstName) {
          displayName = user.profile.firstName;
        }
      } else {
        // Fallback to email name
        const emailName = user.email.split('@')[0];
        displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      }

      return {
        id: user.id,
        name: displayName,
        email: user.email,
        major: user.profile?.major || null,
        photoUrl: user.profile?.photoUrl || null,
        bio: user.profile?.bio || null,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
