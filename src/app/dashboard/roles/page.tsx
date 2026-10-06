'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Check, Lock, Sparkles, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';
import { ALL_PERMISSIONS, PERMISSION_MODULES } from '@/lib/permissions';

export default function RolesPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles || []);
      }
    } catch {
      showToast('Failed to load roles list', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: any) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissions(role.permissions || []);
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const toggleModuleAll = (moduleName: string) => {
    const modulePermIds = ALL_PERMISSIONS.filter((p) => p.module === moduleName).map((p) => p.id);
    const allSelected = modulePermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter((id) => !modulePermIds.includes(id)));
    } else {
      const newSelected = new Set([...selectedPermissions, ...modulePermIds]);
      setSelectedPermissions(Array.from(newSelected));
    }
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === ALL_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('Role name is required.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const url = editingRole ? `/api/roles/${editingRole._id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingRole ? 'Role updated successfully!' : 'Role created successfully!', 'success');
        setIsModalOpen(false);
        fetchRoles();
      } else {
        showToast(data.message || 'Failed to save role.', 'error');
      }
    } catch {
      showToast('Network error while saving role.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/roles/${roleToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Role deleted successfully.', 'success');
        setDeleteConfirmOpen(false);
        setRoleToDelete(null);
        fetchRoles();
      } else {
        showToast(data.message || 'Failed to delete role.', 'error');
      }
    } catch {
      showToast('Network error while deleting role.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/50">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Privileges Required</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Only the main System Administrator can manage roles and permission policies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Roles & Permission Governance (RBAC)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define role templates and assign granular module permissions for restaurant managers.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Custom Role
        </button>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-20 flex items-center justify-center">
            <Loader size="lg" text="Loading Roles" subtitle="Fetching RBAC permission matrices & access scopes..." />
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-400">No roles configured.</div>
        ) : (
          roles.map((role) => (
            <div
              key={role._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary-500/50 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {role.name}
                        {role.isSystemRole && (
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            System Default
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {role.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(role)}
                      className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit role permissions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!role.isSystemRole && (
                      <button
                        onClick={() => {
                          setRoleToDelete(role);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions Badges */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <span>Assigned Permissions ({role.permissions?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {role.permissions?.map((pId: string) => (
                      <span
                        key={pId}
                        className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {pId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Created: {new Date(role.createdAt || Date.now()).toLocaleDateString()}</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {Math.round(((role.permissions?.length || 0) / ALL_PERMISSIONS.length) * 100)}% API Coverage
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Add/Edit Modal with Granular Permission Checkboxes */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Permission Role'}
        subtitle="Select granular abilities allowed for managers assigned to this role"
        maxWidth="3xl"
      >
        <form onSubmit={handleSaveRole} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Head Bartender & Cashier"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Describe responsibilities..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Granular Permissions ({selectedPermissions.length} / {ALL_PERMISSIONS.length} active)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedPermissions.length === ALL_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/40">
              {PERMISSION_MODULES.map((moduleName) => {
                const modulePerms = ALL_PERMISSIONS.filter((p) => p.module === moduleName);
                const allSelected = modulePerms.every((p) => selectedPermissions.includes(p.id));

                return (
                  <div key={moduleName} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        {moduleName} Module
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleModuleAll(moduleName)}
                        className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {allSelected ? 'Uncheck Group' : 'Check All in Group'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {modulePerms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePermission(perm.id)}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/60'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {perm.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {perm.id} • {perm.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingRole ? 'Update Role Policy' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete role "${roleToDelete?.name}"? Make sure no manager is currently using this role.`}
        confirmText="Delete Role"
        isLoading={actionLoading}
      />
    </div>
  );
}
