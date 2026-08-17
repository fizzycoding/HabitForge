import { Tag } from '../models/Tag.js';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { AppError } from '../middleware/error.js';
import type { CreateTagInput, UpdateTagInput } from '../schemas/tag.schema.js';

export const GLOBAL_PREDEFINED_TAGS = [
  { name: 'Health', icon: 'heart', color: '#EF4444', isPredefined: true, userId: null },
  { name: 'Productivity', icon: 'zap', color: '#3B82F6', isPredefined: true, userId: null },
  { name: 'Fitness', icon: 'activity', color: '#10B981', isPredefined: true, userId: null },
  { name: 'Mindfulness', icon: 'smile', color: '#8B5CF6', isPredefined: true, userId: null },
  { name: 'Finance', icon: 'dollar-sign', color: '#F59E0B', isPredefined: true, userId: null },
];

export async function ensureGlobalTagsSeeded() {
  for (const tag of GLOBAL_PREDEFINED_TAGS) {
    await Tag.findOneAndUpdate(
      { name: tag.name, isPredefined: true },
      { $setOnInsert: tag },
      { upsert: true },
    );
  }
}

export async function getUserTags(userId: string) {
  await ensureGlobalTagsSeeded();

  return Tag.find({
    $or: [{ isPredefined: true }, { userId }],
  }).sort({ isPredefined: -1, createdAt: -1 });
}


export async function createTag(userId: string, input: CreateTagInput) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPro = user.subscription?.plan !== 'free' && user.subscription?.status === 'active';

  if (!isPro) {
    const customTagCount = await Tag.countDocuments({ userId, isPredefined: false });
    if (customTagCount >= 5) {
      throw new AppError(
        'Free plan limit reached (maximum 5 custom tags). Upgrade to Pro for unlimited custom tags.',
        403,
      );
    }
  }

  const existing = await Tag.findOne({
    $or: [
      { userId, name: input.name },
      { isPredefined: true, name: input.name },
    ],
  });

  if (existing) {
    throw new AppError('A tag with this name already exists', 409);
  }

  const tag = await Tag.create({
    userId,
    ...input,
    isPredefined: false,
  });

  return tag;
}


export async function updateTag(userId: string, tagId: string, input: UpdateTagInput) {
  const targetTag = await Tag.findById(tagId);
  if (!targetTag) {
    throw new AppError('Tag not found', 404);
  }

  if (targetTag.isPredefined) {
    throw new AppError('Global predefined tags cannot be modified', 403);
  }

  if (targetTag.userId?.toString() !== userId) {
    throw new AppError('Not authorized to modify this tag', 403);
  }

  if (input.name && input.name !== targetTag.name) {
    const existing = await Tag.findOne({
      _id: { $ne: tagId },
      $or: [
        { userId, name: input.name },
        { isPredefined: true, name: input.name },
      ],
    });

    if (existing) {
      throw new AppError('Another tag with this name already exists', 409);
    }
  }

  const updatedTag = await Tag.findOneAndUpdate(
    { _id: tagId, userId },
    { $set: input },
    { new: true, runValidators: true },
  );

  return updatedTag;
}


export async function deleteTag(userId: string, tagId: string) {
  const targetTag = await Tag.findById(tagId);
  if (!targetTag) {
    throw new AppError('Tag not found', 404);
  }

  if (targetTag.isPredefined) {
    throw new AppError('Global predefined tags cannot be deleted', 403);
  }

  if (targetTag.userId?.toString() !== userId) {
    throw new AppError('Not authorized to delete this tag', 403);
  }

  await Tag.deleteOne({ _id: tagId, userId });

  await Habit.updateMany({ userId }, { $pull: { tags: tagId as any } });

  return { message: 'Custom tag deleted successfully' };
}
