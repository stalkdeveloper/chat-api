import { createInitializedDatabase } from './connection.ts';
import { SchemaMigration } from '../models/index.ts';
import { name, statements } from './migrations/001_init.ts';

async function migrate(): Promise<void> {
  const database = createInitializedDatabase();

  try {
    await database.authenticate();
    await SchemaMigration.sync();

    const applied = await SchemaMigration.findByPk(name);
    if (applied) {
      console.log(`Migration ${name} already applied`);
      return;
    }

    for (const statement of statements) {
      await database.query(statement);
    }
    await SchemaMigration.create({ name, appliedAt: new Date() });
    console.log(`Applied migration ${name}`);
  } finally {
    await database.close();
  }
}

void migrate().catch((error: unknown) => {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
});
