import { z } from 'zod';
import { chatLimits } from '../services/chatService.ts';
import { messageIdSchema, positiveIdSchema } from './ids.ts';

export const createChatRequest = z.object({
  userAId: positiveIdSchema,
  userBId: positiveIdSchema,
});

export const sendMessageRequest = z.object({
  senderId: positiveIdSchema,
  text: z.string().trim().min(1).max(chatLimits.maxTextLength),
});

export const chatParamsRequest = z.object({
  chatId: positiveIdSchema,
});

export const getMessagesRequest = z.object({
  params: chatParamsRequest,
  query: z.object({
    userId: positiveIdSchema,
    limit: z.coerce.number().int().min(1).max(chatLimits.maxPageSize).default(chatLimits.defaultPageSize),
  }),
});

export const markMessageReadRequest = z.object({
  params: chatParamsRequest.extend({ messageId: messageIdSchema }),
  body: z.object({ userId: positiveIdSchema }),
});

export const updateLastSeenRequest = z.object({
  params: chatParamsRequest,
  body: z.object({
    userId: positiveIdSchema,
    messageId: messageIdSchema,
  }),
});
