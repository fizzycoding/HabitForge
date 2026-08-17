import React from 'react';
import { Flame, Gem } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  bestStreak?: number;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, bestStreak = 0 }) => {
  const { user } = useAuth();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/60 mb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          {title || `Good morning, ${user?.name || 'Adventurer'}!`} ⚔️
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {subtitle || 'Ready to forge better habits today?'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Flame */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
          <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs text-orange-400/80 font-medium">Day Streak</span>
            <span className="text-sm font-bold text-orange-400">{bestStreak} Days</span>
          </div>
        </div>

        {/* Total XP Gems */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Gem className="w-5 h-5 fill-indigo-500" />
          <div className="flex flex-col">
            <span className="text-xs text-indigo-400/80 font-medium">Total XP</span>
            <span className="text-sm font-bold text-indigo-400">
              {user?.xp?.toLocaleString() || 0} XP
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
