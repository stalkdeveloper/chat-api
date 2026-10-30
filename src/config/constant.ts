export const MESSAGES = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MAX_TEXT_LENGTH: 4000,
} as const;

export const CHATS = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  MAX_GROUP_MEMBERS: 256,
  MAX_GROUP_NAME_LENGTH: 100,
} as const;

export const FIRESTORE_COLLECTIONS = {
  CHATS: 'chats',
  MESSAGES: 'messages',
  MEMBERS: 'members',
} as const;
