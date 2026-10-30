import { FieldPath, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { literal, Op, Sequelize } from 'sequelize';
import { CHATS, MESSAGES } from '../config/constant.ts';
import { CHAT_TYPE } from '../enums/chatEnum.ts';
import { HttpError } from '../utils/httpError.ts';
import { Chat, ChatMember, User } from '../models/index.ts';
import {
  getChatMember,
  getChatMessage,
  getChatMessages,
  timestampToIso,
} from '../utils/chatFirestore.ts';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readBy: Record<string, string>;
}

export interface ChatSummary {
  chatId: string;
  type: CHAT_TYPE;
  name: string | null;
  memberIds: string[];
  createdAt: string;
  lastMessageAt: string | null;
}

export interface ChatApi {
  createOrGetDirectChat(userAId: string, userBId: string): Promise<string>;
  sendMessage(chatId: string, senderId: string, text: string): Promise<ChatMessage>;
  getMessages(chatId: string, userId: string, limit: number): Promise<ChatMessage[]>;
  markMessageRead(chatId: string, messageId: string, userId: string): Promise<{ messageId: string; userId: string; readAt: string }>;
  updateLastSeen(chatId: string, userId: string, messageId: string): Promise<{ chatId: string; userId: string; messageId: string; lastSeenAt: string }>;
  listUserChats(userId: string): Promise<ChatSummary[]>;
}

interface MessageDocument {
  senderId: string;
  text: string;
  createdAt: Timestamp;
  readBy?: Record<string, Timestamp>;
}

export class ChatService implements ChatApi {
  constructor(
    private readonly database: Sequelize,
    private readonly firestore: Firestore,
  ) {}

  async createOrGetDirectChat(userAId: string, userBId: string): Promise<string> {
    if (userAId === userBId) {
      throw new HttpError(400, 'A direct chat requires two different users');
    }

    return this.database.transaction(async (transaction) => {
      const users = await User.findAll({
        attributes: ['id'],
        where: { id: { [Op.in]: [userAId, userBId] } },
        transaction,
      });
      if (users.length !== 2) {
        throw new HttpError(404, 'One or both users were not found');
      }

      const directKey = [userAId, userBId]
        .sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1))
        .join(':');
      const [chat] = await Chat.findOrCreate({
        where: { directKey },
        defaults: { type: CHAT_TYPE.DIRECT, directKey, createdBy: userAId },
        transaction,
      });

      await ChatMember.bulkCreate(
        [
          { chatId: chat.id, userId: userAId },
          { chatId: chat.id, userId: userBId },
        ],
        { ignoreDuplicates: true, transaction },
      );
      return String(chat.id);
    });
  }

  async sendMessage(chatId: string, senderId: string, text: string): Promise<ChatMessage> {
    await this.requireMember(chatId, senderId);

    const createdAt = Timestamp.now();
    const messageRef = getChatMessages(this.firestore, chatId).doc();
    await messageRef.create({
      senderId,
      text,
      createdAt,
      readBy: { [senderId]: createdAt },
    } satisfies MessageDocument);

    await Chat.update({ lastMessageAt: createdAt.toDate() }, { where: { id: chatId } });

    return {
      id: messageRef.id,
      chatId,
      senderId,
      text,
      createdAt: timestampToIso(createdAt, 'createdAt'),
      readBy: { [senderId]: timestampToIso(createdAt, 'readBy timestamp') },
    };
  }

  async getMessages(chatId: string, userId: string, limit: number): Promise<ChatMessage[]> {
    await this.requireMember(chatId, userId);

    const messagesRef = getChatMessages(this.firestore, chatId);
    const snapshot = await messagesRef.orderBy('createdAt', 'desc').limit(limit).get();
    return snapshot.docs.reverse().map((document) => {
      const data = document.data() as MessageDocument;
      return {
        id: document.id,
        chatId,
        senderId: data.senderId,
        text: data.text,
        createdAt: timestampToIso(data.createdAt, 'createdAt'),
        readBy: Object.fromEntries(
          Object.entries(data.readBy ?? {}).map(([readerId, readAt]) => [
            readerId,
            timestampToIso(readAt, 'readBy timestamp'),
          ]),
        ),
      };
    });
  }

  async markMessageRead(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<{ messageId: string; userId: string; readAt: string }> {
    await this.requireMember(chatId, userId);
    const messageRef = getChatMessage(this.firestore, chatId, messageId);
    await this.requireMessage(chatId, messageId);

    const readAt = Timestamp.now();
    await messageRef.update(new FieldPath('readBy', userId), readAt);
    return { messageId, userId, readAt: timestampToIso(readAt, 'readAt') };
  }

  async updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<{ chatId: string; userId: string; messageId: string; lastSeenAt: string }> {
    await this.requireMember(chatId, userId);
    await this.requireMessage(chatId, messageId);

    const lastSeenAt = Timestamp.now();
    await getChatMember(this.firestore, chatId, userId)
      .set({ lastSeenMessageId: messageId, lastSeenAt }, { merge: true });

    return { chatId, userId, messageId, lastSeenAt: timestampToIso(lastSeenAt, 'lastSeenAt') };
  }

  async listUserChats(userId: string): Promise<ChatSummary[]> {
    const memberships = await ChatMember.findAll({
      attributes: ['chatId'],
      where: { userId },
      raw: true,
    });
    const chatIds = memberships.map(({ chatId }) => chatId);
    if (chatIds.length === 0) return [];

    const chats = await Chat.findAll({
      where: { id: { [Op.in]: chatIds } },
      include: [{
        model: ChatMember,
        as: 'members',
        attributes: ['userId'],
      }],
      order: [
        [literal('COALESCE(`Chat`.`last_message_at`, `Chat`.`created_at`)'), 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return chats.map((chat) => ({
      chatId: String(chat.id),
      type: chat.type,
      name: chat.name,
      memberIds: chat.members?.map((member) => String(member.userId)) ?? [],
      createdAt: chat.createdAt.toISOString(),
      lastMessageAt: chat.lastMessageAt?.toISOString() ?? null,
    }));
  }

  private async requireMember(chatId: string, userId: string): Promise<void> {
    const chat = await Chat.findByPk(chatId, { attributes: ['id'] });
    if (!chat) {
      throw new HttpError(404, 'Chat not found');
    }

    const membership = await ChatMember.findOne({
      where: { chatId, userId },
      attributes: ['chatId'],
    });
    if (!membership) {
      throw new HttpError(403, 'User is not a member of this chat');
    }
  }

  private async requireMessage(chatId: string, messageId: string): Promise<void> {
    const message = await getChatMessage(this.firestore, chatId, messageId).get();
    if (!message.exists) {
      throw new HttpError(404, 'Message not found');
    }
  }
}

export function createChatService(database: Sequelize, firestore: Firestore): ChatApi {
  return new ChatService(database, firestore);
}

export const chatLimits = {
  defaultPageSize: MESSAGES.DEFAULT_PAGE_SIZE,
  maxPageSize: Math.min(MESSAGES.MAX_PAGE_SIZE, CHATS.MAX_PAGE_SIZE),
  maxTextLength: MESSAGES.MAX_TEXT_LENGTH,
} as const;
