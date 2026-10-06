'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  UtensilsCrossed,
  Phone,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

const RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export default function ReservationsPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canCreate = isAdmin || hasPermission('reservations.create');
  const canUpdate = isAdmin || hasPermission('reservations.update');
  const canCancel = isAdmin || hasPermission('reservations.cancel');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resToDelete, setResToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    numberOfGuests: 2,
    tableId: '',
    date: todayStr,
    startTime: '19:00',
    endTime: '21:00',
    status: 'CONFIRMED',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/reservations?date=${selectedDate}`;
      if (selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;

      const [resRes, tableRes] = await Promise.all([
        fetch(url),
        fetch('/api/tables'),
      ]);

      const resData = await resRes.json();
      const tableData = await tableRes.json();

      if (resData.success) setReservations(resData.reservations || []);
      if (tableData.success) {
        setTables(tableData.tables || []);
        if (tableData.tables?.length > 0 && !formData.tableId) {
          setFormData((prev) => ({ ...prev, tableId: tableData.tables[0]._id }));
        }
      }
    } catch {
      showToast('Failed to load reservations.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus, formData.tableId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      numberOfGuests: 2,
      tableId: tables[0]?._id || '',
      date: selectedDate || todayStr,
      startTime: '19:00',
      endTime: '21:00',
      status: 'CONFIRMED',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (r: any) => {
    setSelectedReservation(r);
    setFormData({
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail || '',
      numberOfGuests: r.numberOfGuests,
      tableId: r.tableId?._id || r.tableId || tables[0]?._id || '',
      date: r.date,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      notes: r.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleQuickStatusChange = async (resId: string, newStatus: string) => {
    if (!canUpdate) return;
    try {
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Reservation status updated to ${newStatus}`, 'success');
        fetchData();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSaveReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.tableId) {
      showToast('Please fill all required customer and table details.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const isEdit = Boolean(selectedReservation);
      const url = isEdit ? `/api/reservations/${selectedReservation._id}` : '/api/reservations';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          isEdit ? 'Reservation updated successfully!' : 'Table reserved successfully!',
          'success'
        );
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        fetchData();
      } else {
        // Displays overlap prevention message!
        showToast(data.message || 'Failed to save reservation.', 'error');
      }
    } catch {
      showToast('Network error while saving reservation.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReservation = async () => {
    if (!resToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/reservations/${resToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Reservation cancelled and removed.', 'success');
        setDeleteConfirmOpen(false);
        setResToDelete(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to cancel reservation.', 'error');
      }
    } catch {
      showToast('Network error while cancelling.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeline Chart Quick Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Table Bookings & Reservations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Book dining tables, check overlap conflicts in real time, and view customer booking histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reservations/timeline"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
          >
            <Clock className="w-4 h-4" /> Visual Timeline Grid
          </Link>

          {canCreate && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Book Table
            </button>
          )}
        </div>
      </div>

      {/* Date & Status Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-sm"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-sm"
          >
            <option value="ALL">All Booking Statuses</option>
            {RESERVATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-semibold">
          <span className="text-slate-500">Bookings for selected date:</span>
          <span className="text-slate-900 dark:text-white font-bold">{reservations.length} Tables</span>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Guest Details</th>
                <th className="py-4 px-6">Reserved Table</th>
                <th className="py-4 px-6">Time Slot</th>
                <th className="py-4 px-6">Party Size</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader size="md" text="Loading Bookings" subtitle="Retrieving table reservations..." />
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No reservations found for {selectedDate}. Click &quot;Book Table&quot; to create one.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{res.customerName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{res.customerPhone}</span>
                        </div>
                        {res.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-1">&quot;{res.notes}&quot;</p>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {res.tableId?.tableNumber || 'Table'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {res.tableId?.section || 'Indoor'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        <span>{res.startTime} - {res.endTime}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{res.numberOfGuests} Guests</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={res.status}
                        disabled={!canUpdate}
                        onChange={(e) => handleQuickStatusChange(res._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none ${
                          res.status === 'CONFIRMED'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : res.status === 'SEATED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : res.status === 'COMPLETED'
                            ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {RESERVATION_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(res)}
                            className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit reservation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => {
                              setResToDelete(res);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Cancel reservation"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Reservation Modal with Overlap Notification */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Reservation: ${selectedReservation?.customerName}` : 'Book a Dining Table'}
        subtitle="Automatic conflict detection prevents double booking of tables"
      >
        <form onSubmit={handleSaveReservation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Deepika Rao"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="9822233344"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Number of Guests *
              </label>
              <input
                type="number"
                value={formData.numberOfGuests}
                onChange={(e) => setFormData({ ...formData, numberOfGuests: Number(e.target.value) })}
                required
                min={1}
                max={30}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Select Table *
              </label>
              <select
                value={formData.tableId}
                onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
              >
                {tables.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.tableNumber} ({t.section} • Capacity: {t.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Special Requests & Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Birthday celebration, high-chair needed, quiet corner"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Verifying & Saving...' : isEditModalOpen ? 'Update Reservation' : 'Confirm Table Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteReservation}
        title="Cancel Table Reservation"
        message={`Are you sure you want to cancel the reservation for "${resToDelete?.customerName}" on ${resToDelete?.date} (${resToDelete?.startTime} - ${resToDelete?.endTime})?`}
        confirmText="Cancel Reservation"
        isLoading={actionLoading}
      />
    </div>
  );
}
