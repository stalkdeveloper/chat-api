import { Router } from 'express';
import { chatController } from '../controllers/api/backend/chatController.ts';
import type { ChatApi } from '../services/chatService.ts';

export function chatRoutes(chatApi: ChatApi): Router {
  const router = Router();
  const controller = chatController(chatApi);

  router.post('/create', controller.createChat);
  router.post('/:chatId/message/send', controller.sendMessage);
  router.get('/:chatId/messages', controller.getMessages);
  router.post('/:chatId/message/:messageId/read', controller.markMessageRead);
  router.post('/:chatId/lastseen', controller.updateLastSeen);

  return router;
}
