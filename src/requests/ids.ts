import { z } from 'zod';

const maximumDatabaseId = 18_446_744_073_709_551_615n;

const stringIdSchema = z.string()
  .regex(/^[1-9]\d*$/, 'Must be a positive integer ID')
  .refine((value) => BigInt(value) <= maximumDatabaseId, 'ID exceeds the MySQL BIGINT range');

const numberIdSchema = z.number()
  .int()
  .positive()
  .refine(Number.isSafeInteger, 'Must be a safe integer ID')
  .transform(String);

export const positiveIdSchema = z.union([stringIdSchema, numberIdSchema]).transform(String);
export const messageIdSchema = z.string().min(1).max(150).regex(/^[^/]+$/, 'Invalid message ID');
