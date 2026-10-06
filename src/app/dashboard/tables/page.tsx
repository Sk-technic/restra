'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Users,
  Layers,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

const SECTIONS = ['Indoor', 'Outdoor', 'Rooftop', 'VIP', 'Bar', 'Terrace', 'Main Dining'];
const STATUSES = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'INACTIVE'];

export default function TablesPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canCreate = isAdmin || hasPermission('tables.create');
  const canUpdate = isAdmin || hasPermission('tables.update');
  const canDelete = isAdmin || hasPermission('tables.delete');

  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals & Popovers
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    section: 'Indoor',
    status: 'AVAILABLE',
    notes: '',
  });

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/tables';
      const params = [];
      if (selectedSection !== 'ALL') params.push(`section=${encodeURIComponent(selectedSection)}`);
      if (selectedStatus !== 'ALL') params.push(`status=${encodeURIComponent(selectedStatus)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTables(data.tables || []);
      }
    } catch {
      showToast('Failed to load restaurant tables.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedSection, selectedStatus, showToast]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleOpenAdd = () => {
    setFormData({
      tableNumber: `T-${tables.length + 1 < 10 ? '0' : ''}${tables.length + 1}`,
      capacity: 4,
      section: 'Indoor',
      status: 'AVAILABLE',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setSelectedTable(t);
    setFormData({
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      section: t.section,
      status: t.status,
      notes: t.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleQuickStatusChange = async (tableId: string, newStatus: string) => {
    if (!canUpdate) return;
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Table status changed to ${newStatus}`, 'success');
        fetchTables();
      }
    } catch {
      showToast('Failed to update table status', 'error');
    }
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableNumber || !formData.capacity) {
      showToast('Table number and seating capacity are required.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const isEdit = Boolean(selectedTable);
      const url = isEdit ? `/api/tables/${selectedTable._id}` : '/api/tables';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? 'Table details updated!' : 'Table added to floor plan!', 'success');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        fetchTables();
      } else {
        showToast(data.message || 'Failed to save table.', 'error');
      }
    } catch {
      showToast('Network error while saving table.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/tables/${tableToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Table deleted successfully.', 'success');
        setDeleteConfirmOpen(false);
        setTableToDelete(null);
        fetchTables();
      } else {
        showToast(data.message || 'Failed to delete table.', 'error');
      }
    } catch {
      showToast('Network error while deleting table.', 'error');
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
            Restaurant Tables & Floor Plan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage table capacities, seating sections (Indoor, Rooftop, VIP, Outdoor) and live statuses.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        )}
      </div>

      {/* Quick Floor Summary Bar & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Sleek Segmented Status Bar */}
        <div className="inline-flex flex-wrap items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mr-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Total Tables</span>
            <span className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-700 text-[11px] font-black text-slate-900 dark:text-white">
              {tables.length}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedStatus === 'AVAILABLE'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {tables.filter((t) => t.status === 'AVAILABLE').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedStatus === 'OCCUPIED'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Occupied</span>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              {tables.filter((t) => t.status === 'OCCUPIED').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus(selectedStatus === 'RESERVED' ? 'ALL' : 'RESERVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              selectedStatus === 'RESERVED'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Reserved</span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {tables.filter((t) => t.status === 'RESERVED').length}
            </span>
          </button>

          {tables.some((t) => t.status === 'CLEANING') && (
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'CLEANING' ? 'ALL' : 'CLEANING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedStatus === 'CLEANING'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Cleaning</span>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                {tables.filter((t) => t.status === 'CLEANING').length}
              </span>
            </button>
          )}
        </div>

        {/* Filter Selects */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 shadow-xs"
          >
            <option value="ALL">All Sections</option>
            {SECTIONS.map((sec) => (
              <option key={sec} value={sec}>
                {sec} Section
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-500 shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Floor Plan Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex items-center justify-center">
            <Loader size="lg" text="Loading Tables" subtitle="Fetching restaurant floor plan & seating..." />
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No tables found matching criteria. Click &quot;Add Table&quot;.
          </div>
        ) : (
          tables.map((t) => {
            const statusConfig = {
              AVAILABLE: {
                label: 'Available',
                icon: CheckCircle,
                pillStyle: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
                iconColor: 'text-emerald-500 dark:text-emerald-400',
              },
              OCCUPIED: {
                label: 'Occupied',
                icon: Users,
                pillStyle: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
                iconColor: 'text-rose-500 dark:text-rose-400',
              },
              RESERVED: {
                label: 'Reserved',
                icon: Clock,
                pillStyle: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
                iconColor: 'text-amber-500 dark:text-amber-400',
              },
              CLEANING: {
                label: 'Cleaning',
                icon: Sparkles,
                pillStyle: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
                iconColor: 'text-sky-500 dark:text-sky-400',
              },
              INACTIVE: {
                label: 'Inactive',
                icon: AlertCircle,
                pillStyle: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
                iconColor: 'text-slate-400',
              },
            }[t.status as string] || {
              label: t.status,
              icon: AlertCircle,
              pillStyle: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
              iconColor: 'text-slate-400',
            };

            const StatusIcon = statusConfig.icon;
            const isDropdownOpen = openDropdownId === t._id;
            const cleanNumber = t.tableNumber.replace(/^(T-|Table\s*)/i, '');

            return (
              <div
                key={t._id}
                className={`relative overflow-visible rounded-2xl bg-white dark:bg-[#12141c] border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm hover:shadow-md dark:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group ${
                  isDropdownOpen ? 'z-40 ring-1 ring-primary-500/40' : 'z-10'
                }`}
              >
                <div>
                  {/* Top Header: Big Number + Section on Left, Refined Neutral Badge on Right */}
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        {cleanNumber || t.tableNumber}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t.section}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {t.tableNumber.startsWith('T-') ? t.tableNumber : `Table ${t.tableNumber}`}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions & Refined Frosted Section Badge */}
                    <div className="flex items-center gap-1.5">
                      {/* Action buttons on hover */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {canUpdate && (
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Table"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => {
                              setTableToDelete(t);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Table"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Refined Minimalist Section Tag */}
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider">
                        {t.section.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  {/* Middle Description / Subtitle Text */}
                  <div className="mt-3 mb-4 relative z-10">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal leading-relaxed line-clamp-2 min-h-[32px]">
                      {t.notes || `${t.section} floor dining table for guests.`}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Left Subtle Capacity Pill + Right Status Pill Button */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-20">
                  {/* Left Clean Capacity Badge */}
                  <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.capacity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Seats
                    </span>
                  </div>

                  {/* Right Status Pill Button */}
                  {canUpdate ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : t._id)}
                        className={`py-1 px-3 rounded-full border ${statusConfig.pillStyle} text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all hover:brightness-105 active:scale-95 group/btn`}
                      >
                        <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                        <span className="tracking-tight text-[11px]">{statusConfig.label}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Custom Compact Status Dropdown Menu with Micro Icons */}
                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenDropdownId(null)}
                          />

                          <div className="absolute right-0 bottom-full mb-1.5 z-50 w-32 p-1 rounded-xl bg-white dark:bg-[#161822] border border-slate-200 dark:border-slate-700/80 shadow-xl space-y-0.5 animate-fade-in">
                            <p className="px-2 pt-1 pb-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                              Status
                            </p>
                            {STATUSES.map((st) => {
                              const isSelected = t.status === st;
                              const iconConfig = {
                                AVAILABLE: { icon: CheckCircle, color: 'text-emerald-500', label: 'Available' },
                                OCCUPIED: { icon: Users, color: 'text-rose-500', label: 'Occupied' },
                                RESERVED: { icon: Clock, color: 'text-amber-500', label: 'Reserved' },
                                CLEANING: { icon: Sparkles, color: 'text-sky-500', label: 'Cleaning' },
                                INACTIVE: { icon: AlertCircle, color: 'text-slate-400', label: 'Inactive' },
                              }[st] || { icon: AlertCircle, color: 'text-slate-400', label: st };

                              const ItemIcon = iconConfig.icon;

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    handleQuickStatusChange(t._id, st);
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full px-2 py-1 rounded-lg flex items-center justify-between text-[11px] font-semibold transition-all ${
                                    isSelected
                                      ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold'
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <ItemIcon className={`w-3 h-3 shrink-0 ${iconConfig.color}`} />
                                    <span className="capitalize truncate">{iconConfig.label}</span>
                                  </div>
                                  {isSelected && <Check className="w-3 h-3 text-primary-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className={`py-1 px-3 rounded-full border ${statusConfig.pillStyle} text-[11px] font-semibold flex items-center gap-1.5 shadow-xs`}>
                      <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                      <span>{statusConfig.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Table Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Table: ${selectedTable?.tableNumber}` : 'Add Restaurant Dining Table'}
        subtitle="Configure table identification number, guest capacity, and section"
      >
        <form onSubmit={handleSaveTable} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Table Number / Code *
            </label>
            <input
              type="text"
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              placeholder="e.g. T-01, Table 12, VIP-1"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Guest Capacity *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
                min={1}
                max={50}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Section *
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Table Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Notes / Location Details
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Window side couple table, corner booth"
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
              {actionLoading ? 'Saving...' : isEditModalOpen ? 'Save Table Changes' : 'Add Table'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTable}
        title="Delete Dining Table"
        message={`Are you sure you want to remove Table "${tableToDelete?.tableNumber}" from the restaurant floor plan?`}
        confirmText="Delete Table"
        isLoading={actionLoading}
      />
    </div>
  );
}
