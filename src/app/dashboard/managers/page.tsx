'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users2, Plus, Edit2, Trash2, ShieldCheck, Mail, Phone, Lock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

export default function ManagersPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [managers, setManagers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    phone: '',
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mgrRes, roleRes] = await Promise.all([
        fetch('/api/managers'),
        fetch('/api/roles'),
      ]);

      const mgrData = await mgrRes.json();
      const roleData = await roleRes.json();

      if (mgrData.success) setManagers(mgrData.managers || []);
      if (roleData.success) {
        setRoles(roleData.roles || []);
        if (roleData.roles?.length > 0 && !formData.roleId) {
          setFormData((prev) => ({ ...prev, roleId: roleData.roles[0]._id }));
        }
      }
    } catch {
      showToast('Failed to load manager accounts.', 'error');
    } finally {
      setLoading(false);
    }
  }, [formData.roleId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      roleId: roles[0]?._id || '',
      phone: '',
      isActive: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mgr: any) => {
    setSelectedManager(mgr);
    setFormData({
      name: mgr.name,
      email: mgr.email,
      password: '',
      roleId: mgr.roleId?._id || mgr.roleId || roles[0]?._id || '',
      phone: mgr.phone || '',
      isActive: mgr.isActive !== undefined ? mgr.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Manager account created successfully!', 'success');
        setIsAddModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to create manager.', 'error');
      }
    } catch {
      showToast('Network error while creating manager.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/managers/${selectedManager._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast('Manager details updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to update manager.', 'error');
      }
    } catch {
      showToast('Network error while updating manager.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteManager = async () => {
    if (!managerToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/managers/${managerToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showToast('Manager deleted successfully.', 'success');
        setDeleteConfirmOpen(false);
        setManagerToDelete(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to delete manager.', 'error');
      }
    } catch {
      showToast('Network error while deleting manager.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredManagers = managers.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.roleId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/50">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Privileges Required</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Only the main System Administrator can manage Manager accounts and assign role-based permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Manager Accounts & RBAC
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage restaurant managers and assign custom granular permission roles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Manager
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search manager by name, email or role..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Managers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-6">Manager</th>
                <th className="py-4 px-6">Assigned Role</th>
                <th className="py-4 px-6">Permissions</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader size="md" text="Loading Managers" subtitle="Retrieving staff accounts & authorization tiers..." />
                  </td>
                </tr>
              ) : filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No manager accounts found. Click &quot;Add Manager&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredManagers.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {m.roleId?.name || 'Unassigned Role'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {m.roleId?.permissions?.length || 0} permissions assigned
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
                      {m.phone || 'No phone added'}
                    </td>

                    <td className="py-4 px-6">
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit manager details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setManagerToDelete(m);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete manager"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Manager Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Manager Account"
        subtitle="Create credentials and assign a role for permission governance"
      >
        <form onSubmit={handleCreateManager} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Vikram Batra"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="manager@restra.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Password (Min 6 chars) *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Assign Role (RBAC) *
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.permissions?.length || 0} permissions)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Creating...' : 'Create Manager Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Manager Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Manager Account"
        subtitle={`Updating account details for ${selectedManager?.name}`}
      >
        <form onSubmit={handleUpdateManager} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              New Password (Leave blank to keep existing)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Assigned Role (RBAC) *
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.permissions?.length || 0} permissions)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Account Status
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            >
              <option value="active">Active (Permitted to log in)</option>
              <option value="inactive">Deactivated (Block login access)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteManager}
        title="Delete Manager Account"
        message={`Are you sure you want to permanently delete the manager account for "${managerToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Manager"
        isLoading={actionLoading}
      />
    </div>
  );
}
