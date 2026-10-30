import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Sequelize,
} from 'sequelize';
import { USER_STATUS } from '../enums/userEnum.ts';
import { BaseModel } from './baseModel.ts';
import type { Chat } from './chat.ts';
import type { ChatMember } from './chatMember.ts';

export class User extends BaseModel<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare email: string;
  declare status: CreationOptional<USER_STATUS>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare chatMemberships?: NonAttribute<ChatMember[]>;
  declare createdChats?: NonAttribute<Chat[]>;
  declare chats?: NonAttribute<Chat[]>;
}

export function initializeUserModel(sequelize: Sequelize): void {
  User.init(
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      status: {
        type: DataTypes.ENUM(...Object.values(USER_STATUS)),
        allowNull: false,
        defaultValue: USER_STATUS.ACTIVE,
      },
      createdAt: { type: DataTypes.DATE(3), allowNull: false, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE(3), allowNull: false, field: 'updated_at' },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      underscored: true,
    },
  );
}
