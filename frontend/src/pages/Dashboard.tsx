import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { Header } from '../components/layout/Header.js';
import { HabitCard } from '../components/habits/HabitCard.js';
import { CreateHabitModal } from '../components/habits/CreateHabitModal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { useHabits, useHabitMutations } from '../hooks/useHabits.js';
import { useDashboardData } from '../hooks/useDashboard.js';
import { useBadges } from '../hooks/useBadges.js';
import { useAuth } from '../context/AuthContext.js';
import { getLevelTitle } from '../utils/constants.js';
import { getBadgeImage } from '../utils/getBadgeImage.js';
import { getAvatarImage } from '../utils/getAvatarImage.js';
import type { Habit } from '../types/index.js';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: habits = [] } = useHabits('all');
  const { data: badges = [] } = useBadges();
  const { data: dashData } = useDashboardData();
  const { createHabit, updateHabit, deleteHabit, toggleComplete } = useHabitMutations();

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  const metrics = dashData?.metrics;

  const handleToggleComplete = async (habitId: string, isCompleted: boolean, habitName?: string) => {
    await toggleComplete.mutateAsync({ id: habitId, isCompleted, habitName });
  };

  const handleCreateOrUpdate = async (data: any) => {
    if (editingHabit) {
      await updateHabit.mutateAsync({ id: editingHabit.id, data });
    } else {
      await createHabit.mutateAsync(data);
    }
    setEditingHabit(null);
  };

  const confirmDelete = async () => {
    if (!deletingHabitId) return;
    await deleteHabit.mutateAsync(deletingHabitId);
    setDeletingHabitId(null);
  };

  const completedCount = habits.filter((h) => h.isCompletedToday).length;

  return (
    <div>
      <Header bestStreak={metrics?.bestStreak || 0} />

      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Level Progression Card */}
        <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 shrink-0 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={getAvatarImage(user?.avatar)}
                alt={user?.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold text-white">Level {user?.level || 1}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                ⭐ {getLevelTitle(user?.level || 1)}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>{user?.progress?.xpInCurrentLevel || 0} XP</span>
                <span>{user?.progress?.xpNeededForNextLevel || 100} XP to Level {(user?.level || 1) + 1}</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/50"
                  style={{ width: `${user?.progress?.progressPercentage || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="hidden sm:flex w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl items-center justify-center shrink-0">
            <Shield className="w-10 h-10 text-indigo-400" />
          </div>
        </div>

        {/* Badges Preview Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Badges</h3>
            <NavLink
              to="/badges"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {badges.slice(0, 4).map((badge) => (
              <div
                key={badge.id}
                title={`${badge.name}: ${badge.description}`}
                className="relative aspect-square flex items-center justify-center p-1"
              >
                <img
                  src={getBadgeImage(badge.name, badge.icon)}
                  alt={badge.name}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    badge.isUnlocked
                      ? 'drop-shadow-[0_0_10px_rgba(129,140,248,0.45)] hover:scale-110 hover:drop-shadow-[0_0_16px_rgba(168,85,247,0.7)]'
                      : 'grayscale opacity-40 filter'
                  }`}
                />
                {!badge.isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-slate-950/80 border border-slate-800 shadow-sm">
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Quests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Quests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Today's Quests</h3>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-800/80 text-slate-300 rounded-full border border-slate-700">
              {completedCount} of {habits.length} completed
            </span>
          </div>

          {habits.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400">
              No active habits found. Create your first habit quest to start leveling up!
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(h) => {
                    setEditingHabit(h);
                    setIsModalOpen(true);
                  }}
                  onDelete={(id) => setDeletingHabitId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Weekly Stats Widget */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 h-fit">
          <h3 className="text-base font-bold text-white mb-2">Weekly Summary</h3>
          <p className="text-xs text-slate-400 mb-6">Track your weekly performance</p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
              <span className="text-slate-400">Completion Rate</span>
              <span className="font-bold text-emerald-400">
                {metrics?.todayCompletionRate || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
              <span className="text-slate-400">Active Streaks</span>
              <span className="font-bold text-orange-400">
                {metrics?.activeStreaksCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Total Completions</span>
              <span className="font-bold text-indigo-400">
                {metrics?.totalCompletions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Habit Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingHabit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingHabitId}
        title="Delete Habit Quest?"
        description="Are you sure you want to delete this habit quest? This action cannot be undone."
        confirmText="Delete Habit"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeletingHabitId(null)}
      />
    </div>
  );
};
