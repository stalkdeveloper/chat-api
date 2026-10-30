import { CHAT_TYPE } from '../../enums/chatEnum.ts';
import { CHAT_MEMBER_ROLE } from '../../enums/chatMemberEnum.ts';
import { USER_STATUS } from '../../enums/userEnum.ts';

export const name = '001_init';

export const statements: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(191)    NOT NULL,
    status      ENUM(${Object.values(USER_STATUS).map((status) => `'${status}'`).join(', ')}) NOT NULL DEFAULT '${USER_STATUS.ACTIVE}',
    created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS chats (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    type             ENUM(${Object.values(CHAT_TYPE).map((type) => `'${type}'`).join(', ')}) NOT NULL,
    name             VARCHAR(100)    NULL,
    direct_key       VARCHAR(64)     NULL,
    created_by       BIGINT UNSIGNED NULL,
    last_message_at  DATETIME(3)     NULL,
    created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uq_chats_direct_key (direct_key),
    CONSTRAINT fk_chats_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS chat_members (
    chat_id    BIGINT UNSIGNED NOT NULL,
    user_id    BIGINT UNSIGNED NOT NULL,
    role       ENUM(${Object.values(CHAT_MEMBER_ROLE).map((role) => `'${role}'`).join(', ')}) NOT NULL DEFAULT '${CHAT_MEMBER_ROLE.MEMBER}',
    joined_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (chat_id, user_id),
    KEY idx_chat_members_user (user_id, chat_id),
    CONSTRAINT fk_chat_members_chat FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];
