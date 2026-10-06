'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Sparkles, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, isAdmin, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [seeding, setSeeding] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
  }, []);

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Database seeded with demo records successfully!', 'success');
        await refreshUser();
        window.location.reload();
      } else {
        showToast(data.message || 'Seeding failed.', 'error');
      }
    } catch {
      showToast('Failed to seed database.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="bg-transparent flex justify-between items-center w-full top-0 pb-2">
      {/* Left section: Hamburger on mobile (heading removed as requested) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right section: Quick Actions & User Badge */}
      <div className="flex items-start justify-center bg-transparent gap-2">
        {isAdmin && (
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            title="Reset or populate demo sample data"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold transition-colors"
          >
            {seeding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{seeding ? 'Seeding...' : 'Quick Demo Seed'}</span>
          </button>
        )}

        {/* User Profile Section (Image Circle + Name & Role) */}
        <div className="flex w-fit bg-transparent backdrop-blur-lg items-start justify-center gap-1 p-1 border rounded-full border-slate-200 dark:border-slate-800 shadow-md border-slate-300/50">
          {/* Profile Image Circle */}
          <div className=" w-10 h-10 border rounded-full ring-2 ring-primary-500/20 bg-gradient-to-tr from-primary-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 overflow-hidden">
            <img
              src={user?.avatar || '/images/staff/admin-avatar.jpg'}
              alt={user?.name || 'User Profile'}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('unsplash')) {
                  target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                }
              }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-right pr-5">
            <p className="text-[12px] font-light text-slate-700 dark:text-white leading-tight">
              {user?.name || 'System Administrator'}
            </p>
            <div className="flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {isAdmin ? (
                <span className="text-amber-500 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Admin
                </span>
              ) : (
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <User className="w-3 h-3" /> {user?.roleDetails?.name || 'Manager'}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
