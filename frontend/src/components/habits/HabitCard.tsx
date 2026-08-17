import React from 'react';
import { Check, Flame, Edit2, Trash2, BookOpen, Droplet, Activity, Smile, Target, Zap, Heart, Moon, Coffee, Dumbbell } from 'lucide-react';
import type { Habit } from '../../types/index.js';

const ICON_MAP: Record<string, React.ElementType> = {
  'book-open': BookOpen,
  droplet: Droplet,
  activity: Activity,
  smile: Smile,
  target: Target,
  zap: Zap,
  heart: Heart,
  moon: Moon,
  coffee: Coffee,
  dumbbell: Dumbbell,
};

interface HabitCardProps {
  habit: Habit;
  onToggleComplete?: (habitId: string, isCompleted: boolean) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const IconComponent = ICON_MAP[habit.icon] || Target;
  const isCompleted = habit.isCompletedToday || false;

  return (
    <div
      className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Habit Icon Container */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-bold text-base truncate ${
                isCompleted ? 'line-through text-slate-500' : 'text-white'
              }`}
            >
              {habit.name}
            </h3>
            {habit.tags?.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-md border"
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}30`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="capitalize bg-slate-800/80 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
              {habit.frequency}
            </span>
            <span className="text-indigo-400 font-semibold">+20 XP</span>
            {habit.currentStreak !== undefined && habit.currentStreak > 0 && (
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <Flame className="w-3.5 h-3.5 fill-orange-400" /> {habit.currentStreak} days
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(habit)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Completion Checkbox Button */}
        {onToggleComplete && (
          <button
            onClick={() => onToggleComplete(habit.id, isCompleted)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'border-2 border-slate-700 hover:border-indigo-500 text-transparent'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
};
