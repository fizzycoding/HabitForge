import React, { useEffect, useState } from 'react';
import { Shield, Lock } from 'lucide-react';
import { Header } from '../components/layout/Header.js';
import { badgesApi } from '../api/badges.js';
import type { Badge } from '../types/index.js';

export const BadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    badgesApi.getAll().then((res) => {
      setBadges(res.badges);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <Header title="Badges & Trophies" subtitle="Unlock achievements as you forge consistency." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
              badge.isUnlocked
                ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                : 'bg-slate-900/40 border-slate-800/80 opacity-60'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                badge.isUnlocked
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-600'
              }`}
            >
              {badge.isUnlocked ? <Shield className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>

            <div>
              <h3 className="font-bold text-sm text-white">{badge.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{badge.description}</p>
              {badge.isUnlocked && badge.unlockedAt && (
                <span className="inline-block mt-2 text-[10px] font-semibold text-amber-400/80">
                  Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
