import { User } from '../models/User.js';

export async function generateUniqueUID(): Promise<string> {
  let uid = '';
  let isUnique = false;

  while (!isUnique) {
    uid = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existing = await User.findOne({ uid });
    if (!existing) {
      isUnique = true;
    }
  }

  return uid;
}
