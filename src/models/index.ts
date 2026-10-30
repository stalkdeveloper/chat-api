import type { Sequelize } from 'sequelize';
import { Chat, initializeChatModel } from './chat.ts';
import { ChatMember, initializeChatMemberModel } from './chatMember.ts';
import { initializeSchemaMigrationModel, SchemaMigration } from './schemaMigration.ts';
import { initializeUserModel, User } from './user.ts';

export function initializeModels(sequelize: Sequelize): void {
  initializeUserModel(sequelize);
  initializeChatModel(sequelize);
  initializeChatMemberModel(sequelize);
  initializeSchemaMigrationModel(sequelize);

  User.hasMany(ChatMember, {
    as: 'chatMemberships',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ChatMember.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
  });

  Chat.hasMany(ChatMember, {
    as: 'members',
    foreignKey: 'chatId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ChatMember.belongsTo(Chat, {
    as: 'chat',
    foreignKey: 'chatId',
  });

  User.hasMany(Chat, {
    as: 'createdChats',
    foreignKey: 'createdBy',
  });
  Chat.belongsTo(User, {
    as: 'creator',
    foreignKey: 'createdBy',
    onDelete: 'SET NULL',
  });

  User.belongsToMany(Chat, {
    as: 'chats',
    through: ChatMember,
    foreignKey: 'userId',
    otherKey: 'chatId',
  });
  Chat.belongsToMany(User, {
    as: 'participants',
    through: ChatMember,
    foreignKey: 'chatId',
    otherKey: 'userId',
  });
}

export { Chat, ChatMember, SchemaMigration, User };
