import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.ts';
import type { ChatApi } from '../src/services/chatService.ts';

const chatApi = {
  createOrGetDirectChat: vi.fn<ChatApi['createOrGetDirectChat']>(async () => '99'),
  sendMessage: vi.fn<ChatApi['sendMessage']>(async (chatId, senderId, text) => ({
    id: 'message-1',
    chatId,
    senderId,
    text,
    createdAt: '2026-01-01T00:00:00.000Z',
    readBy: { [senderId]: '2026-01-01T00:00:00.000Z' },
  })),
  getMessages: vi.fn<ChatApi['getMessages']>(async () => []),
  markMessageRead: vi.fn<ChatApi['markMessageRead']>(async (chatId, messageId, userId) => ({
    messageId,
    userId,
    readAt: '2026-01-01T00:00:00.000Z',
  })),
  updateLastSeen: vi.fn<ChatApi['updateLastSeen']>(async (chatId, userId, messageId) => ({
    chatId,
    userId,
    messageId,
    lastSeenAt: '2026-01-01T00:00:00.000Z',
  })),
  listUserChats: vi.fn<ChatApi['listUserChats']>(async () => []),
} satisfies ChatApi;

const app = createApp(chatApi);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('chat routes', () => {
  it('creates or returns a direct chat', async () => {
    const response = await request(app)
      .post('/chat/create')
      .send({ userAId: '1', userBId: '2' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ chatId: '99' });
    expect(chatApi.createOrGetDirectChat).toHaveBeenCalledWith('1', '2');
  });

  it('rejects invalid IDs before calling the service', async () => {
    const response = await request(app)
      .post('/chat/create')
      .send({ userAId: '0', userBId: '2' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid request');
    expect(chatApi.createOrGetDirectChat).not.toHaveBeenCalled();
  });

  it('uses the default message page size and checks the requesting member', async () => {
    const response = await request(app).get('/chat/4/messages?userId=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ messages: [] });
    expect(chatApi.getMessages).toHaveBeenCalledWith('4', '1', 50);
  });

  it('rejects message limits outside the supported range', async () => {
    const response = await request(app).get('/chat/4/messages?userId=1&limit=101');

    expect(response.status).toBe(400);
    expect(chatApi.getMessages).not.toHaveBeenCalled();
  });

  it('sends a trimmed message', async () => {
    const response = await request(app)
      .post('/chat/4/message/send')
      .send({ senderId: 1, text: '  hello  ' });

    expect(response.status).toBe(201);
    expect(chatApi.sendMessage).toHaveBeenCalledWith('4', '1', 'hello');
    expect(response.body.message.text).toBe('hello');
  });

  it('marks a message as read', async () => {
    const response = await request(app)
      .post('/chat/4/message/message-1/read')
      .send({ userId: '2' });

    expect(response.status).toBe(200);
    expect(response.body.receipt).toMatchObject({ messageId: 'message-1', userId: '2' });
    expect(chatApi.markMessageRead).toHaveBeenCalledWith('4', 'message-1', '2');
  });

  it('updates the last-seen message', async () => {
    const response = await request(app)
      .post('/chat/4/lastseen')
      .send({ userId: '2', messageId: 'message-1' });

    expect(response.status).toBe(200);
    expect(response.body.lastSeen).toMatchObject({
      chatId: '4',
      userId: '2',
      messageId: 'message-1',
    });
    expect(chatApi.updateLastSeen).toHaveBeenCalledWith('4', '2', 'message-1');
  });

  it('lists the user chats', async () => {
    const response = await request(app).get('/user/1/chats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ chats: [] });
    expect(chatApi.listUserChats).toHaveBeenCalledWith('1');
  });
});
