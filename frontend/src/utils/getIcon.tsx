import React from 'react';
import {
  Dumbbell,
  Flame,
  BookOpen,
  HeartPulse,
  Target,
  Brain,
  Droplet,
  Coffee,
  Moon,
  Sun,
  Smile,
  Trophy,
  Zap,
  Music,
  Code,
  Palette,
  DollarSign,
  Compass,
  Footprints,
  Utensils,
  Bike,
  Sparkles,
  ShieldCheck,
  AlarmClock,
  CheckCircle2,
  Star,
  Award,
  PenTool,
  Lightbulb,
  Globe,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export interface IconOption {
  name: string;
  label: string;
  category: 'fitness' | 'mindset' | 'productivity' | 'lifestyle' | 'creative';
  Icon: React.ComponentType<LucideProps>;
}

export const AVAILABLE_ICONS: IconOption[] = [
  // Fitness & Health
  { name: 'dumbbell', label: 'Workout / Gym', category: 'fitness', Icon: Dumbbell },
  { name: 'heart-pulse', label: 'Health / Cardio', category: 'fitness', Icon: HeartPulse },
  { name: 'footprints', label: 'Walking / Steps', category: 'fitness', Icon: Footprints },
  { name: 'bike', label: 'Cycling', category: 'fitness', Icon: Bike },
  { name: 'droplet', label: 'Water / Hydration', category: 'fitness', Icon: Droplet },
  { name: 'utensils', label: 'Healthy Eating', category: 'fitness', Icon: Utensils },

  // Mindset & Wellness
  { name: 'brain', label: 'Meditation / Focus', category: 'mindset', Icon: Brain },
  { name: 'moon', label: 'Sleep / Rest', category: 'mindset', Icon: Moon },
  { name: 'sun', label: 'Morning Routine', category: 'mindset', Icon: Sun },
  { name: 'smile', label: 'Mood / Journaling', category: 'mindset', Icon: Smile },
  { name: 'flame', label: 'Streak / Motivation', category: 'mindset', Icon: Flame },
  { name: 'sparkles', label: 'Self Care', category: 'mindset', Icon: Sparkles },

  // Learning & Knowledge
  { name: 'book-open', label: 'Reading', category: 'lifestyle', Icon: BookOpen },
  { name: 'code', label: 'Coding / Tech', category: 'lifestyle', Icon: Code },
  { name: 'lightbulb', label: 'Learning / Ideas', category: 'lifestyle', Icon: Lightbulb },
  { name: 'globe', label: 'Language / World', category: 'lifestyle', Icon: Globe },
  { name: 'pen-tool', label: 'Writing', category: 'creative', Icon: PenTool },
  { name: 'palette', label: 'Art / Creativity', category: 'creative', Icon: Palette },
  { name: 'music', label: 'Music / Instruments', category: 'creative', Icon: Music },

  // Productivity & Work
  { name: 'target', label: 'Focus Goal', category: 'productivity', Icon: Target },
  { name: 'zap', label: 'Energy / Power', category: 'productivity', Icon: Zap },
  { name: 'alarm-clock', label: 'Waking Up Early', category: 'productivity', Icon: AlarmClock },
  { name: 'check-circle', label: 'Tasks Completed', category: 'productivity', Icon: CheckCircle2 },
  { name: 'dollar-sign', label: 'Finance / Savings', category: 'productivity', Icon: DollarSign },

  // Rewards & Achievements
  { name: 'trophy', label: 'Trophy', category: 'lifestyle', Icon: Trophy },
  { name: 'award', label: 'Award', category: 'lifestyle', Icon: Award },
  { name: 'star', label: 'Star', category: 'lifestyle', Icon: Star },
  { name: 'shield', label: 'Discipline', category: 'lifestyle', Icon: ShieldCheck },
  { name: 'compass', label: 'Exploration', category: 'lifestyle', Icon: Compass },
  { name: 'coffee', label: 'Break / Tea', category: 'lifestyle', Icon: Coffee },
];

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = AVAILABLE_ICONS.reduce(
  (acc, item) => {
    acc[item.name] = item.Icon;
    return acc;
  },
  {} as Record<string, React.ComponentType<LucideProps>>,
);

export function getIcon(iconName: string, props: LucideProps = {}): React.ReactElement {
  const IconComponent = ICON_MAP[iconName.toLowerCase()] || Target;
  return <IconComponent {...props} />;
}
