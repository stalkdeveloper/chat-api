import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { chatRoutes } from './routes/chatRoutes.ts';
import { userRoutes } from './routes/userRoutes.ts';
import { ChatApi } from './services/chatService.ts';
import { HttpError } from './utils/httpError.ts';

export function createApp(chatApi: ChatApi): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '16kb' }));

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
  app.use('/chat', chatRoutes(chatApi));
  app.use('/user', userRoutes(chatApi));

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });

  const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
    if (error instanceof HttpError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }

    if (error instanceof ZodError) {
      response.status(400).json({ error: 'Invalid request', details: error.issues });
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({ error: 'Invalid JSON body' });
      return;
    }

    console.error('Unhandled request error:', error);
    response.status(500).json({ error: 'Internal server error' });
  };
  app.use(errorHandler);

  return app;
}
