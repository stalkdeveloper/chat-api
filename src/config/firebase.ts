import { applicationDefault, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from './env.ts';

let firestore: Firestore | undefined;

/**
 * Lazily initialises firebase-admin and returns the shared Firestore client.
 *
 * Credentials resolution:
 *  - FIRESTORE_EMULATOR_HOST set  -> emulator, no credentials needed (project id defaults to "demo-chat-api").
 *  - otherwise                    -> Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS
 *                                    pointing at a service-account JSON, or the runtime's metadata server).
 */
export function getDb(): Firestore {
  if (firestore) return firestore;

  const app: App =
    getApps()[0] ??
    initializeApp(
      env.FIRESTORE_EMULATOR_HOST
        ? { projectId: env.FIREBASE_PROJECT_ID ?? 'demo-chat-api' }
        : {
            credential: applicationDefault(),
            ...(env.FIREBASE_PROJECT_ID ? { projectId: env.FIREBASE_PROJECT_ID } : {}),
          },
    );

  firestore = getFirestore(app);
  return firestore;
}
