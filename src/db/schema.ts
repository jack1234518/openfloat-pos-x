import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Branches
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  cashBalance: doublePrecision("cash_balance").default(15000).notNull(),
  bankBalance: doublePrecision("bank_balance").default(45000).notNull(),
  mobileBalance: doublePrecision("mobile_balance").default(25000).notNull(),
  revenue: doublePrecision("revenue").default(0).notNull(),
  color: text("color").default("#3b82f6").notNull(), // hex code
});

// 2. Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode").notNull(),
  stock: integer("stock").notNull(),
  reorderLevel: integer("reorder_level").notNull(),
  price: doublePrecision("price").notNull(),
  cost: doublePrecision("cost").notNull(),
  unitOfMeasure: text("unit_of_measure").default("pcs").notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  description: text("description"),
  expiryDate: text("expiry_date"), // YYYY-MM-DD
  shelfAllocation: text("shelf_allocation").default("A-1").notNull(),
  supplierName: text("supplier_name").notNull(),
  salesCount: integer("sales_count").default(0).notNull(),
});

// 3. Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  outstandingDebt: doublePrecision("outstanding_debt").default(0).notNull(),
  creditLimit: doublePrecision("credit_limit").default(50000).notNull(),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  segment: text("segment").default("Regular").notNull(), // VIP, Corporate, Regular, At-Risk
  churnRisk: integer("churn_risk").default(10).notNull(), // 0 to 100
  preferredCategory: text("preferred_category").default("General").notNull(),
});

// 4. Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id),
  customerId: integer("customer_id").references(() => customers.id),
  totalAmount: doublePrecision("total_amount").notNull(),
  discountAmount: doublePrecision("discount_amount").default(0).notNull(),
  paymentMethod: text("payment_method").notNull(), // Cash, M-Pesa STK, Credit, Split
  paymentStatus: text("payment_status").notNull(), // Paid, Pending, Failed
  isCredit: boolean("is_credit").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
});

// 6. Employees
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // Cashier, Branch Manager, Accountant, Owner, etc.
  basicSalary: doublePrecision("basic_salary").notNull(),
  houseAllowance: doublePrecision("house_allowance").default(0).notNull(),
  transportAllowance: doublePrecision("transport_allowance").default(0).notNull(),
  airtimeAllowance: doublePrecision("airtime_allowance").default(0).notNull(),
  status: text("status").default("Present").notNull(), // Present, Late, Absent, Leave
  performanceScore: integer("performance_score").default(85).notNull(), // 0-100
  branchId: integer("branch_id").references(() => branches.id),
});

// 7. Attendance Logs
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status").notNull(), // Present, Late, Absent, Leave
  checkInTime: text("check_in_time"), // HH:MM
  method: text("method").default("GPS check-in").notNull(), // GPS check-in, Fingerprint, QR Code, Facial recognition
});

// 8. Payroll Runs
export const payrollRuns = pgTable("payroll_runs", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: "cascade" }),
  month: text("month").notNull(), // YYYY-MM
  basic: doublePrecision("basic").notNull(),
  houseAllowance: doublePrecision("house_allowance").default(0).notNull(),
  transportAllowance: doublePrecision("transport_allowance").default(0).notNull(),
  commissions: doublePrecision("commissions").default(0).notNull(),
  bonuses: doublePrecision("bonuses").default(0).notNull(),
  deductionsPaye: doublePrecision("deductions_paye").default(0).notNull(),
  deductionsNssf: doublePrecision("deductions_nssf").default(0).notNull(),
  deductionsShif: doublePrecision("deductions_shif").default(0).notNull(),
  deductionsLoan: doublePrecision("deductions_loan").default(0).notNull(),
  netPay: doublePrecision("net_pay").notNull(),
  status: text("status").default("Pending").notNull(), // Pending, Approved, Paid
});

// 9. Procurement Requests
export const procurementRequests = pgTable("procurement_requests", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  supplierName: text("supplier_name").notNull(),
  costPerUnit: doublePrecision("cost_per_unit").notNull(),
  totalCost: doublePrecision("total_cost").notNull(),
  status: text("status").default("Pending Approval").notNull(), // Pending Approval, Approved, Delivered
  dateRequested: text("date_requested").notNull(), // YYYY-MM-DD
});

// 10. Deliveries & Fleet
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  riderId: integer("rider_id").references(() => employees.id),
  status: text("status").default("Pending").notNull(), // Pending, In Transit, Delivered, Cancelled
  vehicleNo: text("vehicle_no").notNull(),
  routeInfo: text("route_info").notNull(),
  estimatedTime: text("estimated_time").notNull(), // e.g., "15 mins"
});

// 11. Users (for authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("Cashier"), // Owner, Director, Branch Manager, Accountant, Storekeeper, Cashier, Human Resource Officer, Procurement Officer, Sales Representative, Delivery Rider, System Administrator
  branchId: integer("branch_id").references(() => branches.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Add relations for users
export const usersRelations = relations(users, ({ one }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
}));

// Relations
export const branchesRelations = relations(branches, ({ many }) => ({
  orders: many(orders),
  employees: many(employees),
  users: many(users), // Add this line
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  procurementRequests: many(procurementRequests),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  branch: one(branches, { fields: [orders.branchId], references: [branches.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  deliveries: many(deliveries),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  branch: one(branches, { fields: [employees.branchId], references: [branches.id] }),
  attendance: many(attendance),
  payrollRuns: many(payrollRuns),
  deliveries: many(deliveries),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  employee: one(employees, { fields: [attendance.employeeId], references: [employees.id] }),
}));

export const payrollRunsRelations = relations(payrollRuns, ({ one }) => ({
  employee: one(employees, { fields: [payrollRuns.employeeId], references: [employees.id] }),
}));

export const procurementRequestsRelations = relations(procurementRequests, ({ one }) => ({
  product: one(products, { fields: [procurementRequests.productId], references: [products.id] }),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, { fields: [deliveries.orderId], references: [orders.id] }),
  rider: one(employees, { fields: [deliveries.riderId], references: [employees.id] }),
}));


