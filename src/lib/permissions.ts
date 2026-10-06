export interface PermissionDef {
  id: string;
  name: string;
  module: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  // Staff Module
  { id: 'staff.view', name: 'View Staff', module: 'Staff', description: 'Can view staff list and details' },
  { id: 'staff.create', name: 'Create Staff', module: 'Staff', description: 'Can add new staff members' },
  { id: 'staff.update', name: 'Update Staff', module: 'Staff', description: 'Can edit staff information' },
  { id: 'staff.delete', name: 'Delete Staff', module: 'Staff', description: 'Can deactivate or delete staff' },

  // Attendance Module
  { id: 'attendance.view', name: 'View Attendance', module: 'Attendance', description: 'Can view daily and monthly attendance' },
  { id: 'attendance.manage', name: 'Manage Attendance', module: 'Attendance', description: 'Can mark, edit, and update attendance records' },

  // Salary Module
  { id: 'salary.view', name: 'View Salary', module: 'Salary', description: 'Can view salary structures and history' },
  { id: 'salary.manage', name: 'Manage Salary', module: 'Salary', description: 'Can generate, calculate, and mark salaries as paid' },

  // Tables Module
  { id: 'tables.view', name: 'View Tables', module: 'Tables', description: 'Can view restaurant tables layout and statuses' },
  { id: 'tables.create', name: 'Create Tables', module: 'Tables', description: 'Can add new tables' },
  { id: 'tables.update', name: 'Update Tables', module: 'Tables', description: 'Can modify table details, sections, and status' },
  { id: 'tables.delete', name: 'Delete Tables', module: 'Tables', description: 'Can delete or deactivate tables' },

  // Reservations Module
  { id: 'reservations.view', name: 'View Reservations', module: 'Reservations', description: 'Can view bookings and table timeline' },
  { id: 'reservations.create', name: 'Create Reservations', module: 'Reservations', description: 'Can create table bookings' },
  { id: 'reservations.update', name: 'Update Reservations', module: 'Reservations', description: 'Can edit or re-assign reservations' },
  { id: 'reservations.cancel', name: 'Cancel Reservations', module: 'Reservations', description: 'Can cancel reservations' },

  // Menu & Categories Module
  { id: 'menu.view', name: 'View Menu', module: 'Menu', description: 'Can view food items and categories' },
  { id: 'menu.create', name: 'Create Menu Items', module: 'Menu', description: 'Can add food items and categories' },
  { id: 'menu.update', name: 'Update Menu Items', module: 'Menu', description: 'Can edit food details, price, availability' },
  { id: 'menu.delete', name: 'Delete Menu Items', module: 'Menu', description: 'Can delete or deactivate food items' },

  // Orders Module
  { id: 'orders.view', name: 'View Orders', module: 'Orders', description: 'Can view live orders and history' },
  { id: 'orders.create', name: 'Create Orders', module: 'Orders', description: 'Can place new orders for dine-in and takeaway' },
  { id: 'orders.update', name: 'Update Orders', module: 'Orders', description: 'Can update order status and items' },
  { id: 'orders.delete', name: 'Cancel Orders', module: 'Orders', description: 'Can cancel orders' },

  // Billing Module
  { id: 'billing.view', name: 'View Billing', module: 'Billing', description: 'Can view bills and payments' },
  { id: 'billing.create', name: 'Generate Bills', module: 'Billing', description: 'Can create and print customer bills' },
  { id: 'billing.manage', name: 'Manage Payments', module: 'Billing', description: 'Can accept cash/online payments and complete bills' },

  // Customers Module
  { id: 'customers.view', name: 'View Customers', module: 'Customers', description: 'Can view customer directory and history' },
  { id: 'customers.create', name: 'Create Customers', module: 'Customers', description: 'Can add customer records' },
  { id: 'customers.update', name: 'Update Customers', module: 'Customers', description: 'Can edit customer details' },
  { id: 'customers.delete', name: 'Delete Customers', module: 'Customers', description: 'Can remove customer records' },

  // Reports Module
  { id: 'reports.view', name: 'View Reports', module: 'Reports', description: 'Can access analytical and financial reports' },
];

export const PERMISSION_MODULES = Array.from(new Set(ALL_PERMISSIONS.map(p => p.module)));

export const DEFAULT_ROLES_SEED = [
  {
    name: 'General Restaurant Manager',
    description: 'Full operational access to restaurant staff, tables, menu, reservations, orders, and billing.',
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  {
    name: 'Front Desk & Floor Manager',
    description: 'Manages reservations, tables, customer interactions, and attendance.',
    permissions: [
      'tables.view', 'tables.create', 'tables.update',
      'reservations.view', 'reservations.create', 'reservations.update', 'reservations.cancel',
      'customers.view', 'customers.create', 'customers.update',
      'attendance.view', 'attendance.manage',
      'orders.view', 'menu.view'
    ],
  },
  {
    name: 'Kitchen & Order Manager',
    description: 'Manages food menu items, kitchen staff, and kitchen orders queue.',
    permissions: [
      'menu.view', 'menu.create', 'menu.update', 'menu.delete',
      'orders.view', 'orders.update',
      'staff.view',
      'attendance.view'
    ],
  },
  {
    name: 'Cashier & Billing Desk',
    description: 'Manages order placement, bill generation, payments, and customer records.',
    permissions: [
      'orders.view', 'orders.create', 'orders.update',
      'billing.view', 'billing.create', 'billing.manage',
      'customers.view', 'customers.create',
      'menu.view', 'tables.view'
    ],
  }
];

export function hasPermission(userRole: string, userPermissions: string[] | undefined, requiredPermission?: string): boolean {
  if (userRole === 'ADMIN') return true;
  if (!requiredPermission) return true;
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.includes(requiredPermission);
}
