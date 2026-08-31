import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  User as UserIcon,
  Award,
  Zap,
  Settings,
  Crown,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { getLevelTitle } from '../../utils/constants.js';
import { getAvatarImage } from '../../utils/getAvatarImage.js';

export const Sidebar: React.FC = () => {
  const { user, isPro, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Habits', path: '/habits', icon: CheckSquare },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: UserIcon },
    { label: 'Badges', path: '/badges', icon: Award },
    { label: 'Upgrade', path: '/upgrade', icon: Zap, isProBadge: true },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Primary bottom navigation items for mobile
  const mobileBottomItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Habits', path: '/habits', icon: CheckSquare },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Badges', path: '/badges', icon: Award },
    { label: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <>
      {/* ================= DESKTOP SIDEBAR (md and up) ================= */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-[#0B0F19]/90 border-r border-slate-800/80 flex-col justify-between p-4 select-none shrink-0 overflow-y-auto z-40">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <img src="/logo.png" alt="HabitForge Logo" className="w-9 h-9 object-contain drop-shadow" />
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
            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all group mt-4"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    src={getAvatarImage(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-[10px]"
                  />
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

      {/* ================= MOBILE TOP HEADER (mobile only) ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HabitForge Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-lg tracking-wider text-white">
            HABIT<span className="text-indigo-400">FORGE</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              <span>Lvl {user.level || 1}</span>
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#0F172A] h-full flex flex-col justify-between p-5 border-r border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="HabitForge" className="w-8 h-8 object-contain" />
                  <span className="font-extrabold text-lg text-white">
                    HABIT<span className="text-indigo-400">FORGE</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white'
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

            {user && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarImage(user.avatar)}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      Lvl {user.level || 1} • {getLevelTitle(user.level || 1)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
