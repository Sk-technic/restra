'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CircleDollarSign,
  Calculator,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  IndianRupee,
  Calendar,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { StatCard } from '@/components/StatCard';
import { Modal } from '@/components/Modal';
import { Loader } from '@/components/Loader';

export default function SalaryPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canManage = isAdmin || hasPermission('salary.manage');

  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Edit / Pay modal
  const [selectedSalary, setSelectedSalary] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bonus, setBonus] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PAID');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSalaries = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/salary?month=${month}&year=${year}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSalaries(data.salaries || []);
      }
    } catch {
      showToast('Failed to load salary calculations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [month, year, statusFilter, showToast]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleGenerateSalaries = async () => {
    if (!canManage) return;
    try {
      setGenerating(true);
      const res = await fetch('/api/salary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Salaries calculated from attendance records!', 'success');
        fetchSalaries();
      } else {
        showToast(data.message || 'Calculation failed', 'error');
      }
    } catch {
      showToast('Error during salary calculation.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenEdit = (s: any) => {
    setSelectedSalary(s);
    setBonus(s.bonus || 0);
    setDeduction(s.deduction || 0);
    setPaymentStatus(s.paymentStatus || 'PENDING');
    setNotes(s.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/salary/${selectedSalary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bonus,
          deduction,
          paymentStatus,
          notes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Salary record updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchSalaries();
      } else {
        showToast(data.message || 'Failed to update salary.', 'error');
      }
    } catch {
      showToast('Network error while updating salary.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0);
  const paidPayroll = salaries
    .filter((s) => s.paymentStatus === 'PAID')
    .reduce((sum, s) => sum + s.netSalary, 0);
  const pendingPayroll = totalPayroll - paidPayroll;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Staff Payroll & Salary Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated salary computation based on real-time attendance, overtime bonuses, and deductions.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleGenerateSalaries}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <Calculator className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{generating ? 'Calculating Attendance...' : 'Auto-Generate Monthly Payroll'}</span>
          </button>
        )}
      </div>

      {/* Month / Year Filters & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((mName, idx) => (
              <option key={mName} value={idx + 1}>
                {mName} ({idx + 1})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING">Pending Approval / Unpaid</option>
            <option value="PAID">Disbursed / Paid</option>
          </select>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-semibold">
          <span className="text-slate-500">Total Net Payroll:</span>
          <span className="text-slate-900 dark:text-white font-bold">₹{totalPayroll.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Net Payroll"
          value={`₹${totalPayroll.toLocaleString('en-IN')}`}
          subtitle={`Computed for ${salaries.length} staff records`}
          icon={CircleDollarSign}
          color="purple"
        />
        <StatCard
          title="Disbursed / Paid"
          value={`₹${paidPayroll.toLocaleString('en-IN')}`}
          subtitle={`${salaries.filter((s) => s.paymentStatus === 'PAID').length} staff paid`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Disbursal"
          value={`₹${pendingPayroll.toLocaleString('en-IN')}`}
          subtitle={`${salaries.filter((s) => s.paymentStatus === 'PENDING').length} payments pending`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Salaries Sheet Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Staff Member</th>
                <th className="py-4 px-6">Basic Pay</th>
                <th className="py-4 px-6">Attendance Summary</th>
                <th className="py-4 px-6">Bonus / Deductions</th>
                <th className="py-4 px-6">Net Payable</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader size="md" text="Loading Payroll" subtitle="Calculating monthly compensations & slips..." />
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No salary records generated for this month. Click &quot;Auto-Generate Monthly Payroll&quot;.
                  </td>
                </tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center">
                          {s.staffId?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{s.staffId?.fullName || 'Staff'}</p>
                          <p className="text-xs text-slate-400">
                            {s.staffId?.designation} • {s.staffId?.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      ₹{s.basicSalary?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-4 px-6 text-xs space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{s.presentDays} Present</span>
                        <span>•</span>
                        <span className="text-rose-500 font-semibold">{s.absentDays} Absent</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>{s.leaveDays} Leaves</span>
                        <span>•</span>
                        <span>{s.halfDays} Half-Days</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      {s.bonus > 0 && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">+ ₹{s.bonus} Bonus</p>
                      )}
                      {s.deduction > 0 && (
                        <p className="text-rose-500 font-semibold">- ₹{s.deduction} Deduction</p>
                      )}
                      {s.bonus === 0 && s.deduction === 0 && (
                        <span className="text-slate-400">No adjustments</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        ₹{s.netSalary?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {s.paymentStatus === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {canManage && (
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                        >
                          {s.paymentStatus === 'PAID' ? 'Review / Edit' : 'Settle / Pay'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Adjustment & Mark Paid Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Settle Salary: ${selectedSalary?.staffId?.fullName}`}
        subtitle={`Period: Month ${selectedSalary?.month}/${selectedSalary?.year}`}
      >
        <form onSubmit={handleUpdateSalary} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Basic Monthly Salary:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{selectedSalary?.basicSalary?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Attendance Calculated Base:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedSalary?.presentDays} Present, {selectedSalary?.leaveDays} Paid Leaves
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Add Bonus (₹)
              </label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Deduction (₹)
              </label>
              <input
                type="number"
                value={deduction}
                onChange={(e) => setDeduction(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Disbursal Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
            >
              <option value="PAID">Disbursed (Mark as PAID)</option>
              <option value="PENDING">Pending Review (Unpaid)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Payment Remarks / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Disbursed via Bank Transfer / Cash payout receipt"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save & Confirm Payroll'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
