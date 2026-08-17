import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Shield, Flame, CheckCircle, Award, X } from 'lucide-react';
import { Header } from '../components/layout/Header.js';
import { authApi } from '../api/auth.js';
import { badgesApi } from '../api/badges.js';
import { analyticsApi } from '../api/analytics.js';
import { useAuth } from '../context/AuthContext.js';
import { AVATARS, getLevelTitle } from '../utils/constants.js';
import type { Badge, DashboardMetrics } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('avatar-01');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [badgesRes, dashRes] = await Promise.all([
        badgesApi.getAll(),
        analyticsApi.getDashboard(),
      ]);
      setBadges(badgesRes.badges);
      setMetrics(dashRes.metrics);
    } catch (_e) {}
  }, []);

  useEffect(() => {
    loadData();
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || 'avatar-01');
    }
  }, [loadData, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ name, avatar });
      await refreshUser();
      setIsEditOpen(false);
    } catch (_e) {
    } finally {
      setSaving(false);
    }
  };

  const unlockedBadges = badges.filter((b) => b.isUnlocked);

  return (
    <div>
      <Header title="Profile" subtitle="Your journey, your story." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Main Profile Stats */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center flex flex-col items-center">
          {/* Avatar Container */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 p-1 shadow-2xl shadow-indigo-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center">
                <span className="text-4xl font-extrabold text-indigo-400">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
          <p className="text-xs text-indigo-400 font-semibold mt-1">
            ⭐ {getLevelTitle(user?.level || 1)}
          </p>

          <span className="mt-3 px-4 py-1 rounded-full text-xs font-extrabold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            Level {user?.level || 1}
          </span>

          {/* XP Progress Bar */}
          <div className="w-full mt-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
              <span>{user?.progress?.xpInCurrentLevel || 0} XP</span>
              <span>{user?.progress?.xpNeededForNextLevel || 100} XP to Next Level</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${user?.progress?.progressPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 w-full mt-8 pt-6 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-white">
                {metrics?.bestStreak || 0}
              </div>
              <div className="text-[10px] font-semibold text-slate-400">Day Streak</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <CheckCircle className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-white">
                {metrics?.totalCompletions || 0}
              </div>
              <div className="text-[10px] font-semibold text-slate-400">Total Quests</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-white">
                {unlockedBadges.length}
              </div>
              <div className="text-[10px] font-semibold text-slate-400">Badges</div>
            </div>
          </div>
        </div>

        {/* Right Column: Badges & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges Grid */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Badges Showcase</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {badges.slice(0, 12).map((badge) => (
                <div
                  key={badge.id}
                  title={badge.name}
                  className={`aspect-square rounded-2xl flex items-center justify-center border transition-all ${
                    badge.isUnlocked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-700'
                  }`}
                >
                  <Shield className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Recently Unlocked */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Recently Earned</h3>
            <div className="space-y-3">
              {unlockedBadges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{badge.name}</h4>
                    <p className="text-xs text-slate-400">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Avatar Avatar Choice
                </label>
                <div className="flex gap-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                        avatar === av.id
                          ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400 scale-105'
                          : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-sm">{av.id.slice(-2)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
