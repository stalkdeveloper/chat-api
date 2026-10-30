import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import { CHAT_MEMBER_ROLE } from '../enums/chatMemberEnum.ts';
import { BaseModel } from './baseModel.ts';
import type { Chat } from './chat.ts';
import type { User } from './user.ts';

export class ChatMember extends BaseModel<
  InferAttributes<ChatMember>,
  InferCreationAttributes<ChatMember>
> {
  declare chatId: string;
  declare userId: string;
  declare role: CreationOptional<CHAT_MEMBER_ROLE>;
  declare joinedAt: CreationOptional<Date>;

  declare chat?: NonAttribute<Chat>;
  declare user?: NonAttribute<User>;
}

export function initializeChatMemberModel(sequelize: Sequelize): void {
  ChatMember.init(
    {
      chatId: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        field: 'chat_id',
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        field: 'user_id',
      },
      role: {
        type: DataTypes.ENUM(...Object.values(CHAT_MEMBER_ROLE)),
        allowNull: false,
        defaultValue: CHAT_MEMBER_ROLE.MEMBER,
      },
      joinedAt: {
        type: DataTypes.DATE(3),
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'joined_at',
      },
    },
    {
      sequelize,
      tableName: 'chat_members',
      timestamps: false,
      underscored: true,
    },
  );
}
