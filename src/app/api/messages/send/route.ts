/* eslint-disable import/prefer-default-export */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { sendMessage } from '@/lib/messaging';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const parsedReceiverId = parseInt(receiverId, 10);

    // Check if receiver has blocked the sender
    const receiverProfile = await prisma.userProfile.findUnique({
      where: { userId: parsedReceiverId },
    });

    if (receiverProfile) {
      const preferences = (receiverProfile.preferences as any) || {};
      const blockedUsers = Array.isArray(preferences.blockedUsers) ? preferences.blockedUsers : [];

      if (blockedUsers.includes(user.id)) {
        return NextResponse.json(
          { error: 'You cannot message this user as they have blocked you' },
          { status: 403 },
        );
      }
    }

    const result = await sendMessage({
      senderId: user.id,
      receiverId: parsedReceiverId,
      content,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.message, { status: 201 });
  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
