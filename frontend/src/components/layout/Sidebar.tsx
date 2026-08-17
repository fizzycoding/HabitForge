import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  User as UserIcon,
  Award,
  Zap,
  Settings,
  Shield,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { getLevelTitle } from '../../utils/constants.js';

export const Sidebar: React.FC = () => {
  const { user, isPro } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Habits', path: '/habits', icon: CheckSquare },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: UserIcon },
    { label: 'Badges', path: '/badges', icon: Award },
    { label: 'Upgrade', path: '/upgrade', icon: Zap, isProBadge: true },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19]/90 border-r border-slate-800/80 flex flex-col justify-between p-4 select-none shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">
            HABIT<span className="text-indigo-400">FORGE</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.isProBadge && !isPro && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Mini Profile Card */}
      {user && (
        <NavLink
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                <span className="text-lg font-bold text-indigo-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            {isPro && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full">
                <Crown className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
              {user.name}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              Level {user.level || 1} • {getLevelTitle(user.level || 1)}
            </p>
          </div>
        </NavLink>
      )}
    </aside>
  );
};
