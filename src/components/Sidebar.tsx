'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users2,
  ShieldCheck,
  UserCheck,
  CalendarCheck,
  CircleDollarSign,
  UtensilsCrossed,
  CalendarDays,
  Clock,
  MenuSquare,
  Layers,
  ShoppingBag,
  UserSquare2,
  ReceiptText,
  BarChart3,
  Sparkles,
  ChevronRight,
  LogOut,
  X,
  Sliders,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, hasPermission, logout } = useAuth();

  // Navigation Items with Permission Guards
  const navSections = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          show: true,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          name: 'Managers',
          href: '/dashboard/managers',
          icon: Users2,
          show: isAdmin,
          badge: 'Admin',
        },
        {
          name: 'Roles & RBAC',
          href: '/dashboard/roles',
          icon: ShieldCheck,
          show: isAdmin,
          badge: 'Admin',
        },
        {
          name: 'Staff Directory',
          href: '/dashboard/staff',
          icon: UserCheck,
          show: isAdmin || hasPermission('staff.view'),
        },
        {
          name: 'Attendance',
          href: '/dashboard/attendance',
          icon: CalendarCheck,
          show: isAdmin || hasPermission('attendance.view'),
        },
        {
          name: 'Salary Management',
          href: '/dashboard/salary',
          icon: CircleDollarSign,
          show: isAdmin || hasPermission('salary.view'),
        },
      ],
    },
    {
      title: 'Restaurant Operations',
      items: [
        {
          name: 'Tables Layout',
          href: '/dashboard/tables',
          icon: UtensilsCrossed,
          show: isAdmin || hasPermission('tables.view'),
        },
        {
          name: 'Reservations',
          href: '/dashboard/reservations',
          icon: CalendarDays,
          show: isAdmin || hasPermission('reservations.view'),
        },
        {
          name: 'Booking Timeline',
          href: '/dashboard/reservations/timeline',
          icon: Clock,
          show: isAdmin || hasPermission('reservations.view'),
          badge: 'Chart',
        },
        {
          name: 'Categories',
          href: '/dashboard/categories',
          icon: Layers,
          show: isAdmin || hasPermission('menu.view'),
        },
        {
          name: 'Food Menu',
          href: '/dashboard/menu',
          icon: MenuSquare,
          show: isAdmin || hasPermission('menu.view'),
        },
        {
          name: 'Live Orders / POS',
          href: '/dashboard/orders',
          icon: ShoppingBag,
          show: isAdmin || hasPermission('orders.view'),
        },
        {
          name: 'Customers',
          href: '/dashboard/customers',
          icon: UserSquare2,
          show: isAdmin || hasPermission('customers.view'),
        },
        {
          name: 'Billing & Payments',
          href: '/dashboard/billing',
          icon: ReceiptText,
          show: isAdmin || hasPermission('billing.view'),
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          name: 'Reports & Analytics',
          href: '/dashboard/reports',
          icon: BarChart3,
          show: isAdmin || hasPermission('reports.view'),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:relative top-2.5 bottom-2.5 lg:top-0 lg:bottom-0 left-2.5 lg:left-0 z-50 lg:z-20 w-60 h-[calc(100vh-1.25rem)] lg:h-full rounded-[28px] bg-transparent backdrop-blur-md text-slate-800 dark:text-slate-100 flex flex-col border border-slate-200/80 dark:border-white/[0.08] shadow-2xl shadow-black/40 transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="py-2  flex items-center justify-between px-3">
          

          <Link href="/dashboard" className="w-full  px-2 flex items-center justify-between ">
          <span className=''>
                        <UtensilsCrossed className="w-7 h-7" />
          </span>
            
        
            <div className=' w-fit '>
              <div className=" w-fit text-center font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className=''>
                Restra Suite
                </span>
                <span className="border px-2 py-1 rounded-full border-slate-400/60 text-[8px] flex item-center justify-center font-black uppercase tracking-wider bg-primary-500/20 text-primary-600 dark:text-primary-400 ">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Restaurant Management
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((i) => i.show);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                  {section.title}
                </p>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose()}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="text-[10px] flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {/* {item.badge ? (
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-primary-600 dark:text-primary-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isActive ? 'opacity-100 text-white' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                      )} */}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Separate Settings & Theme Mode Bar (Independent, No active orange styling) */}
        <div className="px-3.5 py-2.5 border-t border-slate-200/60 dark:border-white/[0.06] bg-white/30 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
          <Link
            href="/dashboard/settings"
            onClick={() => onClose()}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.08] transition-all group"
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:rotate-45 transition-transform duration-300" />
            <span>Settings</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="p-4 border-t border-slate-200/60 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-sm text-primary-500 shrink-0">
                <img
                  src={user?.avatar || '/images/staff/admin-avatar.jpg'}
                  alt={user?.name || 'User'}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('unsplash')) {
                      target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    {isAdmin ? 'System Admin' : user?.roleDetails?.name || 'Manager'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Logout session"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
