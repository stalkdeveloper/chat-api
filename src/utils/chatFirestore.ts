import {
  Timestamp,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from 'firebase-admin/firestore';
import { FIRESTORE_COLLECTIONS } from '../config/constant.ts';

export function getChatMessages(
  firestore: Firestore,
  chatId: string,
): CollectionReference {
  return firestore
    .collection(FIRESTORE_COLLECTIONS.CHATS)
    .doc(chatId)
    .collection(FIRESTORE_COLLECTIONS.MESSAGES);
}

export function getChatMessage(
  firestore: Firestore,
  chatId: string,
  messageId: string,
): DocumentReference {
  return getChatMessages(firestore, chatId).doc(messageId);
}

export function getChatMember(
  firestore: Firestore,
  chatId: string,
  userId: string,
): DocumentReference {
  return firestore
    .collection(FIRESTORE_COLLECTIONS.CHATS)
    .doc(chatId)
    .collection(FIRESTORE_COLLECTIONS.MEMBERS)
    .doc(userId);
}

export function timestampToIso(value: unknown, field: string): string {
  if (!(value instanceof Timestamp)) {
    throw new Error(`Firestore message has an invalid ${field}`);
  }
  return value.toDate().toISOString();
}
