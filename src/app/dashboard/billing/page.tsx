'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ReceiptText,
  IndianRupee,
  CreditCard,
  QrCode,
  Banknote,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  UtensilsCrossed,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { StatCard } from '@/components/StatCard';
import { Loader } from '@/components/Loader';

export default function BillingPage() {
  const { hasPermission, isAdmin, user } = useAuth();
  const { showToast } = useToast();

  const canManage = isAdmin || hasPermission('billing.manage');

  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Settle Payment & Receipt Modal
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'CARD' | 'UPI' | 'OTHER'>('CASH');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/billing?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      if (methodFilter !== 'ALL') url += `&method=${methodFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBills(data.bills || []);
      }
    } catch {
      showToast('Failed to load billing history', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, methodFilter, showToast]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleOpenSettle = (bill: any) => {
    setSelectedBill(bill);
    setSelectedMethod(bill.paymentMethod || 'CASH');
    setNotes(bill.notes || '');
    setIsSettleModalOpen(true);
  };

  const handleOpenReceipt = (bill: any) => {
    setSelectedBill(bill);
    setIsReceiptModalOpen(true);
  };

  const handleSettlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/billing/${selectedBill._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'PAID',
          paymentMethod: selectedMethod,
          notes,
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`Payment of ₹${selectedBill.grandTotal} settled via ${selectedMethod}! Table freed.`, 'success');
        setIsSettleModalOpen(false);
        fetchBills();
      } else {
        showToast(data.message || 'Payment update failed.', 'error');
      }
    } catch {
      showToast('Network error while processing payment.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const totalRevenue = bills
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const cashRevenue = bills
    .filter((b) => b.paymentStatus === 'PAID' && b.paymentMethod === 'CASH')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const pendingAmount = bills
    .filter((b) => b.paymentStatus === 'PENDING')
    .reduce((sum, b) => sum + b.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Billing, Invoicing & Cash Payments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accept cash/online payments, generate printable restaurant receipts, and auto-settle dining orders.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Paid Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtitle={`${bills.filter((b) => b.paymentStatus === 'PAID').length} bills settled`}
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Cash Receipts Settled"
          value={`₹${cashRevenue.toLocaleString('en-IN')}`}
          subtitle="Direct cash counter payments"
          icon={Banknote}
          color="blue"
        />
        <StatCard
          title="Pending Unpaid Bills"
          value={`₹${pendingAmount.toLocaleString('en-IN')}`}
          subtitle={`${bills.filter((b) => b.paymentStatus === 'PENDING').length} open tables awaiting payment`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bill #, customer, table..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Settled (Paid)</option>
            <option value="PENDING">Pending Payment</option>
          </select>
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash Payment</option>
            <option value="CARD">Credit / Debit Card</option>
            <option value="UPI">UPI / QR Code</option>
            <option value="OTHER">Other Method</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Bill Number</th>
                <th className="py-4 px-6">Table / Guest</th>
                <th className="py-4 px-6">Dishes Breakdown</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader size="md" text="Loading Invoices" subtitle="Retrieving customer bills & payments..." />
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No billing records found. You can generate bills directly from Live Orders.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900 dark:text-white">{bill.billNumber}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {bill.tableNumber !== '-' ? `Table ${bill.tableNumber}` : 'Takeaway'}
                      </p>
                      <p className="text-xs text-slate-400">{bill.customerName}</p>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {bill.items?.length} items ({bill.items?.map((i: any) => i.name).slice(0, 2).join(', ')}
                      {bill.items?.length > 2 ? '...' : ''})
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        ₹{bill.grandTotal?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {bill.paymentMethod === 'CASH' && <Banknote className="w-3.5 h-3.5 text-emerald-500" />}
                        {bill.paymentMethod === 'CARD' && <CreditCard className="w-3.5 h-3.5 text-sky-500" />}
                        {bill.paymentMethod === 'UPI' && <QrCode className="w-3.5 h-3.5 text-purple-500" />}
                        {bill.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {bill.paymentStatus === 'PAID' ? (
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenReceipt(bill)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Receipt
                        </button>

                        {canManage && bill.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleOpenSettle(bill)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Cash / Online Payment Modal */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        title={`Accept Payment: ${selectedBill?.billNumber}`}
        subtitle={`Total Payable: ₹${selectedBill?.grandTotal} • Table ${selectedBill?.tableNumber}`}
      >
        <form onSubmit={handleSettlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod('CASH')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                  selectedMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-6 h-6" />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                  selectedMethod === 'UPI'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                  selectedMethod === 'CARD'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-6 h-6" />
                <span>Debit / Card</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Payment Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received exact cash at table counter"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSettleModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Confirm Paid & Free Table'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice / Restaurant Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Restaurant Tax Invoice Receipt"
        subtitle="Customer copy with itemized tax and restaurant information"
        maxWidth="md"
      >
        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4">
          {/* Restaurant Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h3 className="text-base font-black tracking-wider uppercase font-sans">
              GRANDEUR RESTAURANT
            </h3>
            <p className="text-[11px] text-slate-500">Fine Dining & Multi-Cuisine Lounge</p>
            <p className="text-[10px] text-slate-400">Sector 18, Commercial Hub • GST: 07AAACG1234F1Z5</p>
          </div>

          {/* Invoice Meta */}
          <div className="flex justify-between text-[11px] border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
            <div>
              <p>Invoice: <b>{selectedBill?.billNumber}</b></p>
              <p>Table: <b>{selectedBill?.tableNumber}</b></p>
            </div>
            <div className="text-right">
              <p>Date: {new Date(selectedBill?.createdAt || Date.now()).toLocaleDateString()}</p>
              <p>Status: <b className="text-emerald-500">{selectedBill?.paymentStatus}</b></p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
            <div className="flex justify-between font-bold text-[11px]">
              <span>Item Description</span>
              <span>Qty x Price = Amount</span>
            </div>
            {selectedBill?.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-[11px]">
                <span className="truncate pr-2">{item.name}</span>
                <span>{item.quantity} x {item.price} = ₹{item.amount}</span>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal Amount:</span>
              <span>₹{selectedBill?.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (5%):</span>
              <span>₹{selectedBill?.tax}</span>
            </div>
            {selectedBill?.discount > 0 && (
              <div className="flex justify-between text-emerald-500 font-bold">
                <span>Discount Applied:</span>
                <span>- ₹{selectedBill?.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 font-sans">
              <span>GRAND TOTAL:</span>
              <span className="text-primary-600 dark:text-primary-400">₹{selectedBill?.grandTotal}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Payment Mode:</span>
              <span className="font-bold">{selectedBill?.paymentMethod}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center pt-2 text-[10px] text-slate-400">
            <p>Thank you for dining with us! Please visit again.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsReceiptModalOpen(false)}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Tax Receipt
          </button>
        </div>
      </Modal>
    </div>
  );
}
