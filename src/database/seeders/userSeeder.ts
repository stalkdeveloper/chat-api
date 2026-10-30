import { User } from '../../models/index.ts';
import { USER_STATUS } from '../../enums/userEnum.ts';

export async function seedUsers(): Promise<void> {
  await User.bulkCreate(
    [
      { name: 'Alice Example', email: 'alice@example.com', status: USER_STATUS.ACTIVE },
      { name: 'Bob Example', email: 'bob@example.com', status: USER_STATUS.ACTIVE },
    ],
    { updateOnDuplicate: ['name', 'status'] },
  );
  console.log('Seeded Alice and Bob example users');
}