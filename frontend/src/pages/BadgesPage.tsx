import React from 'react';
import { Lock } from 'lucide-react';
import { useBadges } from '../hooks/useBadges.js';
import { getBadgeImage } from '../utils/getBadgeImage.js';

export const BadgesPage: React.FC = () => {
  const { data: badges = [], isLoading } = useBadges();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Badges</h1>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-indigo-400 font-semibold">Loading badges...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                badge.isUnlocked
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg'
                  : 'bg-slate-900/30 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
                <img
                  src={getBadgeImage(badge.name, badge.icon)}
                  alt={badge.name}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    badge.isUnlocked
                      ? 'drop-shadow-[0_0_12px_rgba(129,140,248,0.5)] hover:scale-110 hover:drop-shadow-[0_0_18px_rgba(168,85,247,0.7)]'
                      : 'grayscale opacity-40 filter'
                  }`}
                />
                {!badge.isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-1.5 rounded-full bg-slate-950/80 border border-slate-800 shadow-md">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{badge.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{badge.description}</p>
                {badge.isUnlocked && badge.unlockedAt && (
                  <span className="inline-block mt-1.5 text-[10px] font-semibold text-indigo-400">
                    Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
