'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Filter,
  User,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { StatCard } from '@/components/StatCard';
import { Loader } from '@/components/Loader';

export default function AttendancePage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canManage = isAdmin || hasPermission('attendance.manage');

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, attRes, sumRes] = await Promise.all([
        fetch('/api/staff?status=ACTIVE'),
        fetch(`/api/attendance?date=${selectedDate}`),
        fetch(`/api/attendance/summary?date=${selectedDate}`),
      ]);

      const staffData = await staffRes.json();
      const attData = await attRes.json();
      const sumData = await sumRes.json();

      if (staffData.success) setStaffList(staffData.staff || []);
      if (attData.success) setAttendanceRecords(attData.attendance || []);
      if (sumData.success) setSummary(sumData.summary);
    } catch {
      showToast('Failed to load attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAttendance = async (
    staffId: string,
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'
  ) => {
    if (!canManage) {
      showToast('You do not have permission to mark attendance.', 'error');
      return;
    }

    try {
      setActionLoading(staffId);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          date: selectedDate,
          status,
          checkIn: status === 'PRESENT' || status === 'HALF_DAY' ? '09:00' : '',
          checkOut: status === 'PRESENT' ? '18:00' : status === 'HALF_DAY' ? '13:30' : '',
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Marked ${status.toLowerCase()} for staff member.`, 'success');
        fetchData();
      } else {
        showToast(data.message || 'Failed to mark attendance', 'error');
      }
    } catch {
      showToast('Network error while marking attendance.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllPresent = async () => {
    if (!canManage) return;
    try {
      setLoading(true);
      for (const staff of staffList) {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffId: staff._id,
            date: selectedDate,
            status: 'PRESENT',
            checkIn: '09:00',
            checkOut: '18:00',
          }),
        });
      }
      showToast('All active staff marked as PRESENT for this date!', 'success');
      fetchData();
    } catch {
      showToast('Error executing bulk attendance.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Map attendance record to each staff
  const staffWithAttendance = staffList.map((s) => {
    const record = attendanceRecords.find(
      (a) => a.staffId?._id === s._id || a.staffId === s._id
    );
    return {
      ...s,
      attendanceRecord: record,
      currentStatus: record?.status || 'UNMARKED',
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff Attendance Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily attendance, leaves, half-days and integrate directly with monthly salary calculations.
          </p>
        </div>

        {/* Date Selector & Bulk Action */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-sm"
          />

          {canManage && (
            <button
              onClick={handleMarkAllPresent}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Present
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Present Today"
          value={summary?.presentToday || 0}
          subtitle={`Out of ${summary?.totalStaff || 0} active staff`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Absent Today"
          value={summary?.absentToday || 0}
          subtitle="Unexcused absences"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="On Leave"
          value={summary?.onLeaveToday || 0}
          subtitle="Approved casual/medical"
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title="Half Day"
          value={summary?.halfDayToday || 0}
          subtitle="Partial shifts (0.5 day)"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Attendance Roster
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing records for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {attendanceRecords.length} / {staffList.length} Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Staff Member</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Designation</th>
                <th className="py-4 px-6">Current Status</th>
                <th className="py-4 px-6">Check In / Out</th>
                <th className="py-4 px-6 text-right">Quick Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader size="md" text="Loading Attendance" subtitle="Syncing daily staff check-ins & shifts..." />
                  </td>
                </tr>
              ) : staffWithAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active staff members found in directory.
                  </td>
                </tr>
              ) : (
                staffWithAttendance.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{emp.fullName}</p>
                          <p className="text-xs text-slate-400">{emp.mobileNumber}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {emp.department}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {emp.designation}
                    </td>

                    <td className="py-4 px-6">
                      {emp.currentStatus === 'PRESENT' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Present
                        </span>
                      )}
                      {emp.currentStatus === 'ABSENT' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Absent
                        </span>
                      )}
                      {emp.currentStatus === 'HALF_DAY' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" /> Half Day
                        </span>
                      )}
                      {emp.currentStatus === 'LEAVE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                          <CalendarCheck className="w-3.5 h-3.5" /> On Leave
                        </span>
                      )}
                      {emp.currentStatus === 'UNMARKED' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium">
                          <HelpCircle className="w-3.5 h-3.5" /> Unmarked
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {emp.attendanceRecord?.checkIn ? (
                        <span>
                          {emp.attendanceRecord.checkIn} - {emp.attendanceRecord.checkOut || 'Active'}
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={!canManage || actionLoading === emp._id}
                          onClick={() => handleMarkAttendance(emp._id, 'PRESENT')}
                          title="Mark Present"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            emp.currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          P
                        </button>
                        <button
                          disabled={!canManage || actionLoading === emp._id}
                          onClick={() => handleMarkAttendance(emp._id, 'ABSENT')}
                          title="Mark Absent"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            emp.currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          A
                        </button>
                        <button
                          disabled={!canManage || actionLoading === emp._id}
                          onClick={() => handleMarkAttendance(emp._id, 'HALF_DAY')}
                          title="Mark Half Day"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            emp.currentStatus === 'HALF_DAY'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100'
                          }`}
                        >
                          HD
                        </button>
                        <button
                          disabled={!canManage || actionLoading === emp._id}
                          onClick={() => handleMarkAttendance(emp._id, 'LEAVE')}
                          title="Mark Leave"
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            emp.currentStatus === 'LEAVE'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          L
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
