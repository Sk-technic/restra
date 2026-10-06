import { connectToDatabase } from './db';
import {
  User,
  Role,
  Staff,
  Attendance,
  Salary,
  Table,
  Reservation,
  MenuCategory,
  FoodItem,
  Customer,
  Order,
  Payment,
} from '@/models';
import { hashPassword } from './auth';
import { ALL_PERMISSIONS, DEFAULT_ROLES_SEED } from './permissions';

export async function seedDatabase() {
  await connectToDatabase();

  // 1. Seed Roles
  const existingRolesCount = await Role.countDocuments();
  let createdRoles = [];
  if (existingRolesCount === 0) {
    createdRoles = await Role.insertMany(
      DEFAULT_ROLES_SEED.map((r, i) => ({
        ...r,
        isSystemRole: i === 0,
      }))
    );
  } else {
    createdRoles = await Role.find();
  }

  const generalManagerRole = createdRoles.find(r => r.name.includes('General')) || createdRoles[0];
  const floorManagerRole = createdRoles.find(r => r.name.includes('Floor')) || createdRoles[0];

  // 2. Seed Admin & Managers
  const existingAdmin = await User.findOne({ email: 'admin@restra.com' });
  let adminUser = existingAdmin;
  if (!existingAdmin) {
    const adminPasswordHash = await hashPassword('admin123');
    adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@restra.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      isActive: true,
      avatar: '/images/staff/admin-avatar.png',
    });
  }

  const existingManager = await User.findOne({ email: 'manager@restra.com' });
  let managerUser = existingManager;
  if (!existingManager) {
    const managerPasswordHash = await hashPassword('manager123');
    managerUser = await User.create({
      name: 'Rajesh Sharma (Restaurant Manager)',
      email: 'manager@restra.com',
      password: managerPasswordHash,
      role: 'MANAGER',
      roleId: generalManagerRole._id,
      phone: '+91 98123 45678',
      isActive: true,
      avatar: '/images/staff/manager-avatar.png',
    });
  }

  const existingFloorManager = await User.findOne({ email: 'floor@restra.com' });
  if (!existingFloorManager) {
    const floorPasswordHash = await hashPassword('floor123');
    await User.create({
      name: 'Pooja Verma (Floor Manager)',
      email: 'floor@restra.com',
      password: floorPasswordHash,
      role: 'MANAGER',
      roleId: floorManagerRole._id,
      phone: '+91 98234 56789',
      isActive: true,
      avatar: '/images/staff/manager2-avatar.png',
    });
  }

  // 3. Seed Staff Members
  const staffCount = await Staff.countDocuments();
  let staffDocs = [];
  if (staffCount === 0) {
    const initialStaff = [
      {
        fullName: 'Vikram Malhotra',
        mobileNumber: '9871122334',
        email: 'vikram.m@restra.com',
        address: 'Flat 402, Royal Palms, Sector 18',
        gender: 'MALE',
        dateOfBirth: '1992-05-14',
        joiningDate: '2023-01-15',
        department: 'Kitchen',
        designation: 'Chef',
        salary: 45000,
        emergencyContact: '9871199999 (Brother)',
        status: 'ACTIVE',
        notes: 'Executive chef specializing in North Indian & Continental.',
      },
      {
        fullName: 'Aman Deep',
        mobileNumber: '9872233445',
        email: 'aman.d@restra.com',
        address: 'B-12, Green Avenue, Lake View',
        gender: 'MALE',
        dateOfBirth: '1996-08-22',
        joiningDate: '2023-06-01',
        department: 'Kitchen',
        designation: 'Assistant Chef',
        salary: 28000,
        emergencyContact: '9872288888 (Father)',
        status: 'ACTIVE',
        notes: 'Chinese & Tandoor specialist.',
      },
      {
        fullName: 'Sunita Nair',
        mobileNumber: '9873344556',
        email: 'sunita.n@restra.com',
        address: '34/A, Model Town',
        gender: 'FEMALE',
        dateOfBirth: '1998-11-03',
        joiningDate: '2023-09-10',
        department: 'Reception',
        designation: 'Receptionist',
        salary: 24000,
        emergencyContact: '9873377777 (Mother)',
        status: 'ACTIVE',
        notes: 'Front desk coordinator and guest relations.',
      },
      {
        fullName: 'Rohan Joshi',
        mobileNumber: '9874455667',
        email: 'rohan.j@restra.com',
        address: '78, Shanti Nagar',
        gender: 'MALE',
        dateOfBirth: '1999-04-19',
        joiningDate: '2024-02-01',
        department: 'Waiter',
        designation: 'Waiter',
        salary: 18000,
        emergencyContact: '9874466666 (Uncle)',
        status: 'ACTIVE',
        notes: 'Floor table attendant - Section A.',
      },
      {
        fullName: 'Kavita Singh',
        mobileNumber: '9875566778',
        email: 'kavita.s@restra.com',
        address: '92, Central Residency',
        gender: 'FEMALE',
        dateOfBirth: '1997-07-29',
        joiningDate: '2023-11-15',
        department: 'Cashier',
        designation: 'Cashier',
        salary: 22000,
        emergencyContact: '9875555555 (Spouse)',
        status: 'ACTIVE',
        notes: 'Main billing counter operator.',
      },
      {
        fullName: 'Ramesh Kumar',
        mobileNumber: '9876677889',
        address: 'Plot 10, Metro Colony',
        gender: 'MALE',
        dateOfBirth: '1988-02-10',
        joiningDate: '2022-08-01',
        department: 'Cleaning',
        designation: 'Cleaner',
        salary: 15000,
        emergencyContact: '9876644444 (Wife)',
        status: 'ACTIVE',
        notes: 'Dining area maintenance and cleaning.',
      },
      {
        fullName: 'Harpreet Singh',
        mobileNumber: '9877788990',
        address: 'Block C, Guru Nanak Enclave',
        gender: 'MALE',
        dateOfBirth: '1985-09-12',
        joiningDate: '2022-05-10',
        department: 'Security',
        designation: 'Security Guard',
        salary: 16500,
        emergencyContact: '9877733333 (Brother)',
        status: 'ACTIVE',
        notes: 'Main entrance security gate.',
      }
    ];

    staffDocs = await Staff.insertMany(initialStaff);
  } else {
    staffDocs = await Staff.find();
  }

  // 4. Seed Tables
  const tableCount = await Table.countDocuments();
  let tableDocs = [];
  if (tableCount === 0) {
    const initialTables = [
      { tableNumber: 'T-01', capacity: 2, section: 'Indoor', status: 'AVAILABLE', notes: 'Window corner couple table' },
      { tableNumber: 'T-02', capacity: 4, section: 'Indoor', status: 'OCCUPIED', notes: 'Near kitchen counter' },
      { tableNumber: 'T-03', capacity: 4, section: 'Indoor', status: 'AVAILABLE', notes: 'Main dining hall center' },
      { tableNumber: 'T-04', capacity: 6, section: 'Indoor', status: 'RESERVED', notes: 'Family booth' },
      { tableNumber: 'T-05', capacity: 8, section: 'Indoor', status: 'AVAILABLE', notes: 'Large family table' },
      { tableNumber: 'T-06', capacity: 2, section: 'Outdoor', status: 'AVAILABLE', notes: 'Garden terrace edge' },
      { tableNumber: 'T-07', capacity: 4, section: 'Outdoor', status: 'OCCUPIED', notes: 'Gazebo booth' },
      { tableNumber: 'T-08', capacity: 6, section: 'Outdoor', status: 'AVAILABLE', notes: 'Open patio seating' },
      { tableNumber: 'T-09', capacity: 4, section: 'Rooftop', status: 'RESERVED', notes: 'Skyline view table' },
      { tableNumber: 'T-10', capacity: 8, section: 'VIP', status: 'AVAILABLE', notes: 'Private luxury dining lounge' },
      { tableNumber: 'T-11', capacity: 2, section: 'Bar', status: 'AVAILABLE', notes: 'High-stool cocktail counter' },
      { tableNumber: 'T-12', capacity: 4, section: 'Terrace', status: 'CLEANING', notes: 'Under cleaning review' },
    ];
    tableDocs = await Table.insertMany(initialTables);
  } else {
    tableDocs = await Table.find();
  }

  // 5. Seed Menu Categories & Food Items
  const categoryCount = await MenuCategory.countDocuments();
  let categories = [];
  if (categoryCount === 0) {
    const initialCategories = [
      { name: 'Starters & Appetizers', description: 'Crispy bites and sizzling platters to kick off your meal', image: '/images/categories/starters.jpg', sortOrder: 1 },
      { name: 'Main Course', description: 'Rich curries, authentic breads and wholesome platters', image: '/images/categories/main-course.jpg', sortOrder: 2 },
      { name: 'Chinese & Pan-Asian', description: 'Noodles, fried rice, dim sums and fiery stir-fries', image: '/images/categories/chinese.jpg', sortOrder: 3 },
      { name: 'Pizza & Pasta', description: 'Wood-fired pizzas and creamy Italian delicacies', image: '/images/categories/pizza.jpg', sortOrder: 4 },
      { name: 'Burgers & Wraps', description: 'Gourmet stuffed burgers and toasted wraps', image: '/images/categories/burger.jpg', sortOrder: 5 },
      { name: 'Beverages & Mocktails', description: 'Fresh juices, smoothies, shakes and hot brews', image: '/images/categories/drinks.jpg', sortOrder: 6 },
      { name: 'Desserts & Sweets', description: 'Artisanal cakes, ice creams and traditional sweets', image: '/images/categories/desserts.jpg', sortOrder: 7 },
    ];
    categories = await MenuCategory.insertMany(initialCategories);
  } else {
    categories = await MenuCategory.find();
  }

  const foodCount = await FoodItem.countDocuments();
  let foodDocs = [];
  if (foodCount === 0) {
    const startersCat = categories.find(c => c.name.includes('Starters')) || categories[0];
    const mainCat = categories.find(c => c.name.includes('Main')) || categories[0];
    const chineseCat = categories.find(c => c.name.includes('Chinese')) || categories[0];
    const pizzaCat = categories.find(c => c.name.includes('Pizza')) || categories[0];
    const burgerCat = categories.find(c => c.name.includes('Burgers')) || categories[0];
    const drinksCat = categories.find(c => c.name.includes('Beverages')) || categories[0];
    const dessertCat = categories.find(c => c.name.includes('Desserts')) || categories[0];

    const initialFoods = [
      {
        name: 'Paneer Tikka Angara',
        description: 'Smoky marinated cottage cheese cubes grilled in tandoor with bell peppers and mint chutney.',
        categoryId: startersCat._id,
        price: 280,
        image: '/images/food/paneer-tikka.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 18,
      },
      {
        name: 'Crispy Chicken Wings (Hot BBQ)',
        description: 'Double-fried crunchy wings tossed in honey spicy chipotle sauce.',
        categoryId: startersCat._id,
        price: 340,
        image: '/images/food/chicken-wings.jpg',
        foodType: 'NON_VEG',
        isAvailable: true,
        preparationTime: 20,
      },
      {
        name: 'Loaded Nachos Grande',
        description: 'Crisp tortilla chips baked with cheddar cheese sauce, jalapenos, salsa and sour cream.',
        categoryId: startersCat._id,
        price: 240,
        image: '/images/food/nachos.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 12,
      },
      {
        name: 'Butter Chicken Royale',
        description: 'Tender tandoori chicken simmered in rich velvety tomato cashew gravy with fenugreek.',
        categoryId: mainCat._id,
        price: 420,
        image: '/images/food/butter-chicken.jpg',
        foodType: 'NON_VEG',
        isAvailable: true,
        preparationTime: 25,
      },
      {
        name: 'Dal Makhani Bukhara Style',
        description: 'Slow-cooked whole black lentils simmered overnight with fresh churned white butter.',
        categoryId: mainCat._id,
        price: 310,
        image: '/images/food/dal-makhani.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 15,
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Soft cottage cheese cubes in spiced aromatic tomato butter gravy.',
        categoryId: mainCat._id,
        price: 330,
        image: '/images/food/paneer-butter-masala.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 18,
      },
      {
        name: 'Garlic Butter Naan (2 Pcs)',
        description: 'Fresh tandoori clay-baked refined flour bread brushed with garlic butter.',
        categoryId: mainCat._id,
        price: 90,
        image: '/images/food/garlic-naan.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Hakka Noodles Schezwan',
        description: 'Wok-tossed noodles with shredded garden vegetables in spicy house schezwan sauce.',
        categoryId: chineseCat._id,
        price: 220,
        image: '/images/food/hakka-noodles.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 15,
      },
      {
        name: 'Chilli Chicken Gravy',
        description: 'Crispy chicken morsels tossed with green chillies, capsicum, soy sauce and garlic.',
        categoryId: chineseCat._id,
        price: 320,
        image: '/images/food/chilli-chicken.jpg',
        foodType: 'NON_VEG',
        isAvailable: true,
        preparationTime: 18,
      },
      {
        name: 'Margherita Wood-Fired Pizza',
        description: '11 inch hand-tossed crust with San Marzano tomato sauce, fresh mozzarella & sweet basil.',
        categoryId: pizzaCat._id,
        price: 380,
        image: '/images/food/margherita-pizza.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 20,
      },
      {
        name: 'BBQ Smoked Chicken Pizza',
        description: '11 inch pizza topped with BBQ grilled chicken, red onions, mushrooms and mozzarella.',
        categoryId: pizzaCat._id,
        price: 460,
        image: '/images/food/bbq-pizza.jpg',
        foodType: 'NON_VEG',
        isAvailable: true,
        preparationTime: 22,
      },
      {
        name: 'Classic Gourmet Cheese Burger',
        description: 'Juicy spiced veg patty, melted cheddar slice, caramelized onions and mustard mayo.',
        categoryId: burgerCat._id,
        price: 190,
        image: '/images/food/veg-burger.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 15,
      },
      {
        name: 'Double Smash Egg & Chicken Burger',
        description: 'Grilled chicken patty, sunny egg, crisp lettuce, cheese and signature garlic aioli.',
        categoryId: burgerCat._id,
        price: 260,
        image: '/images/food/chicken-burger.jpg',
        foodType: 'NON_VEG',
        isAvailable: true,
        preparationTime: 18,
      },
      {
        name: 'Virgin Mojito Mint Cooler',
        description: 'Refreshing muddled fresh mint, lime chunks, cane syrup and sparkling soda.',
        categoryId: drinksCat._id,
        price: 140,
        image: '/images/food/mojito.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: 'Cold Coffee with Vanilla Ice Cream',
        description: 'Thick creamy espresso blend topped with artisanal vanilla ice cream scoop.',
        categoryId: drinksCat._id,
        price: 160,
        image: '/images/food/cold-coffee.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 8,
      },
      {
        name: 'Sizzling Chocolate Brownie',
        description: 'Warm walnut fudge brownie served on a hot sizzler plate with ice cream and hot fudge.',
        categoryId: dessertCat._id,
        price: 220,
        image: '/images/food/brownie.jpg',
        foodType: 'EGG',
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Gulab Jamun with Rabri (2 Pcs)',
        description: 'Warm melt-in-mouth milk dumplings paired with rich cardamom thickened rabri.',
        categoryId: dessertCat._id,
        price: 150,
        image: '/images/food/gulab-jamun.jpg',
        foodType: 'VEG',
        isAvailable: true,
        preparationTime: 5,
      },
    ];

    foodDocs = await FoodItem.insertMany(initialFoods);
  } else {
    foodDocs = await FoodItem.find();
  }

  // 6. Seed Customers
  const customerCount = await Customer.countDocuments();
  let customerDocs = [];
  if (customerCount === 0) {
    const initialCustomers = [
      {
        name: 'Amitabh Sen',
        phone: '9811122233',
        email: 'amitabh.sen@example.com',
        address: 'B-404, Green Heights',
        totalVisits: 8,
        totalOrders: 6,
        totalSpent: 4850,
        lastVisit: '2026-10-02',
        notes: 'Prefers quiet corner table and less spicy food.',
      },
      {
        name: 'Deepika Rao',
        phone: '9822233344',
        email: 'deepika.rao@example.com',
        address: 'Villa 12, Palm Meadows',
        totalVisits: 14,
        totalOrders: 12,
        totalSpent: 11200,
        lastVisit: '2026-10-03',
        notes: 'VIP customer - Regular for family dinners.',
      },
      {
        name: 'Rahul Khanna',
        phone: '9833344455',
        email: 'rahul.khanna@example.com',
        address: '15, Regency Park',
        totalVisits: 3,
        totalOrders: 2,
        totalSpent: 1450,
        lastVisit: '2026-09-28',
      },
      {
        name: 'Sneha Patel',
        phone: '9844455566',
        email: 'sneha.patel@example.com',
        address: '77, Lake City Apartments',
        totalVisits: 5,
        totalOrders: 4,
        totalSpent: 3200,
        lastVisit: '2026-10-01',
      },
    ];
    customerDocs = await Customer.insertMany(initialCustomers);
  } else {
    customerDocs = await Customer.find();
  }

  // 7. Seed Reservations
  const reservationCount = await Reservation.countDocuments();
  const todayStr = new Date().toISOString().split('T')[0];
  if (reservationCount === 0 && tableDocs.length > 0) {
    await Reservation.insertMany([
      {
        customerName: 'Deepika Rao',
        customerPhone: '9822233344',
        customerEmail: 'deepika.rao@example.com',
        numberOfGuests: 4,
        tableId: tableDocs[3]._id, // T-04
        date: todayStr,
        startTime: '19:00',
        endTime: '21:00',
        status: 'CONFIRMED',
        notes: 'Birthday celebration - requested corner arrangement.',
        createdBy: adminUser?._id,
      },
      {
        customerName: 'Sanjay Kapoor',
        customerPhone: '9855566677',
        customerEmail: 'sanjay.k@example.com',
        numberOfGuests: 4,
        tableId: tableDocs[8]._id, // T-09
        date: todayStr,
        startTime: '20:00',
        endTime: '22:00',
        status: 'CONFIRMED',
        notes: 'Rooftop table preferred.',
        createdBy: managerUser?._id,
      },
      {
        customerName: 'Amitabh Sen',
        customerPhone: '9811122233',
        customerEmail: 'amitabh.sen@example.com',
        numberOfGuests: 2,
        tableId: tableDocs[0]._id, // T-01
        date: todayStr,
        startTime: '13:00',
        endTime: '14:30',
        status: 'COMPLETED',
        notes: 'Lunch meeting.',
        createdBy: adminUser?._id,
      },
    ]);
  }

  // 8. Seed Attendance for today
  const attendanceCount = await Attendance.countDocuments({ date: todayStr });
  if (attendanceCount === 0 && staffDocs.length > 0) {
    const attendanceRecords = staffDocs.map((s, idx) => {
      let status = 'PRESENT';
      let checkIn = '09:00';
      let checkOut = '17:00';
      if (idx === 3) {
        status = 'HALF_DAY';
        checkIn = '09:00';
        checkOut = '13:00';
      } else if (idx === 5) {
        status = 'LEAVE';
        checkIn = '';
        checkOut = '';
      } else if (idx === 6) {
        status = 'PRESENT';
        checkIn = '08:45';
        checkOut = '17:30';
      }

      return {
        staffId: s._id,
        date: todayStr,
        status,
        checkIn,
        checkOut,
        markedBy: adminUser?._id,
        notes: status === 'LEAVE' ? 'Medical leave requested' : 'Regular shift',
      };
    });

    await Attendance.insertMany(attendanceRecords);
  }

  // 9. Seed Sample Orders and Payments
  const orderCount = await Order.countDocuments();
  if (orderCount === 0 && foodDocs.length > 0 && tableDocs.length > 0) {
    const sampleOrder1 = await Order.create({
      orderNumber: 'ORD-1001',
      customerId: customerDocs[0]?._id,
      customerName: 'Amitabh Sen',
      customerPhone: '9811122233',
      tableId: tableDocs[1]._id,
      orderType: 'DINE_IN',
      items: [
        {
          foodItemId: foodDocs[0]._id,
          name: foodDocs[0].name,
          price: foodDocs[0].price,
          quantity: 2,
        },
        {
          foodItemId: foodDocs[3]._id,
          name: foodDocs[3].name,
          price: foodDocs[3].price,
          quantity: 1,
        },
        {
          foodItemId: foodDocs[6]._id,
          name: foodDocs[6].name,
          price: foodDocs[6].price,
          quantity: 4,
        },
        {
          foodItemId: foodDocs[13]._id,
          name: foodDocs[13].name,
          price: foodDocs[13].price,
          quantity: 2,
        },
      ],
      subtotal: 1620,
      tax: 81,
      discount: 100,
      total: 1601,
      status: 'COMPLETED',
      notes: 'Please serve warm bread',
      createdBy: adminUser?._id,
    });

    await Payment.create({
      billNumber: 'BILL-2026-001',
      orderId: sampleOrder1._id,
      customerName: 'Amitabh Sen',
      customerPhone: '9811122233',
      tableNumber: tableDocs[1].tableNumber,
      items: [
        { name: foodDocs[0].name, quantity: 2, price: foodDocs[0].price, amount: foodDocs[0].price * 2 },
        { name: foodDocs[3].name, quantity: 1, price: foodDocs[3].price, amount: foodDocs[3].price * 1 },
        { name: foodDocs[6].name, quantity: 4, price: foodDocs[6].price, amount: foodDocs[6].price * 4 },
        { name: foodDocs[13].name, quantity: 2, price: foodDocs[13].price, amount: foodDocs[13].price * 2 },
      ],
      subtotal: 1620,
      tax: 81,
      discount: 100,
      grandTotal: 1601,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      generatedBy: adminUser?._id,
      paidAt: new Date().toISOString(),
      notes: 'Cash payment settled at table counter.',
    });

    // Sample Order 2 (In-Progress)
    await Order.create({
      orderNumber: 'ORD-1002',
      customerName: 'Walk-in Guest (Table 7)',
      tableId: tableDocs[6]._id,
      orderType: 'DINE_IN',
      items: [
        {
          foodItemId: foodDocs[9]._id,
          name: foodDocs[9].name,
          price: foodDocs[9].price,
          quantity: 1,
        },
        {
          foodItemId: foodDocs[11]._id,
          name: foodDocs[11].name,
          price: foodDocs[11].price,
          quantity: 2,
        },
        {
          foodItemId: foodDocs[14]._id,
          name: foodDocs[14].name,
          price: foodDocs[14].price,
          quantity: 2,
        },
      ],
      subtotal: 1080,
      tax: 54,
      discount: 0,
      total: 1134,
      status: 'PREPARING',
      notes: 'Extra ketchup with burger.',
      createdBy: managerUser?._id,
    });
  }

  return {
    success: true,
    message: 'Database seeded successfully with Admin, Managers, Staff, Tables, Menu, Categories, Reservations, Attendance, Orders, and Billing.',
  };
}
