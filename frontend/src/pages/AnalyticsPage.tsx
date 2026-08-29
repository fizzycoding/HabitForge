import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Flame,
  CheckCircle2,
  Zap,
  Calendar,
  BarChart3,
  TrendingUp,
  Sparkles,
  Award,
  Target,
  ArrowUpRight,
  Layers,
  Activity,
} from 'lucide-react';
import { useAnalyticsData } from '../hooks/useAnalytics.js';
import type { HeatmapDay } from '../types/index.js';

export const AnalyticsPage: React.FC = () => {
  // Filter state
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [chartMetric, setChartMetric] = useState<'rate' | 'count'>('rate');

  // TanStack React Query Caching & Automatic Revalidation
  const {
    metrics,
    history,
    heatmap,
    monthlyChart,
  } = useAnalyticsData(timeRange);

  // Ensure full 365-day array for heatmap rendering
  const fullHeatmap = useMemo(() => {
    if (heatmap && heatmap.length >= 300) {
      return heatmap;
    }
    // Fallback generator for 365 days
    const countMap = new Map<string, number>();
    if (heatmap) {
      heatmap.forEach((h) => countMap.set(h.date, h.count));
    }
    const days: HeatmapDay[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const count = countMap.get(dateStr) || 0;
      let intensity = 0;
      if (count > 0 && count <= 2) intensity = 1;
      else if (count >= 3 && count <= 4) intensity = 2;
      else if (count >= 5 && count <= 6) intensity = 3;
      else if (count >= 7) intensity = 4;

      days.push({
        date: dateStr,
        count,
        intensity,
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [heatmap]);

  // Group fullHeatmap into 53 week columns
  const weeks = useMemo(() => {
    const cols: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    fullHeatmap.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || currentWeek.length === 7) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      cols.push(currentWeek);
    }
    return cols;
  }, [fullHeatmap]);

  // Compute exact column index for each month label
  const colMonthLabels = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = new Map<number, string>();
    let lastMonth = -1;

    weeks.forEach((week, colIdx) => {
      for (const day of week) {
        const d = new Date(day.date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          map.set(colIdx, monthNames[m]);
          lastMonth = m;
          break;
        }
      }
    });

    return map;
  }, [weeks]);

  // Derived metrics
  const avgCompletionRate = useMemo(() => {
    if (!history.length) return 0;
    const sum = history.reduce((acc: number, item: any) => acc + (item.completionRate || 0), 0);
    return Math.round(sum / history.length);
  }, [history]);

  const totalCompletionsInRange = useMemo(() => {
    if (!history.length) return 0;
    return history.reduce((acc: number, item: any) => acc + (item.completedCount || 0), 0);
  }, [history]);

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'bg-emerald-950/90 border-emerald-800/80 shadow-[0_0_6px_rgba(16,185,129,0.2)]';
      case 2:
        return 'bg-emerald-700 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
      case 3:
        return 'bg-emerald-500 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)]';
      case 4:
        return 'bg-emerald-300 border-white shadow-[0_0_18px_rgba(52,211,153,0.9)] scale-105';
      default:
        return 'bg-slate-950 border-slate-800/70 hover:border-slate-700';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics</h1>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Completion Rate */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {timeRange}-Day Consistency
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {avgCompletionRate}%
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5" /> High Score
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-4">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, avgCompletionRate)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Completions */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Quests Completed
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {metrics?.totalCompletions || 0}
            </h3>
            <span className="text-xs font-semibold text-purple-300">
              +{totalCompletionsInRange} in last {timeRange}d
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Today: {metrics?.todayCompletionsCount || 0} finished</span>
          </div>
        </div>

        {/* Card 3: Active & Best Streak */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Streak Record
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-inner">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {metrics?.bestStreak || 0} <span className="text-sm font-normal text-slate-400">Days</span>
            </h3>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
              🔥 Best
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
            <Activity className="w-4 h-4 text-orange-400" />
            <span>{metrics?.activeStreaksCount || 0} active streaks burning</span>
          </div>
        </div>

        {/* Card 4: Active Habits */}
        <div className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Habits
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {metrics?.totalActiveHabits || 0}
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              Active Quests
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{metrics?.unlockedBadgesCount || 0} Badges Earned</span>
          </div>
        </div>
      </div>

      {/* Main Section: Interactive Completion History Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" /> Habit Consistency History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualize your daily completion rate and quest output trends over time
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Metric Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setChartMetric('rate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartMetric === 'rate'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completion Rate (%)
              </button>
              <button
                onClick={() => setChartMetric('count')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartMetric === 'count'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Quests Count
              </button>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setTimeRange(7)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === 7
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange(30)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === 30
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange(90)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeRange === 90
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(str) => {
                  if (!str) return '';
                  const d = new Date(str);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs">
                        <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {data.date}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Completion Rate:</span>
                            <span className="font-extrabold text-indigo-400">
                              {data.completionRate}%
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-slate-300">
                            <span>Completed Quests:</span>
                            <span className="font-extrabold text-purple-400">
                              {data.completedCount} / {data.totalActiveHabits || metrics?.totalActiveHabits}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {chartMetric === 'rate' ? (
                <Area
                  type="monotone"
                  dataKey="completionRate"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="completedCount"
                  stroke="#A855F7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GitHub-style 365-Day Activity Heatmap */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> 365-Day Activity Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your annual consistency matrix mapped day by day
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Less</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-950 border border-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-950 border border-emerald-800" />
              <div className="w-3 h-3 rounded-sm bg-emerald-700 border border-emerald-500" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400" />
              <div className="w-3 h-3 rounded-sm bg-emerald-300 border border-white shadow-sm" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid with Month & Day Labels */}
        <div className="overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="min-w-max">
            {/* Dynamic Month Labels Header Line */}
            <div className="h-5 relative mb-1 select-none">
              {weeks.map((_, colIdx) => {
                const monthName = colMonthLabels.get(colIdx);
                return monthName ? (
                  <span
                    key={colIdx}
                    className="absolute text-[11px] font-bold text-slate-400 whitespace-nowrap"
                    style={{ left: `${32 + colIdx * 18}px` }}
                  >
                    {monthName}
                  </span>
                ) : null;
              })}
            </div>

            {/* Grid Container (Left Day Labels + 365 Tiles Grid) */}
            <div className="flex gap-2">
              {/* Day Labels Column (Mon, Wed, Fri like GitHub) */}
              <div className="grid grid-rows-7 text-[10px] font-bold text-slate-500 justify-between h-[122px] py-[1px] select-none shrink-0 pr-1">
                <span className="h-3.5 leading-none opacity-0">Sun</span>
                <span className="h-3.5 leading-none">Mon</span>
                <span className="h-3.5 leading-none opacity-0">Tue</span>
                <span className="h-3.5 leading-none">Wed</span>
                <span className="h-3.5 leading-none opacity-0">Thu</span>
                <span className="h-3.5 leading-none">Fri</span>
                <span className="h-3.5 leading-none opacity-0">Sat</span>
              </div>

              {/* 365 Tiles Grid */}
              <div className="grid grid-rows-7 grid-flow-col gap-1">
                {fullHeatmap.map((day, idx) => (
                  <div
                    key={idx}
                    title={`${day.date}: ${day.count} completion(s)`}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 hover:z-20 cursor-pointer ${getHeatmapColor(
                      day.intensity,
                    )}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Performance Velocity */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" /> 12-Month Completion Velocity
          </h2>
        </div>

        {monthlyChart.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 border border-slate-800 rounded-2xl">
            No monthly data accrued yet. Keep completing habit quests!
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
                          <div className="font-bold text-white mb-1">{data.label}</div>
                          <div className="text-indigo-400 font-extrabold">
                            Total Completions: {data.totalCompletions}
                          </div>
                          <div className="text-slate-400">
                            Target Rate: {data.completionRate}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalCompletions" radius={[6, 6, 0, 0]}>
                  {monthlyChart.map((_entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === monthlyChart.length - 1 ? '#A855F7' : '#6366F1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

