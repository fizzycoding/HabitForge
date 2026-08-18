import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Crown, X, Zap, Flame } from 'lucide-react';
import { playLevelUpSound, playBadgeSound } from '../utils/audio.js';
import { getLevelTitle } from '../utils/constants.js';
import { getBadgeImage } from '../utils/getBadgeImage.js';

interface LevelUpInfo {
  level: number;
}

interface BadgeInfo {
  name: string;
  description: string;
  icon?: string;
}

interface XpGainedInfo {
  xp: number;
  habitName?: string;
  streak?: number;
}

interface CelebrationContextType {
  triggerLevelUp: (level: number) => void;
  triggerBadgeUnlock: (badge: BadgeInfo) => void;
  triggerXpGain: (info: XpGainedInfo) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export const CelebrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [levelUpData, setLevelUpData] = useState<LevelUpInfo | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeInfo | null>(null);
  const [xpData, setXpData] = useState<XpGainedInfo | null>(null);

  const triggerLevelUp = useCallback((level: number) => {
    setLevelUpData({ level });
    playLevelUpSound();
  }, []);

  const triggerBadgeUnlock = useCallback((badge: BadgeInfo) => {
    setUnlockedBadge(badge);
    playBadgeSound();
  }, []);

  const triggerXpGain = useCallback((info: XpGainedInfo) => {
    setXpData(info);
  }, []);

  useEffect(() => {
    if (xpData) {
      const timer = setTimeout(() => {
        setXpData(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [xpData]);

  return (
    <CelebrationContext.Provider value={{ triggerLevelUp, triggerBadgeUnlock, triggerXpGain }}>
      {children}

      {/* Clean XP Gained Popup */}
      {xpData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0B0F19] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setXpData(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/10">
              <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>

            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 inline-block mb-2">
              Quest Complete!
            </span>

            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-indigo-300">
              +{xpData.xp} XP
            </h2>

            {xpData.habitName && (
              <p className="text-sm font-semibold text-slate-200 mt-2 truncate px-2">
                {xpData.habitName}
              </p>
            )}

            {xpData.streak !== undefined && xpData.streak > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-orange-400" /> {xpData.streak} Day Streak!
              </div>
            )}

            <button
              onClick={() => setXpData(null)}
              className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Clean Level Up Popup */}
      {levelUpData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 shadow-2xl text-center relative">
            <button
              onClick={() => setLevelUpData(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-7 h-7" />
            </div>

            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Level Up!
            </span>

            <h2 className="text-2xl font-bold text-white mt-1">Level {levelUpData.level}</h2>
            <p className="text-xs font-semibold text-indigo-400 mt-0.5">
              {getLevelTitle(levelUpData.level)}
            </p>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Congratulations! You reached Level {levelUpData.level}. Keep up the great streak!
            </p>

            <button
              onClick={() => setLevelUpData(null)}
              className="w-full mt-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Clean Badge Unlocked Popup */}
      {unlockedBadge && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0B0F19] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setUnlockedBadge(null)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center relative">
              <img
                src={getBadgeImage(unlockedBadge.name, unlockedBadge.icon)}
                alt={unlockedBadge.name}
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-bounce"
              />
            </div>

            <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 inline-block mb-1">
              Badge Unlocked
            </span>

            <h2 className="text-xl font-bold text-white mt-1">{unlockedBadge.name}</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{unlockedBadge.description}</p>

            <button
              onClick={() => setUnlockedBadge(null)}
              className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </CelebrationContext.Provider>
  );
};

export const useCelebration = () => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
};

