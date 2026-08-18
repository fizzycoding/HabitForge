import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { HabitCard } from '../components/habits/HabitCard.js';
import { CreateHabitModal } from '../components/habits/CreateHabitModal.js';
import { ConfirmModal } from '../components/common/ConfirmModal.js';
import { useHabits, useHabitMutations } from '../hooks/useHabits.js';
import type { Habit } from '../types/index.js';

export const HabitsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'archived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  const { data: habits = [], isLoading } = useHabits(filter);
  const { createHabit, updateHabit, deleteHabit, toggleComplete } = useHabitMutations();

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

  const handleToggleComplete = async (id: string, isCompleted: boolean, habitName?: string) => {
    await toggleComplete.mutateAsync({ id, isCompleted, habitName });
  };

  return (
    <div>
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
        {isLoading ? (
          <div className="p-8 text-center text-indigo-400 font-semibold">Loading habits...</div>
        ) : habits.length === 0 ? (
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
              onDelete={(id) => setDeletingHabitId(id)}
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

      {/* Custom Delete Confirmation Modal */}
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
