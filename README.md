# 🍽️ Restra Suite - Full-Stack Restaurant & Staff Management System

A production-grade, college final-year level **Restaurant Management System** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB**, **Mongoose**, **JWT Authentication**, and **Granular Role-Based Access Control (RBAC)**.

---

## 🌟 Key Modules & Features

### 1. 🔐 Authentication & Granular RBAC
- **Strict Role-Based Access Control**:
  - **ADMIN Account**: Universal system privileges over all modules, roles, managers, staff, billing, menu, and financial reports.
  - **MANAGER Accounts**: Access strictly limited to permissions assigned by the Admin to the Manager's role (e.g., `staff.view`, `attendance.manage`, `tables.create`, `menu.update`, `billing.manage`, etc.).
  - **STAFF Members**: Staff members are stored in the database for operational duties and attendance/salary management and **do not have dashboard login access**.
- **Backend API Guards**: Middleware guards (`validateApiAuth`) enforce security and permissions directly at the API Route Handler level (not just UI hiding).
- **JWT Authentication** stored in secure **HTTP-Only Cookies** and password hashing via **bcryptjs**.

### 2. 👨‍💼 Manager & Role Governance (Admin Only)
- **Role Creator & Permission Matrix**: Admin can create custom roles (e.g. *Floor Manager*, *Kitchen & Order Manager*, *Cashier*) and check/uncheck granular permissions across 10 distinct modules.
- **Manager Management**: Create, edit, assign roles, activate/deactivate, or delete managers.

### 3. 👥 Staff Management
- Complete staff directory with details: Full Name, Contact Number, Email, Address, Gender, Date of Birth, Joining Date, Department (*Kitchen, Waiter, Reception, Housekeeping, Cleaning, Security, Cashier, Other*), Designation (*Chef, Assistant Chef, Waiter, Cashier, Receptionist, Cleaner, Security Guard, Helper*), Base Salary, Emergency Contact, Status (*Active, Inactive, On Leave, Terminated*), and Notes.
- Local avatar image upload support (`/public/images/staff`).

### 4. 📅 Staff Attendance Management
- Mark staff daily status: **Present**, **Absent**, **Half Day** (0.5 wage), **Leave** (Paid/Approved).
- Real-time counters: Present Today, Absent Today, On Leave, Total Staff.
- Unique compound indexing `{ staffId: 1, date: 1 }` prevents duplicate records per employee per date.
- 1-click **Bulk Attendance** action to mark all active staff present.

### 5. 💰 Automated Salary & Payroll Management
- Monthly salary auto-computation engine integrating:
  $$\text{Effective Payable Days} = \text{Present Days} + \text{Leave Days} + (\text{Half Days} \times 0.5)$$
  $$\text{Net Salary} = \left(\frac{\text{Basic Salary}}{\text{Working Days}} \times \text{Effective Days}\right) + \text{Bonus} - \text{Deduction}$$
- Track **Pending** vs **Disbursed (Paid)** payrolls with payment timestamps.
- Adjust bonuses and deductions with automated recalculation.

### 6. 🪑 Restaurant Tables & Floor Plan
- Manage dining tables with guest capacity, seating sections (*Indoor, Outdoor, Rooftop, VIP, Bar, Terrace*), and live statuses (*AVAILABLE, RESERVED, OCCUPIED, CLEANING, INACTIVE*).
- Interactive card layout with live status selectors.

### 7. 📖 Table Booking & Overlap Prevention
- Create reservations with guest count, contact details, date, and hourly time slots.
- **Critical Overlap Prevention Engine**: Prevents double-booking by verifying:
  $$(\text{New Start Time} < \text{Existing End Time}) \land (\text{New End Time} > \text{Existing Start Time})$$
- Auto-updates table status to `OCCUPIED` upon seating and auto-links customer visit history.

### 8. ⏱️ Visual Table Booking Timeline Grid
- Time-slotted visual grid from **10:00 AM to 10:00 PM** across all tables.
- Color-coded hourly occupancy indicators:
  - 🟢 **Available Open Slot**
  - 🟡 **Reserved / Booked Slot**
  - 🔴 **Seated / Occupied Slot**
- Quick date switching (*Today*, *Tomorrow*, or any selected date).

### 9. 🍲 Menu & Categories Management
- Food categories with banners, descriptions, and sort orders.
- Food items with category allocation, pricing, prep time, veg/non-veg dietary tags (**VEG**, **NON_VEG**, **EGG**), and instant **In Stock / Out of Stock** toggles.
- Local food dish image upload (`/public/images/food`).

### 10. 👤 Customer Directory & Lifetime Analytics
- Track customer dining frequency, lifetime spending, last visit date, and special dietary preferences.
- Aggregated customer profile modal displaying previous order and reservation histories.

### 11. 🛍️ Live Orders & POS (Point-of-Sale)
- Order placement for **Dine-In**, **Takeaway**, and **Delivery**.
- Live order status workflow: `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `SERVED` $\rightarrow$ `COMPLETED`.
- Multi-item order builder with automated 5% GST tax calculation and instant bill generation.

### 12. 🧾 Billing, Cash Payments & Receipt Invoicing
- Itemized restaurant tax invoice generation with bill numbers (`BILL-YYYY-XXXX`).
- Full support for **Cash Payments**, **UPI / QR**, and **Cards**.
- Printable Tax Invoice Receipt with restaurant header, GST number, item breakdown, and totals.
- Marking payment as **PAID** automatically sets order to `COMPLETED`, frees dining table to `AVAILABLE`, and records customer lifetime spend.

### 13. 📊 Dashboard Analytics & Reports
- Role-filtered statistics and KPI metrics.
- Visual charts using **Recharts**:
  - **7-Day Revenue & Sales Trend** (Area Chart)
  - **Order Volume Breakdown** (Bar Chart)
  - **Top-Selling Menu Items** (Leaderboard)
  - **Floor Table Occupancy & Staff Attendance Distribution**
- Exportable & printable financial, booking, and attendance reports.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 🔑 Quick Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@restra.com` | `admin123` | Universal Full Access |
| **General Manager** | `manager@restra.com` | `manager123` | All Restaurant & Staff Modules |
| **Floor Manager** | `floor@restra.com` | `floor123` | Tables, Bookings, Customers, Attendance |

> *Tip: You can also click the **"Quick Demo Accounts"** or **"Quick Demo Seed"** buttons on the login screen or dashboard header to auto-populate the database.*

---

## 🚀 Getting Started

### 1. Environment Configuration
Verify your MongoDB connection in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/restra_db
JWT_SECRET=super_secret_restra_jwt_key_2026_restaurant_system_production_key
NEXT_PUBLIC_APP_NAME="Grandeur Restaurant & Staff Management"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Production Bundle
```bash
npm run build
npm start
```
