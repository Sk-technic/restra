export type UserRoleType = 'ADMIN' | 'MANAGER';

export interface IPermissionItem {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface IRole {
  _id?: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRoleType;
  roleId?: string | IRole;
  phone?: string;
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IStaff {
  _id?: string;
  fullName: string;
  profileImage?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  joiningDate: string;
  department: string;
  designation: string;
  salary: number;
  emergencyContact?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export interface IAttendance {
  _id?: string;
  staffId: string | IStaff;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  notes?: string;
  markedBy: string | IUser;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED';

export interface ISalary {
  _id?: string;
  staffId: string | IStaff;
  month: number; // 1-12
  year: number;
  basicSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  deduction: number;
  bonus: number;
  netSalary: number;
  paymentStatus: 'PENDING' | 'PAID';
  paidAt?: string;
  paidBy?: string | IUser;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'INACTIVE';
export type TableSection = 'Indoor' | 'Outdoor' | 'Rooftop' | 'VIP' | 'Bar' | 'Terrace';

export interface ITable {
  _id?: string;
  tableNumber: string;
  capacity: number;
  section: TableSection | string;
  status: TableStatus;
  notes?: string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface IReservation {
  _id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  numberOfGuests: number;
  tableId: string | ITable;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. 19:00)
  endTime: string; // HH:mm (e.g. 21:00)
  status: ReservationStatus;
  notes?: string;
  createdBy?: string | IUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMenuCategory {
  _id?: string;
  name: string;
  image?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';

export interface IFoodItem {
  _id?: string;
  name: string;
  description?: string;
  categoryId: string | IMenuCategory;
  price: number;
  image?: string;
  foodType: FoodType;
  isAvailable: boolean;
  preparationTime?: number; // in minutes
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface ICustomer {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  profileImage?: string;
  totalVisits: number;
  totalOrders: number;
  totalSpent: number;
  lastVisit?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

export interface IOrderItem {
  foodItemId: string | IFoodItem;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface IOrder {
  _id?: string;
  orderNumber: string;
  customerId?: string | ICustomer;
  customerName?: string;
  customerPhone?: string;
  tableId?: string | ITable;
  orderType: OrderType;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdBy?: string | IUser;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'OTHER';

export interface IPayment {
  _id?: string;
  billNumber: string;
  orderId: string | IOrder;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  generatedBy?: string | IUser;
  paidAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthTokenPayload {
  userId: string;
  email: string;
  role: UserRoleType;
  name: string;
  permissions: string[];
}
