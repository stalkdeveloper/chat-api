import { afterAll, describe, expect, it } from 'vitest';
import { Sequelize } from 'sequelize';
import { initializeModels, Chat, ChatMember, User } from '../src/models/index.ts';

const database = new Sequelize('chat_api', 'root', '', {
  dialect: 'mysql',
  logging: false,
});
initializeModels(database);

afterAll(async () => {
  await database.close();
});

describe('Sequelize model relationships', () => {
  it('associates users and chats through chat memberships', () => {
    expect(User.associations.chatMemberships?.associationType).toBe('HasMany');
    expect(ChatMember.associations.user?.associationType).toBe('BelongsTo');
    expect(Chat.associations.members?.associationType).toBe('HasMany');
    expect(ChatMember.associations.chat?.associationType).toBe('BelongsTo');
    expect(User.associations.chats?.associationType).toBe('BelongsToMany');
    expect(Chat.associations.participants?.associationType).toBe('BelongsToMany');
  });

  it('associates a chat with its optional creator', () => {
    expect(User.associations.createdChats?.associationType).toBe('HasMany');
    expect(Chat.associations.creator?.associationType).toBe('BelongsTo');
  });
});
