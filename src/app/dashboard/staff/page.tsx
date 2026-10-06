'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  Upload,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

const DEPARTMENTS = [
  'Kitchen',
  'Waiter',
  'Reception',
  'Housekeeping',
  'Cleaning',
  'Security',
  'Cashier',
  'Other',
];

const DESIGNATIONS = [
  'Chef',
  'Assistant Chef',
  'Waiter',
  'Cashier',
  'Receptionist',
  'Cleaner',
  'Security Guard',
  'Helper',
  'Floor Manager',
];

export default function StaffPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canCreate = isAdmin || hasPermission('staff.create');
  const canUpdate = isAdmin || hasPermission('staff.update');
  const canDelete = isAdmin || hasPermission('staff.delete');

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    fullName: '',
    profileImage: '/images/staff/default-avatar.png',
    mobileNumber: '',
    email: '',
    address: '',
    gender: 'MALE',
    dateOfBirth: '',
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'Kitchen',
    designation: 'Chef',
    salary: 25000,
    emergencyContact: '',
    status: 'ACTIVE',
    notes: '',
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/staff?search=${encodeURIComponent(search)}`;
      if (selectedDept !== 'ALL') url += `&department=${encodeURIComponent(selectedDept)}`;
      if (selectedStatus !== 'ALL') url += `&status=${encodeURIComponent(selectedStatus)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff || []);
      }
    } catch {
      showToast('Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept, selectedStatus, showToast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('folder', 'staff');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, profileImage: data.url }));
        showToast('Profile photo uploaded!', 'success');
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      profileImage: '/images/staff/default-avatar.png',
      mobileNumber: '',
      email: '',
      address: '',
      gender: 'MALE',
      dateOfBirth: '',
      joiningDate: new Date().toISOString().split('T')[0],
      department: 'Kitchen',
      designation: 'Chef',
      salary: 25000,
      emergencyContact: '',
      status: 'ACTIVE',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (member: any) => {
    setSelectedStaff(member);
    setFormData({
      fullName: member.fullName,
      profileImage: member.profileImage || '/images/staff/default-avatar.png',
      mobileNumber: member.mobileNumber,
      email: member.email || '',
      address: member.address || '',
      gender: member.gender || 'MALE',
      dateOfBirth: member.dateOfBirth || '',
      joiningDate: member.joiningDate || new Date().toISOString().split('T')[0],
      department: member.department,
      designation: member.designation,
      salary: member.salary || 0,
      emergencyContact: member.emergencyContact || '',
      status: member.status || 'ACTIVE',
      notes: member.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const isEdit = Boolean(selectedStaff);
      const url = isEdit ? `/api/staff/${selectedStaff._id}` : '/api/staff';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? 'Staff details updated!' : 'Staff member added successfully!', 'success');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        fetchStaff();
      } else {
        showToast(data.message || 'Failed to save staff record.', 'error');
      }
    } catch {
      showToast('Network error while saving staff.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/staff/${staffToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Staff member deleted successfully.', 'success');
        setDeleteConfirmOpen(false);
        setStaffToDelete(null);
        fetchStaff();
      } else {
        showToast(data.message || 'Failed to delete staff member.', 'error');
      }
    } catch {
      showToast('Network error while deleting staff member.', 'error');
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
            Restaurant Staff Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage kitchen crew, floor attendants, receptionists, cleaners and support personnel.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept} Department
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Staff Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex items-center justify-center">
            <Loader size="lg" text="Loading Staff Members" subtitle="Fetching employee profiles & rosters..." />
          </div>
        ) : staff.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No staff members found matching criteria.
          </div>
        ) : (
          staff.map((member) => (
            <div
              key={member._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-amber-500 flex items-center justify-center font-bold text-white text-base shadow-md shadow-primary-500/20 shrink-0">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {member.fullName}
                      </h3>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {member.designation} • {member.department}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      member.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : member.status === 'ON_LEAVE'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Details List */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.mobileNumber}</span>
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Joined: {new Date(member.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Base Salary: ₹{member.salary?.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>

                {member.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl italic">
                    &quot;{member.notes}&quot;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                {canUpdate && (
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit staff details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => {
                      setStaffToDelete(member);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete staff record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Staff: ${selectedStaff?.fullName}` : 'Add New Restaurant Staff Member'}
        subtitle="Staff members perform day-to-day duties and do not have dashboard login access"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ramesh Patel"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="9876543210"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Designation *
              </label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                {DESIGNATIONS.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Monthly Salary (₹) *
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Emergency Contact & Notes
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Emergency phone & relation (e.g. 9811199999 - Brother)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500 mb-2"
            />
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special notes, certifications, shift preferences..."
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
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Record"
        message={`Are you sure you want to permanently remove staff record for "${staffToDelete?.fullName}"?`}
        confirmText="Delete Staff"
        isLoading={actionLoading}
      />
    </div>
  );
}
