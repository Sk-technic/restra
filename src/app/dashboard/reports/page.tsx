'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  IndianRupee,
  CalendarDays,
  CalendarCheck,
  CircleDollarSign,
  Printer,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { StatCard } from '@/components/StatCard';
import { Loader } from '@/components/Loader';

export default function ReportsPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [reportType, setReportType] = useState<'sales' | 'reservations' | 'attendance' | 'salary'>('sales');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?type=${reportType}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data);
      }
    } catch {
      showToast('Failed to load analytical report', 'error');
    } finally {
      setLoading(false);
    }
  }, [reportType, showToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Restaurant Reports & Business Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export and analyze financial transactions, cash flows, staff presence, and table booking performance.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Export Report
        </button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-2xl">
        <button
          onClick={() => setReportType('sales')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            reportType === 'sales'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> Sales & Revenue
        </button>

        <button
          onClick={() => setReportType('reservations')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            reportType === 'reservations'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Table Bookings
        </button>

        <button
          onClick={() => setReportType('attendance')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            reportType === 'attendance'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Staff Attendance
        </button>

        <button
          onClick={() => setReportType('salary')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            reportType === 'salary'
              ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" /> Payroll Summary
        </button>
      </div>

      {/* Summary KPI Cards */}
      {reportType === 'sales' && reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue Settled"
            value={`₹${reportData.summary.totalRevenue.toLocaleString('en-IN')}`}
            subtitle={`${reportData.summary.totalTransactions} billing receipts generated`}
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Direct Cash Revenue"
            value={`₹${reportData.summary.totalCashRevenue.toLocaleString('en-IN')}`}
            subtitle="Counter and table cash settlements"
            icon={IndianRupee}
            color="blue"
          />
          <StatCard
            title="Digital & UPI Revenue"
            value={`₹${reportData.summary.totalDigitalRevenue.toLocaleString('en-IN')}`}
            subtitle="Cards, UPI & QR transfers"
            icon={IndianRupee}
            color="purple"
          />
        </div>
      )}

      {reportType === 'reservations' && reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Table Bookings"
            value={reportData.summary.totalBookings}
            subtitle="Lifetime reservations logged"
            icon={CalendarDays}
            color="purple"
          />
          <StatCard
            title="Completed Dining"
            value={reportData.summary.completed}
            subtitle="Guests successfully seated & served"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Confirmed Upcoming"
            value={reportData.summary.confirmed}
            subtitle="Active bookings on schedule"
            icon={CalendarDays}
            color="amber"
          />
        </div>
      )}

      {reportType === 'attendance' && reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Present Logs"
            value={reportData.summary.present}
            subtitle="Full shifts worked"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Absent Logs"
            value={reportData.summary.absent}
            subtitle="Unexcused day off"
            icon={CheckCircle2}
            color="rose"
          />
          <StatCard
            title="Approved Leaves"
            value={reportData.summary.leaves}
            subtitle="Medical / personal"
            icon={CalendarCheck}
            color="amber"
          />
          <StatCard
            title="Half-Day Shifts"
            value={reportData.summary.halfDays}
            subtitle="0.5 wage equivalent"
            icon={CalendarCheck}
            color="purple"
          />
        </div>
      )}

      {reportType === 'salary' && reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Payrolls"
            value={reportData.summary.totalSalariesGenerated}
            subtitle="Payroll cycles computed"
            icon={CircleDollarSign}
            color="purple"
          />
          <StatCard
            title="Total Disbursed Pay"
            value={`₹${reportData.summary.totalPaidAmount.toLocaleString('en-IN')}`}
            subtitle="Paid out to workforce"
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Pending Disbursals"
            value={`₹${reportData.summary.totalPendingAmount.toLocaleString('en-IN')}`}
            subtitle="Approved pending bank release"
            icon={IndianRupee}
            color="amber"
          />
        </div>
      )}

      {/* Detailed Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {reportType.toUpperCase()} Audit Ledger
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {reportData?.records?.length || 0} Records in Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Record Identifier</th>
                <th className="py-4 px-6">Subject / Staff / Table</th>
                <th className="py-4 px-6">Timestamp / Date</th>
                <th className="py-4 px-6">Amount / Metrics</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader size="md" text="Generating Report" subtitle="Aggregating financial & operational metrics..." />
                  </td>
                </tr>
              ) : !reportData?.records || reportData.records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No ledger records found for this category.
                  </td>
                </tr>
              ) : (
                reportData.records.map((rec: any) => (
                  <tr key={rec._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-xs">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {rec.billNumber || rec.orderNumber || rec._id.substring(18)}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {rec.customerName || rec.staffId?.fullName || rec.tableId?.tableNumber || '-'}
                      </p>
                      {rec.staffId?.department && (
                        <p className="text-[11px] text-slate-400">{rec.staffId.department}</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      {rec.date || (rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : '-')}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {rec.grandTotal ? (
                        <span className="text-emerald-600 dark:text-emerald-400">₹{rec.grandTotal}</span>
                      ) : rec.netSalary ? (
                        <span className="text-purple-600 dark:text-purple-400">₹{rec.netSalary}</span>
                      ) : rec.numberOfGuests ? (
                        `${rec.numberOfGuests} Guests`
                      ) : (
                        rec.status || '-'
                      )}
                    </td>

                    <td className="py-4 px-6 text-right font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rec.paymentStatus || rec.status}
                      </span>
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
