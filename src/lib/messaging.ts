// Messaging service for your existing database structure

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SendMessageParams {
  senderId: number; // Using Int to match your User.id type
  receiverId: number;
  content: string; // Using 'content' to match your existing field name
}

export interface MessageWithUsers {
  id: number;
  content: string;
  isRead: boolean;
  sentAt: Date;
  readAt: Date | null;
  sender: {
    id: number;
    email: string;
    profile: {
      name: string;
      firstName: string | null;
      lastName: string | null;
      photoUrl: string | null;
    } | null;
  };
  receiver: {
    id: number;
    email: string;
    profile: {
      name: string;
      firstName: string | null;
      lastName: string | null;
      photoUrl: string | null;
    } | null;
  };
}

/**
 * Send a message from one user to another
 */
export async function sendMessage({
  senderId,
  receiverId,
  content,
}: SendMessageParams) {
  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                firstName: true,
                lastName: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    return { success: true, message };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Get conversation between two users (chronological order)
 */
export async function getConversation(
  user1Id: number,
  user2Id: number,
  limit: number = 50,
): Promise<MessageWithUsers[]> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'asc',
    },
    take: limit,
  });

  return messages as MessageWithUsers[];
}

/**
 * Get recent messages from a conversation
 */
export async function getRecentMessages(
  user1Id: number,
  user2Id: number,
  count: number = 20,
): Promise<MessageWithUsers[]> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
    take: count,
  });

  // Reverse to get chronological order
  return messages.reverse() as MessageWithUsers[];
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: number) {
  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, message };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return { success: false, error: 'Failed to mark message as read' };
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(
  receiverId: number,
  senderId: number,
) {
  try {
    const result = await prisma.message.updateMany({
      where: {
        receiverId,
        senderId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return { success: false, error: 'Failed to mark conversation as read' };
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(userId: number): Promise<number> {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });

  return count;
}

/**
 * Get all conversations for a user (list of users they've messaged with)
 */
export async function getUserConversations(userId: number) {
  // Get all unique users this user has conversed with
  const sentTo = await prisma.message.findMany({
    where: { senderId: userId },
    select: {
      receiver: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
    distinct: ['receiverId'],
  });

  const receivedFrom = await prisma.message.findMany({
    where: { receiverId: userId },
    select: {
      sender: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
    distinct: ['senderId'],
  });

  // Combine and deduplicate
  const conversationUsers = new Map();

  sentTo.forEach((msg: { receiver: { id: any; }; }) => {
    conversationUsers.set(msg.receiver.id, msg.receiver);
  });

  receivedFrom.forEach((msg: { sender: { id: any; }; }) => {
    conversationUsers.set(msg.sender.id, msg.sender);
  });

  // Get latest message and unread count for each conversation
  const conversations = await Promise.all(
    Array.from(conversationUsers.values()).map(async (user: any) => {
      const latestMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: user.id },
            { senderId: user.id, receiverId: userId },
          ],
        },
        orderBy: { sentAt: 'desc' },
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: user.id,
          receiverId: userId,
          isRead: false,
        },
      });

      return {
        user,
        latestMessage,
        unreadCount,
      };
    }),
  );

  // Sort by latest message
  conversations.sort((a, b) => {
    if (!a.latestMessage) return 1;
    if (!b.latestMessage) return -1;
    return b.latestMessage.sentAt.getTime() - a.latestMessage.sentAt.getTime();
  });

  return conversations;
}

/**
 * Delete a message (only by sender)
 */
export async function deleteMessage(messageId: number, userId: number) {
  try {
    // Verify the user is the sender
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return { success: false, error: 'Message not found' };
    }

    if (message.senderId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { success: false, error: 'Failed to delete message' };
  }
}

/**
 * Search messages by content
 */
export async function searchMessages(
  userId: number,
  searchTerm: string,
  limit: number = 20,
) {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
      content: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
      receiver: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      sentAt: 'desc',
    },
    take: limit,
  });

  return messages;
}
