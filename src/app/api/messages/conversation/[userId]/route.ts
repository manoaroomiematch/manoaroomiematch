/* eslint-disable import/prefer-default-export */
// src/app/api/messages/conversation/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { getConversation } from '@/lib/messaging';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    console.log('[Conversation API] Starting request for userId:', params.userId);

    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log('[Conversation API] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Conversation API] Session email:', session.user.email);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('[Conversation API] User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Conversation API] Current user ID:', user.id);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    console.log('[Conversation API] Fetching conversation with user:', params.userId, 'limit:', limit);

    const messages = await getConversation(
      user.id,
      parseInt(params.userId, 10),
      limit,
    );

    console.log('[Conversation API] Successfully fetched conversation');
    return NextResponse.json(messages);
  } catch (error) {
    console.error('[Conversation API] Error getting conversation:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('[Conversation API] Error name:', error.name);
      console.error('[Conversation API] Error message:', error.message);
      console.error('[Conversation API] Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
