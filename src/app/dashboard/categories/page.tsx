'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  MenuSquare,
  Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

export default function CategoriesPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canCreate = isAdmin || hasPermission('menu.create');
  const canUpdate = isAdmin || hasPermission('menu.update');
  const canDelete = isAdmin || hasPermission('menu.delete');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '/images/categories/default-category.png',
    status: 'ACTIVE',
    sortOrder: 1,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('folder', 'categories');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        showToast('Category banner uploaded!', 'success');
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
      name: '',
      description: '',
      image: '/images/categories/default-category.png',
      status: 'ACTIVE',
      sortOrder: categories.length + 1,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setSelectedCategory(c);
    setFormData({
      name: c.name,
      description: c.description || '',
      image: c.image || '/images/categories/default-category.png',
      status: c.status || 'ACTIVE',
      sortOrder: c.sortOrder || 1,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const isEdit = Boolean(selectedCategory);
      const url = isEdit ? `/api/categories/${selectedCategory._id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? 'Category updated!' : 'Category created successfully!', 'success');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        fetchCategories();
      } else {
        showToast(data.message || 'Failed to save category.', 'error');
      }
    } catch {
      showToast('Network error while saving category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!catToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/categories/${catToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category removed successfully.', 'success');
        setDeleteConfirmOpen(false);
        setCatToDelete(null);
        fetchCategories();
      } else {
        showToast(data.message || 'Failed to delete category.', 'error');
      }
    } catch {
      showToast('Network error while deleting category.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Menu Categories
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize food dishes and drinks into categorized menu groups.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Category
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
          placeholder="Search categories by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex items-center justify-center">
            <Loader size="lg" text="Loading Categories" subtitle="Fetching menu classifications..." />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No categories found. Click &quot;Add Category&quot;.
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                {/* Category Image Banner */}
                <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={cat.image || '/images/categories/default-category.png'}
                    alt={cat.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Actions on Banner */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {canUpdate && (
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-primary-600 shadow-sm transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setCatToDelete(cat);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-rose-600 shadow-sm transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2 text-white">
                    <div className="p-1.5 rounded-lg bg-primary-600/80 backdrop-blur-sm text-white">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold drop-shadow-sm truncate">{cat.name}</h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                    {cat.description || 'Appetizing selections curated for dining.'}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Order #{cat.sortOrder}</span>
                {cat.status === 'ACTIVE' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
                ) : (
                  <span className="text-rose-500 font-bold">○ Inactive</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Category: ${selectedCategory?.name}` : 'Add Menu Category'}
        subtitle="Specify category name, description, image, and display order"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Starters, Wood-Fired Pizzas, Mocktails"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Crispy bites, tandoori platters..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Category Banner Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img
                  src={formData.image || '/images/categories/default-category.png'}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/categories/starters.jpg or URL"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-primary-500"
                />
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-500 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
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
              {actionLoading ? 'Saving...' : isEditModalOpen ? 'Save Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Menu Category"
        message={`Are you sure you want to delete category "${catToDelete?.name}"? You can only delete categories that have no food items assigned.`}
        confirmText="Delete Category"
        isLoading={actionLoading}
      />
    </div>
  );
}
