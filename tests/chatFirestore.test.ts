import { deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { afterAll, describe, expect, it } from 'vitest';
import {
  getChatMember,
  getChatMessage,
  getChatMessages,
  timestampToIso,
} from '../src/utils/chatFirestore.ts';

const app = initializeApp({ projectId: 'demo-chat-api' }, 'chat-firestore-utils-test');
const firestore = getFirestore(app);

afterAll(async () => {
  await deleteApp(app);
});

describe('chat Firestore utilities', () => {
  it('builds message and member references from the shared chat paths', () => {
    expect(getChatMessages(firestore, '42').path).toBe('chats/42/messages');
    expect(getChatMessage(firestore, '42', 'message-1').path)
      .toBe('chats/42/messages/message-1');
    expect(getChatMember(firestore, '42', '7').path).toBe('chats/42/members/7');
  });

  it('formats valid Firestore timestamps as UTC ISO strings', () => {
    const timestamp = Timestamp.fromDate(new Date('2026-01-02T03:04:05.000Z'));

    expect(timestampToIso(timestamp, 'createdAt')).toBe('2026-01-02T03:04:05.000Z');
  });

  it('reports invalid Firestore timestamp data explicitly', () => {
    expect(() => timestampToIso('not-a-timestamp', 'createdAt'))
      .toThrow('Firestore message has an invalid createdAt');
  });
});
