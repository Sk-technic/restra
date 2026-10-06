'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MenuSquare,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';

export default function MenuPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const canCreate = isAdmin || hasPermission('menu.create');
  const canUpdate = isAdmin || hasPermission('menu.update');
  const canDelete = isAdmin || hasPermission('menu.delete');

  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFoodType, setSelectedFoodType] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: 250,
    image: '/images/food/default-food.png',
    foodType: 'VEG',
    isAvailable: true,
    preparationTime: 15,
    status: 'ACTIVE',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/menu?search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'ALL') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedFoodType !== 'ALL') url += `&foodType=${encodeURIComponent(selectedFoodType)}`;
      if (selectedAvailability !== 'ALL') url += `&isAvailable=${selectedAvailability === 'AVAILABLE'}`;

      const [foodRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/categories'),
      ]);

      const foodData = await foodRes.json();
      const catData = await catRes.json();

      if (foodData.success) setFoodItems(foodData.items || []);
      if (catData.success) {
        setCategories(catData.categories || []);
        if (catData.categories?.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catData.categories[0]._id }));
        }
      }
    } catch {
      showToast('Failed to load menu items.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedFoodType, selectedAvailability, formData.categoryId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('folder', 'food');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        showToast('Food dish image uploaded!', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch {
      showToast('Error uploading image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleAvailability = async (item: any) => {
    if (!canUpdate) return;
    try {
      const res = await fetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `${item.name} is now ${!item.isAvailable ? 'AVAILABLE (In Stock)' : 'OUT OF STOCK'}`,
          'success'
        );
        fetchData();
      }
    } catch {
      showToast('Failed to toggle availability.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?._id || '',
      price: 250,
      image: '/images/food/default-food.png',
      foodType: 'VEG',
      isAvailable: true,
      preparationTime: 15,
      status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSelectedFood(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      categoryId: item.categoryId?._id || item.categoryId || categories[0]?._id || '',
      price: item.price,
      image: item.image || '/images/food/default-food.png',
      foodType: item.foodType || 'VEG',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      preparationTime: item.preparationTime || 15,
      status: item.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || formData.price === undefined) {
      showToast('Food name, category, and price are required.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const isEdit = Boolean(selectedFood);
      const url = isEdit ? `/api/menu/${selectedFood._id}` : '/api/menu';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? 'Food item updated!' : 'Food item added to menu!', 'success');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to save food item.', 'error');
      }
    } catch {
      showToast('Network error while saving.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!foodToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/menu/${foodToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Food item removed from menu.', 'success');
        setDeleteConfirmOpen(false);
        setFoodToDelete(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to delete item.', 'error');
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
            Restaurant Food Menu Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain dish descriptions, pricing, preparation times, veg/non-veg classifications, and instant availability.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish or ingredients..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedFoodType}
            onChange={(e) => setSelectedFoodType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Dietary Types</option>
            <option value="VEG">Vegetarian (Pure Veg)</option>
            <option value="NON_VEG">Non-Vegetarian</option>
            <option value="EGG">Contains Egg</option>
          </select>
        </div>

        <div>
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="AVAILABLE">In Stock (Available)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex items-center justify-center">
            <Loader size="lg" text="Loading Food Menu" subtitle="Fetching fresh culinary items & recipes..." />
          </div>
        ) : foodItems.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            No food items found matching criteria. Click &quot;Add Food Item&quot;.
          </div>
        ) : (
          foodItems.map((item) => (
            <div
              key={item._id}
              className={`group relative h-[440px] rounded-[32px] p-3.5 bg-white dark:bg-slate-900 border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl hover:shadow-primary-500/10 cursor-pointer overflow-hidden flex flex-col justify-between transform-gpu ${
                item.isAvailable
                  ? 'border-slate-200/90 dark:border-slate-800'
                  : 'border-rose-300/80 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
              }`}
            >
              {/* Image Container with Smooth Expand on Hover */}
              <div className="food-card-img-wrapper absolute inset-x-3.5 top-3.5 h-56 rounded-[24px] overflow-hidden group-hover:inset-0 group-hover:h-full group-hover:rounded-[32px] z-0 transform-gpu">
                <img
                  src={item.image || '/images/food/default-food.png'}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                  }}
                  className="food-card-img w-full h-full object-cover transform-gpu scale-100 transition duration-300 group-hover:scale-105"
                />

                {/* Default subtle gradient */}
                <div className="food-card-overlay absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent group-hover:opacity-0" />

                {/* Hover full-bleed dark gradient overlay */}
                <div className="food-card-overlay absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25 opacity-0 group-hover:opacity-100" />
              </div>

              {/* Floating Top Badges Layer */}
              <div className="relative z-10 flex items-center justify-between w-full p-1.5 pointer-events-none">
                {/* Dietary Type Badge */}
                <div className="bg-white/90 dark:bg-slate-900/90 group-hover:bg-black/40 backdrop-blur-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto">
                  <span
                    className={`inline-flex items-center justify-center w-3 h-3 rounded-sm border ${
                      item.foodType === 'VEG'
                        ? 'border-emerald-500 text-emerald-500'
                        : item.foodType === 'NON_VEG'
                        ? 'border-rose-500 text-rose-500'
                        : 'border-amber-400 text-amber-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.foodType === 'VEG'
                          ? 'bg-emerald-500'
                          : item.foodType === 'NON_VEG'
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}
                    />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 group-hover:text-white transition-colors duration-500">
                    {item.foodType}
                  </span>
                </div>

                {/* Category Pill & Quick Action Buttons */}
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <span className="bg-black/40 group-hover:bg-white/20 backdrop-blur-md text-white border border-white/15 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {item.categoryId?.name || 'Dish'}
                  </span>

                  {canUpdate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 group-hover:bg-white/25 text-slate-700 dark:text-slate-200 group-hover:text-white backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
                      title="Edit Dish"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFoodToDelete(item);
                        setDeleteConfirmOpen(true);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 group-hover:bg-white/25 text-slate-700 dark:text-slate-200 group-hover:text-rose-400 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Content Area */}
              <div className="relative z-10 mt-auto pt-4 flex flex-col justify-end transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu">
                {/* Dish Name */}
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-white transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] tracking-tight line-clamp-1">
                  {item.name}
                </h3>

                {/* Subtitle / Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] mt-1 line-clamp-1 group-hover:line-clamp-2">
                  {item.description || 'Crafted fresh with signature authentic ingredients.'}
                </p>

                {/* Metadata Row: Price & Prep Time & Stock Status */}
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center text-slate-900 dark:text-white group-hover:text-white text-base font-extrabold transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 group-hover:text-white/90 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      <Clock className="w-3.5 h-3.5 text-primary-500 group-hover:text-primary-400 transition-colors duration-500" />
                      <span>{item.preparationTime || 15} min</span>
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      item.isAvailable
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-500/20 group-hover:text-emerald-300'
                        : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 group-hover:bg-rose-500/20 group-hover:text-rose-300'
                    }`}
                  >
                    ● {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Bottom Action Row: Pill Button + Circular Action Button */}
                <div className="mt-3.5 flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (canUpdate) handleOpenEdit(item);
                    }}
                    className="flex-1 py-3 px-5 rounded-full text-xs font-bold tracking-wide transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 text-white group-hover:bg-white group-hover:text-slate-950 group-hover:shadow-lg group-hover:shadow-white/10 active:scale-95 shadow-sm"
                  >
                    <span>Manage Dish</span>
                    <Edit2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAvailability(item);
                    }}
                    className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 hover:scale-105 active:scale-90 ${
                      item.isAvailable
                        ? 'border-slate-200 dark:border-slate-700/80 text-emerald-500 group-hover:border-white/30 group-hover:bg-white/20 group-hover:text-emerald-300 group-hover:backdrop-blur-md'
                        : 'border-rose-200 dark:border-rose-800 text-rose-500 group-hover:border-white/30 group-hover:bg-white/20 group-hover:text-rose-300 group-hover:backdrop-blur-md'
                    }`}
                    title={item.isAvailable ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                  >
                    {item.isAvailable ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Food Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? `Edit Food: ${selectedFood?.name}` : 'Add New Food Item to Menu'}
        subtitle="Set culinary category, pricing, dietary symbol and availability"
      >
        <form onSubmit={handleSaveFood} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Food Dish Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Butter Chicken Royale"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Dietary Type *
              </label>
              <select
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="VEG">Vegetarian (VEG)</option>
                <option value="NON_VEG">Non-Vegetarian (NON-VEG)</option>
                <option value="EGG">Contains Egg (EGG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Preparation Time (Minutes)
              </label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                min={1}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Availability Status
              </label>
              <select
                value={formData.isAvailable ? 'available' : 'out_of_stock'}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'available' })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:border-primary-500"
              >
                <option value="available">In Stock (Available)</option>
                <option value="out_of_stock">Out of Stock (Disabled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Description & Ingredients
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Fresh tomato cashew cream gravy, aromatic spices..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Food Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                <img
                  src={formData.image || '/images/food/default-food.png'}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/food/butter-chicken.jpg or URL"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-primary-500"
                />
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-500 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'Uploading image...' : 'Upload Local Image'}</span>
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
              {actionLoading ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Add to Menu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteFood}
        title="Delete Food Item"
        message={`Are you sure you want to permanently remove "${foodToDelete?.name}" from the menu?`}
        confirmText="Delete Food Item"
        isLoading={actionLoading}
      />
    </div>
  );
}
