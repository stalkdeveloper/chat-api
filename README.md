# Chat API

A strict TypeScript chat backend. MySQL stores users, chats, and chat membership; Firebase
Firestore stores messages, per-message read receipts, and each member's last-seen message.

## Requirements

- Node.js 20 or newer
- MySQL 8 or compatible
- Firebase project credentials, or the Firestore emulator for local development

## Setup

```sh
npm install
cp .env.example .env
```

Set the MySQL connection values in `.env`, create the configured database, then apply the
schema and (optionally) add two sample users:

```sh
npm run migrate
npm run seed
```

Configure Firestore using Application Default Credentials (`GOOGLE_APPLICATION_CREDENTIALS`
may point to a service-account JSON file) and `FIREBASE_PROJECT_ID`. For local development,
set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` and optionally `FIREBASE_PROJECT_ID=demo-chat-api`.
Start the API with `npm run dev`. Run `npm run build` to create `dist/`, or `npm start` to run
the compiled server.

The seed command creates `alice@example.com` and `bob@example.com`; get their numeric IDs from
MySQL before making chat requests. There is intentionally no user-creation API in this scope.

## API

All IDs are positive MySQL user/chat IDs. Message IDs are Firestore document IDs. Successful
responses are JSON; invalid requests return `400`, missing resources return `404`, and a
non-member attempting a member-only operation gets `403`.

### Create or get a direct chat

`POST /chat/create`

```json
{ "userAId": "1", "userBId": "2" }
```

Returns `200 { "chatId": "123" }`. Repeated and concurrent requests for the same pair return
the same chat. A user cannot start a direct chat with themselves.

### Send a message

`POST /chat/:chatId/message/send`

```json
{ "senderId": "1", "text": "Hi there" }
```

Returns `201 { "message": { "id", "chatId", "senderId", "text", "createdAt", "readBy" } }`.
Messages are timestamped in UTC, and the sender is recorded as having read their own message.
Text is trimmed, must not be empty, and is limited to 4,000 characters.

### Get messages

`GET /chat/:chatId/messages?userId=1&limit=50`

`userId` is required so membership can be checked. `limit` defaults to 50 and may be from 1
through 100. Returns `{ "messages": [...] }` in chronological order, containing up to the
most recent `limit` messages.

### Mark a message read

`POST /chat/:chatId/message/:messageId/read`

```json
{ "userId": "2" }
```

Returns `{ "receipt": { "messageId", "userId", "readAt" } }`. The receipt is saved in the
message's `readBy` map in Firestore.

### Update last seen

`POST /chat/:chatId/lastseen`

```json
{ "userId": "2", "messageId": "firestore-message-id" }
```

Returns `{ "lastSeen": { "chatId", "userId", "messageId", "lastSeenAt" } }`. The latest
message ID and UTC timestamp are stored in the user's Firestore chat-member document.

### List a user's chats

`GET /user/:userId/chats`

Returns `{ "chats": [...] }`; each chat includes its ID, type, optional name, member IDs,
creation time, and last-message time.

`GET /health` is a lightweight process health check. These routes accept user IDs as request
data and are not an authentication system; production deployments should authenticate callers
and derive their identity from trusted credentials rather than trusting supplied IDs.

## Storage layout

- MySQL migration `001_init` creates `users`, `chats`, and `chat_members`. Unique `direct_key`
  plus a transaction makes direct-chat creation idempotent.
- Firestore messages live at `chats/{chatId}/messages/{messageId}`.
- Read timestamps are stored under each message's `readBy.{userId}` field.
- Last-seen state lives at `chats/{chatId}/members/{userId}`.

## Source structure

- `src/routes/` maps HTTP paths and methods to controller handlers.
- `src/requests/` contains reusable Zod request schemas and ID validation.
- `src/controllers/` handles validated HTTP input/output and delegates to services.
- `src/services/` contains chat business logic and Firestore operations.
- `src/models/` contains the Sequelize ORM base, typed MySQL models, and model associations.
- `src/utils/` contains shared Firestore path and timestamp helpers.
- `src/database/connection.ts` creates the Sequelize connection and initializes models for server, migration, and seeding entry points.
- `src/config/env.ts` loads and validates environment variables; `src/config/constant.ts` contains application constants.
- Other `src/config/` modules provide shared database and Firebase configuration.

Sequelize associations model the relations: `User.hasMany(ChatMember)`,
`Chat.hasMany(ChatMember)`, `Chat.belongsTo(User, { as: 'creator' })`, and the
`User.belongsToMany(Chat)` / `Chat.belongsToMany(User)` relation through `ChatMember`.
MySQL foreign keys enforce those links, while the composite membership primary key ensures
a user can only be added once to a chat. Services use Sequelize model operations rather than
writing SQL for application data.

## Checks

```sh
npm run typecheck
npm test
npm run test:emulator
```

`npm run test:emulator` requires a running Firestore emulator. It runs the same test suite as
`npm test` against the emulator environment.

## Postman

Import [`postman/Chat API.postman_collection.json`](./postman/Chat%20API.postman_collection.json)
into Postman. Set `baseUrl`, `userAId`, and `userBId` in the collection variables; use existing
user IDs from MySQL (the sample users are created by `npm run seed`). Run **Create or Get Chat**
first, then **Send Message**. The collection automatically saves `chatId` and `messageId` for
the remaining requests.
