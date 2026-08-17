export const AVATARS = [
  { id: 'avatar-01', name: 'Warrior', src: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80' },
  { id: 'avatar-02', name: 'Mage', src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { id: 'avatar-03', name: 'Rogue', src: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
  { id: 'avatar-04', name: 'Paladin', src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { id: 'avatar-05', name: 'Archer', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
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
