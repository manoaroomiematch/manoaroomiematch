/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * PUT /api/admin/profile
 * Updates an admin user's profile including photo
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.randomKey !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, firstName, lastName, bio, pronouns, profilePhoto } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user profile
    const existingProfile = await prisma.userProfile.findFirst({
      where: { email },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update the profile
    const updatedProfile = await prisma.userProfile.update({
      where: { id: existingProfile.id },
      data: {
        firstName: firstName ?? existingProfile.firstName,
        lastName: lastName ?? existingProfile.lastName,
        bio: bio ?? existingProfile.bio,
        pronouns: pronouns ?? existingProfile.pronouns,
        photoUrl: profilePhoto ?? existingProfile.photoUrl,
        name: firstName && lastName
          ? `${firstName} ${lastName}`.trim()
          : existingProfile.name,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
