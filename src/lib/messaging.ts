// src/lib/messaging.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: number) {
  try {
    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: {
        sentAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                name: true,
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
                firstName: true,
                lastName: true,
                name: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    // Group messages by conversation (other user)
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId
        ? message.receiverId
        : message.senderId;

      const otherUser = message.senderId === userId
        ? message.receiver
        : message.sender;

      if (!conversationsMap.has(otherUserId)) {
        // Get display name from profile
        let displayName = 'Unknown User';
        if (otherUser.profile) {
          if (otherUser.profile.firstName && otherUser.profile.lastName) {
            displayName = `${otherUser.profile.firstName} ${otherUser.profile.lastName}`;
          } else if (otherUser.profile.name) {
            displayName = otherUser.profile.name;
          } else if (otherUser.profile.firstName) {
            displayName = otherUser.profile.firstName;
          }
        } else {
          // Fallback to email name
          const emailName = otherUser.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: displayName,
          userPhoto: otherUser.profile?.photoUrl || null,
          lastMessage: message.content,
          lastMessageTime: message.sentAt.toISOString(),
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(otherUserId).unreadCount += 1;
      }
    });

    return {
      conversations: Array.from(conversationsMap.values()),
    };
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
}

/**
 * Get conversation between two users
 */
export async function getConversation(
  userId: number,
  otherUserId: number,
  limit: number = 50,
) {
  try {
    // Get the other user's info including profile
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!otherUser) {
      throw new Error('User not found');
    }

    // Get messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    // Get display name from profile
    let displayName = 'Unknown User';
    if (otherUser.profile) {
      if (otherUser.profile.firstName && otherUser.profile.lastName) {
        displayName = `${otherUser.profile.firstName} ${otherUser.profile.lastName}`;
      } else if (otherUser.profile.name) {
        displayName = otherUser.profile.name;
      } else if (otherUser.profile.firstName) {
        displayName = otherUser.profile.firstName;
      }
    } else {
      // Fallback to email name
      const emailName = otherUser.email.split('@')[0];
      displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return {
      otherUser: {
        id: otherUser.id,
        name: displayName,
        photo: otherUser.profile?.photoUrl || null,
      },
      messages: messages.reverse(), // Show oldest first
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

/**
 * Send a message
 */
export async function sendMessage(data: {
  senderId: number;
  receiverId: number;
  content: string;
}) {
  try {
    // Check if the sender has blocked the receiver (for symmetry, though unusual)
    // or if there's any other restriction
    // Note: We allow sending if blocked, as blocking is one-way.
    // The receiver won't see the message in conversation, but technical delivery works.

    const message = await prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        sentAt: new Date(),
        isRead: false,
      },
    });

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Failed to send message',
    };
  }
}

/**
 * Mark a specific message as read
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

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return {
      success: false,
      error: 'Failed to mark message as read',
    };
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(
  userId: number,
  otherUserId: number,
) {
  try {
    const result = await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    return {
      success: false,
      error: 'Failed to mark conversation as read',
      count: 0,
    };
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(userId: number) {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
