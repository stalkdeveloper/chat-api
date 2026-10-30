import type { Request, Response } from 'express';
import { listUserChatsRequest } from '../../../requests/userRequest.ts';
import type { ChatApi } from '../../../services/chatService.ts';

export function userController(chatApi: ChatApi) {
  return {
    listChats: async (request: Request, response: Response): Promise<void> => {
      const { userId } = listUserChatsRequest.parse(request.params);
      const chats = await chatApi.listUserChats(userId);
      response.status(200).json({ chats });
    },
  };
}