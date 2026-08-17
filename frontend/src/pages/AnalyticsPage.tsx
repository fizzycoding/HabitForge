import React, { useEffect, useState, useCallback } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Lock, Crown } from 'lucide-react';
import { analyticsApi } from '../api/analytics.js';
import { useAuth } from '../context/AuthContext.js';
import type { HeatmapDay } from '../types/index.js';

export const AnalyticsPage: React.FC = () => {
  const { isPro } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);

  const loadData = useCallback(async () => {
    try {
      const historyRes = await analyticsApi.getHistory(30);
      setHistory(historyRes.history);

      if (isPro) {
        const heatmapRes = await analyticsApi.getHeatmap();
        setHeatmap(heatmapRes.heatmap);
      }
    } catch (_e) {}
  }, [isPro]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'bg-emerald-900/60 border-emerald-800';
      case 2:
        return 'bg-emerald-700/80 border-emerald-600';
      case 3:
        return 'bg-emerald-500 border-emerald-400';
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/50';
      default:
        return 'bg-slate-900/80 border-slate-800/80';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics 📊</h1>
        <p className="text-sm text-slate-400 mt-1">Track your progress and become better every day.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Completion Rate Chart Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Completion Rate
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <h2 className="text-3xl font-extrabold text-white">78%</h2>
                <span className="text-xs font-bold text-emerald-400">▲ 12% from last month</span>
              </div>
            </div>
          </div>

          <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dateKey" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GitHub-style Activity Heatmap (Pro Feature) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">365-Day Activity Heatmap</h3>
            {!isPro && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> PRO Feature
              </span>
            )}
          </div>

          {!isPro ? (
            <div className="h-48 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center">
              <Lock className="w-8 h-8 text-amber-400 mb-2" />
              <h4 className="text-sm font-bold text-white">Heatmap Locked</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Upgrade to HabitForge Pro to unlock 365-day activity heatmaps and detailed monthly reports.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
                {heatmap.map((day, idx) => (
                  <div
                    key={idx}
                    title={`${day.date}: ${day.count} completions`}
                    className={`w-3 h-3 rounded-sm border ${getHeatmapColor(day.intensity)}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
