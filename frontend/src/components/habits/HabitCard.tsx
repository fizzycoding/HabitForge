import React, { useState } from 'react';
import { Check, Flame, Edit2, Trash2, Loader2 } from 'lucide-react';
import { getIcon } from '../../utils/getIcon.js';
import type { Habit } from '../../types/index.js';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete?: (habitId: string, isCompleted: boolean, habitName?: string) => Promise<any> | void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const isCompleted = habit.isCompletedToday || false;
  const [loading, setLoading] = useState(false);

  const handleMarkDone = async () => {
    if (isCompleted || loading || !onToggleComplete) return;
    setLoading(true);
    try {
      await onToggleComplete(habit.id, false, habit.name);
    } catch (_e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${
        isCompleted
          ? 'bg-slate-900/40 border-slate-800/60 opacity-85'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Habit Icon Container */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
        >
          {getIcon(habit.icon, { className: 'w-6 h-6' })}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-bold text-base truncate ${
                isCompleted ? 'line-through text-slate-400' : 'text-white'
              }`}
            >
              {habit.name}
            </h3>
            {habit.tags?.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md border"
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}30`,
                  color: tag.color,
                }}
              >
                {getIcon(tag.icon || 'tag', { className: 'w-3 h-3' })}
                <span>{tag.name}</span>
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
      <div className="flex items-center gap-2 shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(habit)}
            title="Edit Habit"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(habit.id)}
            title="Delete Habit"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Action Button: "Done" with loading state & disabled completed state */}
        {onToggleComplete && (
          <div>
            {isCompleted ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-default select-none"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
              </button>
            ) : loading ? (
              <button
                disabled
                className="px-4 py-2 rounded-xl bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-wait select-none"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Marking...
              </button>
            ) : (
              <button
                onClick={handleMarkDone}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
