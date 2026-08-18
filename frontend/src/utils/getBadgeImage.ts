const BADGE_IMAGE_MAP: Record<string, string> = {
  // Habit Creation Badges
  'habit starter': '/badges/habit_starter_badge.png',
  'habit builder': '/badges/habit_builder_badge.png',
  'habit architect': '/badges/habit_architect_badge.png',
  'habit mastermind': '/badges/habit_mastermind_badge.png',

  // Habit Completion Badges
  'first step': '/badges/first_step_badge.png',
  'getting started': '/badges/getting_started_badge.png',
  'double digits': '/badges/double_badge.png',
  'quarter century': '/badges/quater_century_badge.png',
  'half century': '/badges/half_century_badge.png',
  'century club': '/badges/century_club_badge.png',

  // Streak Badges
  'on fire': '/badges/on_fire_badge.png',
  'weekly warrior': '/badges/weekly_warrior_badge.png',
  'fortnight fighter': '/badges/fortnight_fighter_badge.png',
  'monthly legend': '/badges/monthly_legend_badge.png',
  'unstoppable': '/badges/unstoppable_badge.png',

  // Level Badges
  'novice explorer': '/badges/novice_explorer_badge.png',
  'rising star': '/badges/raising_star_badge.png',
  'forge veteran': '/badges/forge_veteran_badge.png',
  'grandmaster': '/badges/grandmaster_badge.png',
};

export function getBadgeImage(badgeName?: string, icon?: string): string {
  if (badgeName) {
    const key = badgeName.trim().toLowerCase();
    if (BADGE_IMAGE_MAP[key]) {
      return BADGE_IMAGE_MAP[key];
    }
  }

  if (icon) {
    if (icon.startsWith('/') || icon.startsWith('http')) {
      return icon;
    }
    const iconKey = icon.toLowerCase().replace(/_badge$/, '').replace(/_/g, ' ');
    if (BADGE_IMAGE_MAP[iconKey]) {
      return BADGE_IMAGE_MAP[iconKey];
    }
  }

  return '/badges/first_step_badge.png';
}
