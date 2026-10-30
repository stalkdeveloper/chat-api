import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import { CHAT_TYPE } from '../enums/chatEnum.ts';
import { BaseModel } from './baseModel.ts';
import type { ChatMember } from './chatMember.ts';
import type { User } from './user.ts';

export class Chat extends BaseModel<InferAttributes<Chat>, InferCreationAttributes<Chat>> {
  declare id: CreationOptional<string>;
  declare type: CHAT_TYPE;
  declare name: string | null;
  declare directKey: string | null;
  declare createdBy: string | null;
  declare lastMessageAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare members?: NonAttribute<ChatMember[]>;
  declare participants?: NonAttribute<User[]>;
  declare creator?: NonAttribute<User | null>;
}

export function initializeChatModel(sequelize: Sequelize): void {
  Chat.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.ENUM(...Object.values(CHAT_TYPE)), allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: true },
      directKey: { type: DataTypes.STRING(64), allowNull: true, unique: true, field: 'direct_key' },
      createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'created_by' },
      lastMessageAt: { type: DataTypes.DATE(3), allowNull: true, field: 'last_message_at' },
      createdAt: { type: DataTypes.DATE(3), allowNull: false, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE(3), allowNull: false, field: 'updated_at' },
    },
    {
      sequelize,
      tableName: 'chats',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      underscored: true,
    },
  );
}
