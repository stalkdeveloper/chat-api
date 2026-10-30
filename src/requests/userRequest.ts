import { z } from 'zod';
import { positiveIdSchema } from './ids.ts';

export const listUserChatsRequest = z.object({
  userId: positiveIdSchema,
});
