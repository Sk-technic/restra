'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  UtensilsCrossed,
  IndianRupee,
  Clock,
  Trash2,
  Edit2,
  ReceiptText,
  CheckCircle2,
  ChefHat,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Loader } from '@/components/Loader';
import { useRouter } from 'next/navigation';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SERVED',
  'COMPLETED',
  'CANCELLED',
];

export default function OrdersPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const canCreate = isAdmin || hasPermission('orders.create');
  const canUpdate = isAdmin || hasPermission('orders.update');
  const canDelete = isAdmin || hasPermission('orders.delete');
  const canBill = isAdmin || hasPermission('billing.create');

  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [search, setSearch] = useState('');

  // POS Order Modal State
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

  // New Order Cart Form State
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [tableId, setTableId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cartItems, setCartItems] = useState<{ foodItemId: string; name: string; price: number; quantity: number; notes?: string }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // POS Catalog Menu Filters
  const [menuSearch, setMenuSearch] = useState('');
  const [activeMenuCat, setActiveMenuCat] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/orders?search=${encodeURIComponent(search)}`;
      if (selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;
      if (selectedType !== 'ALL') url += `&orderType=${selectedType}`;

      const [ordersRes, tablesRes, menuRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/tables'),
        fetch('/api/menu?isAvailable=true'),
        fetch('/api/categories'),
      ]);

      const ordersData = await ordersRes.json();
      const tablesData = await tablesRes.json();
      const menuData = await menuRes.json();
      const catData = await catRes.json();

      if (ordersData.success) setOrders(ordersData.orders || []);
      if (tablesData.success) {
        setTables(tablesData.tables || []);
        if (tablesData.tables?.length > 0 && !tableId) {
          setTableId(tablesData.tables[0]._id);
        }
      }
      if (menuData.success) setMenuItems(menuData.items || []);
      if (catData.success) setCategories(catData.categories || []);
    } catch {
      showToast('Failed to load orders and POS catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedType, tableId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenPos = () => {
    setCartItems([]);
    setDiscount(0);
    setNotes('');
    setCustomerName('Walk-in Guest');
    setCustomerPhone('');
    setOrderType('DINE_IN');
    setTableId(tables[0]?._id || '');
    setIsPosOpen(true);
  };

  const handleAddToCart = (food: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.foodItemId === food._id);
      if (existing) {
        return prev.map((i) =>
          i.foodItemId === food._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          foodItemId: food._id,
          name: food.name,
          price: food.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (foodItemId: string, change: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.foodItemId === foodItemId) {
            const newQty = i.quantity + change;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as any
    );
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    if (!canUpdate) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status marked as ${status}`, 'success');
        fetchData();
      }
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showToast('Please add at least one food dish to the order.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType,
          tableId: orderType === 'DINE_IN' ? tableId : null,
          customerName,
          customerPhone,
          items: cartItems,
          discount,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Order placed successfully!', 'success');
        setIsPosOpen(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to place order.', 'error');
      }
    } catch {
      showToast('Network error while creating order.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateBill = async (orderId: string) => {
    try {
      const res = await fetch('/api/billing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Bill generated! Redirecting to Billing Desk...', 'success');
        router.push('/dashboard/billing');
      } else {
        showToast(data.message || 'Failed to generate bill.', 'error');
      }
    } catch {
      showToast('Error generating bill.', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/orders/${orderToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order cancelled and deleted.', 'success');
        setDeleteConfirmOpen(false);
        setOrderToDelete(null);
        fetchData();
      } else {
        showToast(data.message || 'Failed to delete order.', 'error');
      }
    } catch {
      showToast('Network error while deleting.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Subtotals
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartGrandTotal = Math.max(0, cartSubtotal + cartTax - Number(discount || 0));

  const filteredCatalog = menuItems.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      m.description?.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat =
      activeMenuCat === 'ALL' ||
      m.categoryId?._id === activeMenuCat ||
      m.categoryId === activeMenuCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Restaurant Orders & POS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time kitchen order ticketing (KOT), live status updates, and point-of-sale order placement.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenPos}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Place New Order (POS)
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Order Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">All Order Types</option>
            <option value="DINE_IN">Dine-In Orders</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Home Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 flex items-center justify-center">
            <Loader size="lg" text="Loading Orders" subtitle="Fetching live POS and kitchen ticket queues..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No orders found matching criteria. Click &quot;Place New Order&quot;.
          </div>
        ) : (
          orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ord.orderType}
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {ord.orderNumber}
                    </h3>
                  </div>

                  <select
                    value={ord.status}
                    disabled={!canUpdate}
                    onChange={(e) => handleStatusUpdate(ord._id, e.target.value)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border focus:outline-none ${
                      ord.status === 'PREPARING'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : ord.status === 'READY' || ord.status === 'SERVED'
                        ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                        : ord.status === 'COMPLETED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Table & Customer Info */}
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {ord.tableId ? `Table: ${ord.tableId.tableNumber} (${ord.tableId.section})` : 'Takeaway / Counter'}
                  </p>
                  <p>Customer: {ord.customerName} {ord.customerPhone ? `(${ord.customerPhone})` : ''}</p>
                </div>

                {/* Items List */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {ord.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {ord.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl italic">
                    Note: &quot;{ord.notes}&quot;
                  </p>
                )}
              </div>

              {/* Total & Quick Bill Trigger */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Grand Total (Inc Tax):</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    ₹{ord.total?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {canBill && ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleGenerateBill(ord._id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                    >
                      <ReceiptText className="w-3.5 h-3.5" /> Generate Bill
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => {
                        setOrderToDelete(ord);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Cancel Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POS Order Placement Modal */}
      <Modal
        isOpen={isPosOpen}
        onClose={() => setIsPosOpen(false)}
        title="Point-of-Sale (POS) Order Placement"
        subtitle="Select dishes from menu catalog, adjust quantities and allocate table"
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Menu Catalog Selector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dish to add..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <select
                value={activeMenuCat}
                onChange={(e) => setActiveMenuCat(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dishes Catalog List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredCatalog.map((food) => (
                <div
                  key={food._id}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-primary-500/50 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Dish Image Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200/60 dark:border-slate-700">
                      <img
                        src={food.image || '/images/food/default-food.png'}
                        alt={food.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-1 left-1 w-2 h-2 rounded-full ring-1 ring-white ${
                          food.foodType === 'VEG'
                            ? 'bg-emerald-500'
                            : food.foodType === 'NON_VEG'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {food.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                        ₹{food.price} • {food.preparationTime}m prep
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(food)}
                    className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shrink-0 shadow-sm transition-all active:scale-95"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Details & Cart summary */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                  >
                    <option value="DINE_IN">Dine-In</option>
                    <option value="TAKEAWAY">Takeaway</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>

                {orderType === 'DINE_IN' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Dining Table *
                    </label>
                    <select
                      value={tableId}
                      onChange={(e) => setTableId(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                    >
                      {tables.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.tableNumber} ({t.section})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Guest Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Ordered Dishes ({cartItems.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cartItems.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No dishes in order yet.</p>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.foodItemId}
                        className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl text-xs"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.foodItemId, -1)}
                              className="px-1.5 font-bold hover:text-rose-500"
                            >
                              -
                            </button>
                            <span className="px-1 font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.foodItemId, 1)}
                              className="px-1.5 font-bold hover:text-emerald-500"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bill Math Summary */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>5% GST Tax:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{cartTax}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Discount (₹):</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    min={0}
                    className="w-20 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right font-bold text-xs"
                  />
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-primary-600 dark:text-primary-400">₹{cartGrandTotal}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={actionLoading || cartItems.length === 0}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all disabled:opacity-50"
            >
              {actionLoading ? 'Placing Order...' : 'Send Order to Kitchen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteOrder}
        title="Cancel Restaurant Order"
        message={`Are you sure you want to cancel order "${orderToDelete?.orderNumber}"?`}
        confirmText="Cancel Order"
        isLoading={actionLoading}
      />
    </div>
  );
}
