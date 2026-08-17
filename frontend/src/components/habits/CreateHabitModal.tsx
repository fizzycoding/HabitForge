import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Check } from 'lucide-react';
import { tagsApi } from '../../api/tags.js';
import { AVAILABLE_ICONS, getIcon } from '../../utils/getIcon.js';
import type { Habit, Tag } from '../../types/index.js';

const COLORS = [
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#EF4444', name: 'Rose' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#06B6D4', name: 'Cyan' },
];

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Habit | null;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('target');
  const [color, setColor] = useState('#6366F1');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      tagsApi.getAll().then((res) => setTags(res.tags)).catch(() => {});
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setIcon(initialData.icon || 'target');
        setColor(initialData.color || '#6366F1');
        setFrequency(initialData.frequency);
        setSelectedTagIds(initialData.tags?.map((t) => t.id) || []);
      } else {
        setName('');
        setDescription('');
        setIcon('target');
        setColor('#6366F1');
        setFrequency('daily');
        setSelectedTagIds([]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        name,
        description,
        icon,
        color,
        frequency,
        tags: selectedTagIds,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-3xl p-6 md:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Live Preview */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 shrink-0"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                boxShadow: `0 8px 20px -6px ${color}40`,
              }}
            >
              {getIcon(icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {initialData ? 'Edit Habit Quest' : 'Create New Habit Quest'}
              </h2>
              <p className="text-xs text-slate-400">Set your goal and customize your quest style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#070A12] border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 overflow-y-auto px-1 flex-1">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Habit Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Meditation, Read 30 mins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#070A12] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-medium transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 20 pages before sleep every day"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#070A12] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm font-medium transition-colors"
            />
          </div>

          {/* Theme Accent Color */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Theme Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-3.5 p-1.5 overflow-visible">
              {COLORS.map(({ hex, name: colorName }) => (
                <button
                  key={hex}
                  type="button"
                  title={colorName}
                  onClick={() => setColor(hex)}
                  className={`w-9 h-9 rounded-full transition-all relative flex items-center justify-center shrink-0 ${
                    color === hex
                      ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#0F172A] ring-white shadow-lg'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color === hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Habit Icon
              </label>
            </div>

            <div className="grid grid-cols-6 gap-2 bg-[#070A12] p-3 rounded-2xl border border-slate-800/80">
              {AVAILABLE_ICONS.map(({ name: iconKey, label: iconLabel, Icon: IconComponent }) => {
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    title={iconLabel}
                    onClick={() => setIcon(iconKey)}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400'
                        : 'bg-[#0F172A] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Associated Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-indigo-400" /> Associated Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => {
                  const isSelected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-[#070A12] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Frequency & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 shrink-0">
            <div className="flex bg-[#070A12] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  frequency === 'daily'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  frequency === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Quest' : 'Create Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
