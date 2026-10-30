import { createApp } from './app.ts';
import { createInitializedDatabase } from './database/connection.ts';
import { env } from './config/env.ts';
import { getDb } from './config/firebase.ts';
import { createChatService } from './services/chatService.ts';

async function startServer(): Promise<void> {
  const database = createInitializedDatabase();

  try {
    await database.authenticate();
    const app = createApp(createChatService(database, getDb()));
    const server = app.listen(env.PORT, () => {
      console.log(`Chat API listening on port ${env.PORT}`);
    });

    const shutdown = (signal: string): void => {
      console.log(`${signal} received; shutting down`);
      server.close((error) => {
        if (error) {
          console.error('HTTP server shutdown failed:', error);
          process.exitCode = 1;
        }
        void database.close().catch((databaseError: unknown) => {
          console.error('MySQL shutdown failed:', databaseError);
          process.exitCode = 1;
        });
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    await database.close();
    throw error;
  }
}

void startServer().catch((error: unknown) => {
  console.error('Failed to start chat API:', error);
  process.exitCode = 1;
});
