import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Trash2, Key, LogOut, Loader2 } from 'lucide-react';
import { tagsApi } from '../api/tags.js';
import { authApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.js';
import { AVAILABLE_ICONS, getIcon } from '../utils/getIcon.js';
import type { Tag } from '../types/index.js';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');
  const [tagIcon, setTagIcon] = useState('tag');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);

  const loadTags = async () => {
    try {
      const res = await tagsApi.getAll();
      setTags(res.tags);
    } catch (_e) {}
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim() || tagLoading) return;
    setTagLoading(true);
    setTagError(null);
    try {
      await tagsApi.create({ name: tagName.trim(), color: tagColor, icon: tagIcon });
      setTagName('');
      setShowIconPicker(false);
      await loadTags();
    } catch (err: any) {
      setTagError(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setTagLoading(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await tagsApi.delete(id);
      await loadTags();
    } catch (err: any) {
      setTagError(err.response?.data?.message || 'Cannot delete global tag');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings</h1>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Custom Tag Management Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Custom Tag Manager</h2>
          </div>

          {tagError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {tagError}
            </div>
          )}

          <form onSubmit={handleCreateTag} className="space-y-3 mb-6">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Tag Name (e.g. Work, Fitness, Code)"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                disabled={tagLoading}
                className="flex-1 min-w-[180px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
              />

              {/* Tag Color Picker */}
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-slate-400 font-semibold">Color:</span>
                <input
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  disabled={tagLoading}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Tag Icon Selector Toggle */}
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                disabled={tagLoading}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-50"
              >
                {getIcon(tagIcon, { className: 'w-4 h-4 text-indigo-400' })}
                <span>Icon: {tagIcon}</span>
              </button>

              <button
                type="submit"
                disabled={tagLoading || !tagName.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tagLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{tagLoading ? 'Adding...' : 'Add Tag'}</span>
              </button>
            </div>

            {/* Collapsible Quick Icon Selection Grid */}
            {showIconPicker && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-8 gap-2">
                {AVAILABLE_ICONS.slice(0, 16).map(({ name: iconKey, Icon }) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => {
                      setTagIcon(iconKey);
                      setShowIconPicker(false);
                    }}
                    className={`h-9 rounded-xl flex items-center justify-center border transition-all ${
                      tagIcon === iconKey
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* List of Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border"
                style={{
                  backgroundColor: `${tag.color}15`,
                  borderColor: `${tag.color}30`,
                  color: tag.color,
                }}
              >
                {getIcon(tag.icon || 'tag', { className: 'w-3.5 h-3.5' })}
                <span>{tag.name}</span>
                {tag.isPredefined ? (
                  <span className="text-[9px] opacity-60 uppercase">(Global)</span>
                ) : (
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="hover:opacity-100 opacity-60 ml-1"
                    title="Delete Custom Tag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Security & Password</h2>
          </div>

          {passMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm border ${
                passMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-bold text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
