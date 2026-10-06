'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, ShieldCheck, UserCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      showToast(res.message || 'Login failed. Invalid credentials.', 'error');
    } else {
      showToast('Welcome back to Restra Suite!', 'success');
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  const handleSeedFirst = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Demo records & accounts created successfully! Click on demo login buttons.', 'success');
      } else {
        showToast(data.message || 'Seed failed', 'error');
      }
    } catch {
      showToast('Failed to auto-seed database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow matching reference image */}
      <div className="absolute top-1/3 -left-20 w-[450px] h-[450px] bg-pink-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-indigo-600/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-sky-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-amber-500 text-white shadow-xl shadow-primary-600/30 mb-4">
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Restra Suite</h2>
            <p className="text-xs text-slate-400 mt-1">
              Restaurant Operations & Staff Management Portal
            </p>
          </div>

          {/* Quick Demo Logins Selection */}
          <div className="mb-6 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Demo Accounts
              </span>
              <button
                type="button"
                onClick={handleSeedFirst}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-Seed DB
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@restra.com', 'admin123')}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">admin@restra.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@restra.com', 'manager123')}
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" /> Manager
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">manager@restra.com</p>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restra.com"
                  required
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-500 hover:to-amber-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 animate-restra-utensils" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Role-Based Access Control (RBAC) & Next.js App Router Architecture
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
