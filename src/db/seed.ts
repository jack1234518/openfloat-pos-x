import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import 'dotenv/config';
import { db } from "./index";
import { branches, products, customers, employees, attendance, payrollRuns, orders, orderItems, procurementRequests, deliveries } from "./schema";
import { count, eq } from "drizzle-orm";

export async function ensureSeedData() {
  try {
    // Check if branches already exist
    const branchCountResult = await db.select({ count: count() }).from(branches);
    const branchCount = branchCountResult[0]?.count ?? 0;

    if (branchCount > 0) {
      // Already seeded
      return;
    }

    console.log("Seeding OpenFloat POS X Database...");

    // 1. Seed Branches
    const branchData = [
      { name: "Nairobi HQ", city: "Nairobi", cashBalance: 450000, bankBalance: 1250000, mobileBalance: 350000, revenue: 1540000, color: "#3b82f6" },
      { name: "Mombasa Port Branch", city: "Mombasa", cashBalance: 120000, bankBalance: 450000, mobileBalance: 180000, revenue: 680000, color: "#10b981" },
      { name: "Kisumu Retail Hub", city: "Kisumu", cashBalance: 80000, bankBalance: 210000, mobileBalance: 95000, revenue: 340000, color: "#f59e0b" },
      { name: "Eldoret Depot", city: "Eldoret", cashBalance: 50000, bankBalance: 150000, mobileBalance: 45000, revenue: 190000, color: "#8b5cf6" }
    ];

    const insertedBranches = [];
    for (const b of branchData) {
      const res = await db.insert(branches).values(b).returning();
      insertedBranches.push(res[0]);
    }

    // 2. Seed Products
    const productData = [
      {
        name: "iPhone 15 Pro Max (256GB)",
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=60",
        category: "Electronics",
        sku: "PROD-IP15PM",
        barcode: "194253856214",
        stock: 42,
        reorderLevel: 10,
        price: 145000,
        cost: 110000,
        unitOfMeasure: "pcs",
        isFavorite: true,
        description: "Apple iPhone 15 Pro Max, Natural Titanium.",
        expiryDate: null,
        shelfAllocation: "A-12",
        supplierName: "Apple East Africa",
        salesCount: 88,
      },
      {
        name: "Logitech MX Master 3S Mouse",
        imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&auto=format&fit=crop&q=60",
        category: "Electronics",
        sku: "PROD-MXM3S",
        barcode: "097855171122",
        stock: 4, // Reorder warning!
        reorderLevel: 8,
        price: 15500,
        cost: 11000,
        unitOfMeasure: "pcs",
        isFavorite: true,
        description: "Ergonomic precision wireless mouse.",
        expiryDate: null,
        shelfAllocation: "B-04",
        supplierName: "Logitech Retail KE",
        salesCount: 154,
      },
      {
        name: "Premium Arabica Coffee Beans (1kg)",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=60",
        category: "Food & Beverages",
        sku: "PROD-COF1KG",
        barcode: "600123456789",
        stock: 80,
        reorderLevel: 20,
        price: 2200,
        cost: 1300,
        unitOfMeasure: "bags",
        isFavorite: true,
        description: "Single-origin Kenya AA medium roast beans.",
        expiryDate: "2026-11-30",
        shelfAllocation: "C-15",
        supplierName: "Sasini Coffee Estates",
        salesCount: 412,
      },
      {
        name: "Eco-Friendly Bamboo Water Bottle",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=60",
        category: "Wellness",
        sku: "PROD-BAMBOT",
        barcode: "729000123456",
        stock: 0, // Out of stock!
        reorderLevel: 15,
        price: 1800,
        cost: 950,
        unitOfMeasure: "pcs",
        isFavorite: false,
        description: "Double-walled vacuum insulated bamboo flask.",
        expiryDate: null,
        shelfAllocation: "D-01",
        supplierName: "GreenLife Kenya",
        salesCount: 65,
      },
      {
        name: "Legacy CRT Monitor Power Cables (Coaxial)",
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=60",
        category: "Electronics",
        sku: "PROD-CRTCBL",
        barcode: "012345678912",
        stock: 125, // Dead stock! High stock, no sales
        reorderLevel: 5,
        price: 750,
        cost: 500,
        unitOfMeasure: "pcs",
        isFavorite: false,
        description: "Old style heavy duty display connection cable.",
        expiryDate: null,
        shelfAllocation: "E-40",
        supplierName: "E-Waste Solutions",
        salesCount: 0,
      },
      {
        name: "Organic Chia Seeds (500g)",
        imageUrl: "https://images.unsplash.com/photo-1507724607855-848f55953e5e?w=400&auto=format&fit=crop&q=60",
        category: "Food & Beverages",
        sku: "PROD-CHIA500",
        barcode: "600987654321",
        stock: 18, // Reorder warning!
        reorderLevel: 25,
        price: 950,
        cost: 550,
        unitOfMeasure: "packs",
        isFavorite: false,
        description: "Premium black organic chia seeds, high in Omega-3.",
        expiryDate: "2026-08-15", // Expiring soon!
        shelfAllocation: "C-08",
        supplierName: "Healthy Living Distributors",
        salesCount: 220,
      },
      {
        name: "A4 Double A Copier Paper (500 Sheets)",
        imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60",
        category: "Office Supplies",
        sku: "PROD-A4PAP",
        barcode: "885811611022",
        stock: 140,
        reorderLevel: 30,
        price: 850,
        cost: 520,
        unitOfMeasure: "reams",
        isFavorite: true,
        description: "High brightness 80gsm premium printer paper.",
        expiryDate: null,
        shelfAllocation: "F-02",
        supplierName: "KenStationers Ltd",
        salesCount: 940,
      }
    ];

    const insertedProducts = [];
    for (const p of productData) {
      const res = await db.insert(products).values(p).returning();
      insertedProducts.push(res[0]);
    }

    // 3. Seed Customers
    const customerData = [
      { name: "Johnstone Kiprop", phone: "+254712345678", email: "johnstone@gmail.com", outstandingDebt: 45000, creditLimit: 100000, loyaltyPoints: 450, segment: "VIP", churnRisk: 12, preferredCategory: "Electronics" },
      { name: "Mary Atieno", phone: "+254722987654", email: "maryatieno@yahoo.com", outstandingDebt: 0, creditLimit: 20000, loyaltyPoints: 120, segment: "Regular", churnRisk: 25, preferredCategory: "Food & Beverages" },
      { name: "Acme Corporate Group", phone: "+254202244668", email: "procurement@acme.co.ke", outstandingDebt: 185000, creditLimit: 500000, loyaltyPoints: 1250, segment: "Corporate", churnRisk: 5, preferredCategory: "Office Supplies" },
      { name: "Farah Hussein", phone: "+254701234999", email: "farah.h@gmail.com", outstandingDebt: 12000, creditLimit: 30000, loyaltyPoints: 85, segment: "At-Risk", churnRisk: 78, preferredCategory: "Electronics" }
    ];

    const insertedCustomers = [];
    for (const c of customerData) {
      const res = await db.insert(customers).values(c).returning();
      insertedCustomers.push(res[0]);
    }

    // 4. Seed Employees
    // Owner, Branch Manager, Cashier, Accountant, HR Officer, Procurement, Delivery Rider, Storekeeper
    const employeeData = [
      { name: "David Float", email: "owner@openfloat.com", phone: "+254700000001", role: "Owner", basicSalary: 350000, houseAllowance: 80000, transportAllowance: 40000, airtimeAllowance: 15000, status: "Present", performanceScore: 98, branchId: insertedBranches[0].id },
      { name: "Peter Mwangi", email: "peter@openfloat.com", phone: "+254711111111", role: "Branch Manager", basicSalary: 120000, houseAllowance: 30000, transportAllowance: 15000, airtimeAllowance: 5000, status: "Present", performanceScore: 92, branchId: insertedBranches[0].id },
      { name: "Jane Doe", email: "jane@openfloat.com", phone: "+254722222222", role: "Cashier", basicSalary: 45000, houseAllowance: 12000, transportAllowance: 8000, airtimeAllowance: 2000, status: "Present", performanceScore: 95, branchId: insertedBranches[0].id },
      { name: "Bob Kamau", email: "bob@openfloat.com", phone: "+254733333333", role: "Accountant", basicSalary: 95000, houseAllowance: 25000, transportAllowance: 12000, airtimeAllowance: 3000, status: "Present", performanceScore: 89, branchId: insertedBranches[0].id },
      { name: "Alice Wambui", email: "alice@openfloat.com", phone: "+254744444444", role: "Human Resource Officer", basicSalary: 85000, houseAllowance: 20000, transportAllowance: 10000, airtimeAllowance: 3000, status: "Present", performanceScore: 90, branchId: insertedBranches[0].id },
      { name: "Sarah Njeri", email: "sarah@openfloat.com", phone: "+254755555555", role: "Procurement Officer", basicSalary: 75000, houseAllowance: 18000, transportAllowance: 10000, airtimeAllowance: 3000, status: "Present", performanceScore: 87, branchId: insertedBranches[0].id },
      { name: "James Mwema", email: "james@openfloat.com", phone: "+254766666666", role: "Storekeeper", basicSalary: 50000, houseAllowance: 12000, transportAllowance: 8000, airtimeAllowance: 2000, status: "Present", performanceScore: 84, branchId: insertedBranches[0].id },
      { name: "Rider Kipchirchir", email: "rider@openfloat.com", phone: "+254777777777", role: "Delivery Rider", basicSalary: 35000, houseAllowance: 8000, transportAllowance: 15000, airtimeAllowance: 2000, status: "Present", performanceScore: 93, branchId: insertedBranches[0].id },
      { name: "Kamau Njoroge", email: "kamau@openfloat.com", phone: "+254788888888", role: "Cashier", basicSalary: 42000, houseAllowance: 12000, transportAllowance: 8000, airtimeAllowance: 2000, status: "Late", performanceScore: 78, branchId: insertedBranches[1].id },
      { name: "Fatuma Ibrahim", email: "fatuma@openfloat.com", phone: "+254799999999", role: "Sales Representative", basicSalary: 45000, houseAllowance: 12000, transportAllowance: 8000, airtimeAllowance: 2000, status: "Absent", performanceScore: 82, branchId: insertedBranches[2].id }
    ];

    const insertedEmployees = [];
    for (const emp of employeeData) {
      const res = await db.insert(employees).values(emp).returning();
      insertedEmployees.push(res[0]);
    }

    // 5. Seed Attendance Logs for today (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split("T")[0];
    const attendanceMethods = ["GPS check-in", "Facial recognition", "Fingerprint", "QR Code"];
    
    for (let i = 0; i < insertedEmployees.length; i++) {
      const emp = insertedEmployees[i];
      // Match status
      let checkInTime: string | null = "07:45";
      if (emp.status === "Late") checkInTime = "08:35";
      if (emp.status === "Absent") checkInTime = null;

      await db.insert(attendance).values({
        employeeId: emp.id,
        date: todayStr,
        status: emp.status,
        checkInTime: checkInTime,
        method: attendanceMethods[i % attendanceMethods.length]
      });
    }

    // 6. Seed Payroll Runs
    // Let's create payrolls for "2026-02"
    for (const emp of insertedEmployees) {
      // Calculate tax and deductions
      const basic = emp.basicSalary;
      const house = emp.houseAllowance;
      const trans = emp.transportAllowance;
      const air = emp.airtimeAllowance;
      
      const gross = basic + house + trans + air;
      const paye = Math.round(gross * 0.15); // mock formula
      const nssf = 1080;
      const shif = Math.round(gross * 0.0275);
      const loan = emp.role === "Cashier" ? 1500 : 0; // standard cash advances
      
      const net = gross - (paye + nssf + shif + loan);

      await db.insert(payrollRuns).values({
        employeeId: emp.id,
        month: "2026-02",
        basic: basic,
        houseAllowance: house,
        transportAllowance: trans,
        commissions: emp.role === "Sales Representative" ? 8500 : 0,
        bonuses: emp.role === "Cashier" ? 2500 : 0,
        deductionsPaye: paye,
        deductionsNssf: nssf,
        deductionsShif: shif,
        deductionsLoan: loan,
        netPay: net,
        status: "Approved"
      });
    }

    // 7. Seed Orders & OrderItems (historic)
    // Order 1: VIP customer buying iPhone 15 Pro Max
    const order1 = await db.insert(orders).values({
      branchId: insertedBranches[0].id,
      customerId: insertedCustomers[0].id,
      totalAmount: 145000,
      discountAmount: 0,
      paymentMethod: "M-Pesa STK",
      paymentStatus: "Paid",
      isCredit: false,
    }).returning();

    await db.insert(orderItems).values({
      orderId: order1[0].id,
      productId: insertedProducts[0].id,
      quantity: 1,
      unitPrice: 145000,
      totalPrice: 145000,
    });

    // Order 2: Corporate client buying paper & mouse on credit
    const order2 = await db.insert(orders).values({
      branchId: insertedBranches[0].id,
      customerId: insertedCustomers[2].id,
      totalAmount: 31000,
      discountAmount: 1500,
      paymentMethod: "Credit",
      paymentStatus: "Pending",
      isCredit: true,
    }).returning();

    await db.insert(orderItems).values({
      orderId: order2[0].id,
      productId: insertedProducts[1].id, // Mouse
      quantity: 1,
      unitPrice: 15500,
      totalPrice: 15500,
    });

    await db.insert(orderItems).values({
      orderId: order2[0].id,
      productId: insertedProducts[6].id, // A4 Paper
      quantity: 20,
      unitPrice: 850,
      totalPrice: 17000,
    });

    // 8. Seed Procurement Requests
    await db.insert(procurementRequests).values({
      productId: insertedProducts[3].id, // Bamboo bottle (out of stock)
      quantity: 50,
      supplierName: "GreenLife Kenya",
      costPerUnit: 950,
      totalCost: 47500,
      status: "Pending Approval",
      dateRequested: todayStr,
    });

    await db.insert(procurementRequests).values({
      productId: insertedProducts[1].id, // MX Mouse (reorder warning)
      quantity: 20,
      supplierName: "Logitech Retail KE",
      costPerUnit: 11000,
      totalCost: 220000,
      status: "Approved",
      dateRequested: todayStr,
    });

    // 9. Seed Deliveries
    await db.insert(deliveries).values({
      orderId: order1[0].id,
      riderId: insertedEmployees.find(e => e.role === "Delivery Rider")?.id ?? insertedEmployees[7].id,
      status: "In Transit",
      vehicleNo: "KMDF 234G (Motorcycle)",
      routeInfo: "HQ -> Westlands Retail estate",
      estimatedTime: "12 mins",
    });

    console.log("Database successfully seeded!");
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}
