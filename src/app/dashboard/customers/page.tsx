'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserSquare2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  ShoppingBag,
  History,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

export default function CustomersPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canCreate = isAdmin || hasPermission('customers.create');
  const canUpdate = isAdmin || hasPermission('customers.update');
  const canDelete = isAdmin || hasPermission('customers.delete');

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [custToDelete, setCustToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch {
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setSelectedCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleViewHistory = async (c: any) => {
    setSelectedCustomer(c);
    try {
      const res = await fetch(`/api/customers/${c._id}`);
      const data = await res.json();
      if (data.success) {
        setCustomerHistory(data.history);
        setIsHistoryModalOpen(true);
      }
    } catch {
      showToast('Failed to load customer profile history', 'error');
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Customer name and phone number are required.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const isEdit = Boolean(selectedCustomer);
      const url = isEdit ? `/api/customers/${selectedCustomer._id}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? 'Customer updated!' : 'Customer added to directory!', 'success');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        fetchCustomers();
      } else {
        showToast(data.message || 'Failed to save customer.', 'error');
      }
    } catch {
      showToast('Network error while saving customer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!custToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/customers/${custToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Customer record deleted.', 'success');
        setDeleteConfirmOpen(false);
        setCustToDelete(null);
        fetchCustomers();
      } else {
        showToast(data.message || 'Failed to delete customer.', 'error');
      }
    } catch {
      showToast('Network error while deleting.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Directory & Profiles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track dining guest loyalty, total visits, lifetime expenditure and reservation histories.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Total Visits</th>
                <th className="py-4 px-6">Lifetime Spent</th>
                <th className="py-4 px-6">Last Visit</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader size="md" text="Loading Customers" subtitle="Fetching guest history & directory..." />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No customers found. Records are also automatically created during orders and table bookings.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email || 'No email registered'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs font-semibold text-slate-900 dark:text-white">
                      {c.phone}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.totalVisits || 1} Visits
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {c.lastVisit || 'Recent'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewHistory(c)}
                          className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View order and booking history"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit customer details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              setCustToDelete(c);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete customer record"
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

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Profile & History: ${selectedCustomer?.name}`}
        subtitle={`Phone: ${selectedCustomer?.phone} • Total Spent: ₹${selectedCustomer?.totalSpent?.toLocaleString('en-IN')}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Orders ({customerHistory?.orders?.length || 0})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {customerHistory?.orders?.length === 0 ? (
                <p className="text-xs text-slate-400">No previous orders found.</p>
              ) : (
                customerHistory?.orders?.map((ord: any) => (
                  <div
                    key={ord._id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {ord.orderNumber} ({ord.orderType})
                      </p>
                      <p className="text-slate-400">{ord.items?.length || 0} items ordered</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">₹{ord.total}</span>
                      <p className="text-primary-500 font-semibold">{ord.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Table Reservations ({customerHistory?.reservations?.length || 0})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {customerHistory?.reservations?.length === 0 ? (
                <p className="text-xs text-slate-400">No previous reservations recorded.</p>
              ) : (
                customerHistory?.reservations?.map((res: any) => (
                  <div
                    key={res._id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {res.tableId?.tableNumber || 'Table'} ({res.numberOfGuests} Guests)
                      </p>
                      <p className="text-slate-400">{res.date} • {res.startTime} - {res.endTime}</p>
                    </div>
                    <span className="font-bold text-amber-500">{res.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Customer: ${selectedCustomer?.name}` : 'Add New Customer'}
        subtitle="Customer contact and dining profile"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Amitabh Sen"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9811122233"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="guest@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Address / Preferences Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Regular VIP guest, prefers less spicy, birthday on 14th May..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
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
              {actionLoading ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer Profile"
        message={`Are you sure you want to remove customer record for "${custToDelete?.name}"?`}
        confirmText="Delete Customer"
        isLoading={actionLoading}
      />
    </div>
  );
}
