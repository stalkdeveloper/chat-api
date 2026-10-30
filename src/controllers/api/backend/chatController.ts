import type { Request, Response } from 'express';
import {
  chatParamsRequest,
  createChatRequest,
  getMessagesRequest,
  markMessageReadRequest,
  sendMessageRequest,
  updateLastSeenRequest,
} from '../../../requests/chatRequest.ts';
import type { ChatApi } from '../../../services/chatService.ts';

export function chatController(chatApi: ChatApi) {
  return {
    createChat: async (request: Request, response: Response): Promise<void> => {
      const { userAId, userBId } = createChatRequest.parse(request.body);
      const chatId = await chatApi.createOrGetDirectChat(userAId, userBId);
      response.status(200).json({ chatId });
    },

    sendMessage: async (request: Request, response: Response): Promise<void> => {
      const { chatId } = chatParamsRequest.parse(request.params);
      const { senderId, text } = sendMessageRequest.parse(request.body);
      const message = await chatApi.sendMessage(chatId, senderId, text);
      response.status(201).json({ message });
    },

    getMessages: async (request: Request, response: Response): Promise<void> => {
      const { params, query } = getMessagesRequest.parse({
        params: request.params,
        query: request.query,
      });
      const messages = await chatApi.getMessages(params.chatId, query.userId, query.limit);
      response.status(200).json({ messages });
    },

    markMessageRead: async (request: Request, response: Response): Promise<void> => {
      const { params, body } = markMessageReadRequest.parse({
        params: request.params,
        body: request.body,
      });
      const receipt = await chatApi.markMessageRead(params.chatId, params.messageId, body.userId);
      response.status(200).json({ receipt });
    },

    updateLastSeen: async (request: Request, response: Response): Promise<void> => {
      const { params, body } = updateLastSeenRequest.parse({
        params: request.params,
        body: request.body,
      });
      const lastSeen = await chatApi.updateLastSeen(params.chatId, body.userId, body.messageId);
      response.status(200).json({ lastSeen });
    },
  };
}
