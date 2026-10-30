import { createDatabase } from '../config/database.ts';
import { initializeModels } from '../models/index.ts';

export function createInitializedDatabase() {
  const database = createDatabase();
  initializeModels(database);
  return database;
}
