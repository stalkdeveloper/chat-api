import { Router } from 'express';
import { userController } from '../controllers/api/backend/userController.ts';
import type { ChatApi } from '../services/chatService.ts';

export function userRoutes(chatApi: ChatApi): Router {
  const router = Router();
  const controller = userController(chatApi);

  router.get('/:userId/chats', controller.listChats);

  return router;
}
