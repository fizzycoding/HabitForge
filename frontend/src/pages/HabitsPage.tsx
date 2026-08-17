import React, { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../components/layout/Header.js';
import { HabitCard } from '../components/habits/HabitCard.js';
import { CreateHabitModal } from '../components/habits/CreateHabitModal.js';
import { habitsApi } from '../api/habits.js';
import { useAuth } from '../context/AuthContext.js';
import type { Habit } from '../types/index.js';

export const HabitsPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      const statusParam = filter === 'archived' ? 'archived' : 'all';
      const res = await habitsApi.getAll(statusParam);
      let filtered = res.habits;
      if (filter === 'daily') filtered = res.habits.filter((h) => h.frequency === 'daily');
      if (filter === 'weekly') filtered = res.habits.filter((h) => h.frequency === 'weekly');
      setHabits(filtered);
    } catch (_e) {}
  }, [filter]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleCreateOrUpdate = async (data: any) => {
    if (editingHabit) {
      await habitsApi.update(editingHabit.id, data);
    } else {
      await habitsApi.create(data);
    }
    await loadHabits();
    await refreshUser();
    setEditingHabit(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit quest?')) return;
    await habitsApi.delete(id);
    await loadHabits();
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    if (isCompleted) {
      await habitsApi.uncomplete(id);
    } else {
      await habitsApi.complete(id);
    }
    await loadHabits();
    await refreshUser();
  };

  return (
    <div>
      <Header
        title="My Habits"
        subtitle="Build consistency, one quest at a time."
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          {(['all', 'daily', 'weekly', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Habits' : tab}
            </button>
          ))}
        </div>

        {/* Create Habit Button */}
        <button
          onClick={() => {
            setEditingHabit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Create Habit
        </button>
      </div>

      {/* Habit Cards List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400">
            No habits found under this filter.
          </div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onEdit={(h) => {
                setEditingHabit(h);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingHabit}
      />
    </div>
  );
};
