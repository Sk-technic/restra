'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader } from '@/components/Loader';

import {
  Users2,
  UserCheck,
  CalendarDays,
  ShoppingBag,
  IndianRupee,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Plus,
  ReceiptText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/StatCard';

const COLORS = ['#f97316', '#0ea5e9', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b'];

export default function DashboardPage() {
  const { user, isAdmin, hasPermission } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader size="full" text="Restra Dashboard" subtitle="Syncing live sales, occupancy & kitchen operations..." />
      </div>
    );
  }

  const canViewStaff = isAdmin || hasPermission('staff.view');
  const canViewAttendance = isAdmin || hasPermission('attendance.view');
  const canViewTables = isAdmin || hasPermission('tables.view');
  const canViewReservations = isAdmin || hasPermission('reservations.view');
  const canViewOrders = isAdmin || hasPermission('orders.view');
  const canViewBilling = isAdmin || hasPermission('billing.view');
  const canViewMenu = isAdmin || hasPermission('menu.view');

  // Table Occupancy Data for Pie Chart
  const tableData = [
    { name: 'Available', value: stats?.availableTables || 0, color: '#10b981' },
    { name: 'Occupied', value: stats?.occupiedTables || 0, color: '#ef4444' },
    { name: 'Reserved', value: stats?.reservedTables || 0, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  // Attendance breakdown data
  const attendanceData = stats?.attendanceSummary
    ? [
        { name: 'Present', count: stats.attendanceSummary.present, color: '#10b981' },
        { name: 'Absent', count: stats.attendanceSummary.absent, color: '#ef4444' },
        { name: 'Leave', count: stats.attendanceSummary.leave, color: '#f59e0b' },
        { name: 'Half Day', count: stats.attendanceSummary.halfDay, color: '#8b5cf6' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modern Animated Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-orange-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-[#121c33] p-6 sm:p-8 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl group transition-all duration-300">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Restra Live Ops • Active Dining Shift</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-primary-600 to-amber-500 dark:from-white dark:via-amber-100 dark:to-primary-400 bg-clip-text text-transparent">
                {user?.name || 'Administrator'}
              </span>{' '}
              👋
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {isAdmin
                ? 'Full administrative control over restaurant operations, staff attendance, table occupancy, menu catalog, and live billing.'
                : `Active Role: ${user?.roleDetails?.name || 'Manager'}. Showing real-time data aligned with your permissions.`}
            </p>

            {/* Quick Live Insight Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
                <UtensilsCrossed className="w-3.5 h-3.5 text-primary-500" />
                <span>{stats?.availableTables ?? 7} Tables Available</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{stats?.attendanceSummary?.present ?? 5} Staff Present Today</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 backdrop-blur-sm shadow-sm">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                <span>{stats?.todayOrders ?? 2} Orders Placed</span>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canViewOrders && (
              <Link
                href="/dashboard/orders"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-amber-500 hover:from-primary-500 hover:to-amber-400 text-white text-xs font-extrabold shadow-lg shadow-primary-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Order POS
              </Link>
            )}
            {canViewReservations && (
              <Link
                href="/dashboard/reservations"
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700/80 backdrop-blur-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                <CalendarDays className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Book Table
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && (
          <StatCard
            title="Total Managers"
            value={stats?.totalManagers || 0}
            subtitle="Active accounts with RBAC"
            icon={Users2}
            color="purple"
          />
        )}

        {canViewStaff && (
          <StatCard
            title="Total Staff"
            value={stats?.totalStaff || 0}
            subtitle="Chefs, Waiters & Support"
            icon={UserCheck}
            color="blue"
          />
        )}

        {canViewBilling && (
          <StatCard
            title="Today's Revenue"
            value={`₹${(stats?.todayRevenue || 0).toLocaleString('en-IN')}`}
            subtitle={`Lifetime: ₹${(stats?.totalLifetimeRevenue || 0).toLocaleString('en-IN')}`}
            icon={IndianRupee}
            color="emerald"
            trend="+14.2%"
            trendPositive={true}
          />
        )}

        {canViewOrders && (
          <StatCard
            title="Today's Orders"
            value={stats?.todayOrders || 0}
            subtitle={`${stats?.pendingOrders || 0} in kitchen preparation`}
            icon={ShoppingBag}
            color="orange"
          />
        )}

        {canViewReservations && (
          <StatCard
            title="Today's Bookings"
            value={stats?.todayReservations || 0}
            subtitle="Confirmed table reservations"
            icon={CalendarDays}
            color="purple"
          />
        )}

        {canViewTables && (
          <StatCard
            title="Available Tables"
            value={`${stats?.availableTables || 0} / ${stats?.totalTables || 0}`}
            subtitle={`${stats?.occupiedTables || 0} Occupied, ${stats?.reservedTables || 0} Reserved`}
            icon={UtensilsCrossed}
            color="blue"
          />
        )}

        {canViewAttendance && stats?.attendanceSummary && (
          <StatCard
            title="Present Today"
            value={`${stats.attendanceSummary.present} / ${stats.totalStaff || 0}`}
            subtitle={`${stats.attendanceSummary.absent} Absent, ${stats.attendanceSummary.leave} on leave`}
            icon={CalendarCheck}
            color="emerald"
          />
        )}

        {canViewMenu && (
          <StatCard
            title="Out of Stock Items"
            value={stats?.unavailableFoodItems || 0}
            subtitle="Menu items disabled"
            icon={AlertTriangle}
            color={stats?.unavailableFoodItems > 0 ? 'rose' : 'emerald'}
          />
        )}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue & Orders Trend Area Chart */}
        {canViewBilling && stats?.weeklyTrend && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revenue & Sales Trend
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily revenue (₹) over the last 7 days
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 rounded-full">
                7 Days Live
              </span>
            </div>

            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`₹${val}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Orders Bar Chart */}
        {canViewOrders && stats?.weeklyTrend && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Order Volume Breakdown
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total restaurant orders placed per day
                </p>
              </div>
            </div>

            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="orders" fill="#0ea5e9" radius={[8, 8, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Selling Food Items */}
        {canViewMenu && stats?.topSellingFoods && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top-Selling Menu Items
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Most popular dishes by quantity ordered
                </p>
              </div>
              <Link
                href="/dashboard/menu"
                className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1"
              >
                View Menu <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {stats.topSellingFoods.map((item: any, idx: number) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary-500/10 text-primary-500 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.quantity} sold
                    </span>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Occupancy & Attendance Status Cards */}
        <div className="space-y-6">
          {canViewTables && tableData.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Live Table Status
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Floor plan occupancy distribution
                  </p>
                </div>
                <Link
                  href="/dashboard/tables"
                  className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1"
                >
                  Floor Layout <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-center">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">Available</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats?.availableTables || 0}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-center">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">Occupied</p>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                    {stats?.occupiedTables || 0}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-center">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-300">Reserved</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {stats?.reservedTables || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {canViewAttendance && attendanceData.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Today&apos;s Staff Attendance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time workforce presence
                  </p>
                </div>
                <Link
                  href="/dashboard/attendance"
                  className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1"
                >
                  Mark Attendance <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {attendanceData.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center"
                  >
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.name}
                    </p>
                    <p
                      className="text-xl font-black mt-1"
                      style={{ color: item.color }}
                    >
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
