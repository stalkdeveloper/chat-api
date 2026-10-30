import { createInitializedDatabase } from '../connection.ts';
import { seedUsers } from './userSeeder.ts';

async function seed(): Promise<void> {
  const database = createInitializedDatabase();

  try {
    await database.authenticate();
    await seedUsers();
  } finally {
    await database.close();
  }
}

void seed().catch((error: unknown) => {
  console.error('Database seeding failed:', error);
  process.exitCode = 1;
});