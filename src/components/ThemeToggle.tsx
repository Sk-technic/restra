'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className = '', showLabels = false }: ThemeToggleProps) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center h-9 p-1 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:scale-95 select-none ${
        isDark
          ? 'bg-slate-800/90 border border-slate-700/80 shadow-inner shadow-black/40 hover:border-slate-600'
          : 'bg-slate-100/90 border border-slate-300/60 shadow-inner shadow-slate-200/50 hover:border-zinc-400/60'
      } ${showLabels ? 'w-48 px-2 justify-between' : 'w-16 justify-between'} ${className}`}
    >
      {/* Sliding Active Indicator Pill */}
      <span
        className={`absolute top-1 bottom-1 w-7 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-spring z-20 ${
          isDark
            ? 'left-1 translate-x-7 bg-slate-900 border border-slate-700 text-indigo-400 shadow-black/60 ring-1 ring-indigo-500/20'
            : 'left-1 translate-x-0 bg-white border border-yellow-300/10 text-yellow-500 shadow-yellow-500/20 ring-1 ring-yellow-400/30'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-indigo-400/20 text-indigo-400 rotate-0 transition-transform duration-300 scale-100 animate-fade-in" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-yellow-500/20 text-amber-500 rotate-0 transition-transform duration-300 scale-100 animate-fade-in" />
        )}
      </span>

      {/* Sun Track Slot */}
      <span
        className={`z-10 w-7 flex items-center justify-center transition-all duration-200 ${
          !isDark ? 'opacity-0 scale-75' : 'opacity-60 text-slate-400 hover:opacity-100 hover:text-amber-400 scale-100'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </span>

      {/* Moon Track Slot */}
      <span
        className={`z-10 w-7 flex items-center justify-center transition-all duration-200 ${
          isDark ? 'opacity-0 scale-75' : 'opacity-60 text-amber-700/60 hover:opacity-100 hover:text-slate-700 scale-100'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </span>

      {showLabels && (
        <span className={`text-xs font-bold px-2 select-none transition-colors duration-200 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
