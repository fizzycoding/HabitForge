export const AVATARS = [
  { id: 'avatar-1', name: 'Warrior', src: '/avatar/avatar-1.png' },
  { id: 'avatar-2', name: 'Mage', src: '/avatar/avatar-2.png' },
  { id: 'avatar-3', name: 'Rogue', src: '/avatar/avatar-3.png' },
  { id: 'avatar-4', name: 'Paladin', src: '/avatar/avatar-4.png' },
  { id: 'avatar-5', name: 'Archer', src: '/avatar/avatar-5.png' },
];

export const HABIT_ICONS = [
  'book-open',
  'droplet',
  'activity',
  'smile',
  'target',
  'zap',
  'heart',
  'moon',
  'coffee',
  'dumbbell',
];

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novice Initiator',
  2: 'Apprentice',
  3: 'Habit Seeker',
  4: 'Quest Explorer',
  5: 'Consistency Knight',
  6: 'Focus Master',
  7: 'Iron Will Legend',
};

export function getLevelTitle(level: number): string {
  if (level >= 10) return 'Habit Sovereign';
  if (level >= 7) return 'Iron Will Legend';
  return LEVEL_TITLES[level] || 'Apprentice';
}
