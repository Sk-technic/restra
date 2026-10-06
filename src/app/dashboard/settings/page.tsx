'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  Globe,
  Save,
  Code2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const { showToast } = useToast();

  const [restaurantName, setRestaurantName] = useState('Restra Fine Dining & Lounge');
  const [currency, setCurrency] = useState('INR (₹)');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefreshPOS, setAutoRefreshPOS] = useState(true);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary-400 font-bold text-xs uppercase tracking-wider mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage appearance, theme mode, and system preferences.
          </p>
        </div>
      </div>

      {/* Theme & Display Mode Toggle Row (Without inner cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">Theme & Display Mode</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between Dark and Light mode interface.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Restaurant Operational Preferences */}
      <form onSubmit={handleSaveGeneral} className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-foreground">Restaurant Profile & Details</h2>
          <p className="text-xs text-slate-400 mt-0.5">Configure restaurant branding and default operational formats.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary-500" />
              Restaurant / Outlet Name
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-sm text-foreground focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary-500" />
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-sm text-foreground focus:outline-none focus:border-primary-500"
            >
              <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-primary-500"
              />
              <Bell className="w-3.5 h-3.5 text-primary-500" />
              <span>Order Sound Alerts</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefreshPOS}
                onChange={(e) => setAutoRefreshPOS(e.target.checked)}
                className="w-4 h-4 rounded text-primary-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-primary-500"
              />
              <span>Auto-refresh Live POS</span>
            </label>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/25 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Global CSS Information Banner */}
      <div className="p-5 rounded-2xl bg-card border border-border flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20 shrink-0">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <h4 className="font-bold text-foreground">Global CSS Architecture</h4>
          <p>
            Har component ka style, primary theme colors, card backgrounds, aur inputs ek hi file{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-mono text-[11px] border border-slate-200 dark:border-slate-700">
              src/app/globals.css
            </code>{' '}
            se controlled hain. Agar design ya colors customize karne hon toh sirf us file me CSS variables change karne par poori website ka UI automatically update ho jata hai.
          </p>
        </div>
      </div>
    </div>
  );
}
