"use server";

import { db } from "@/db";
import { 
  branches, 
  products, 
  customers, 
  orders, 
  orderItems, 
  employees, 
  attendance, 
  payrollRuns, 
  procurementRequests, 
  deliveries 
} from "@/db/schema";
import { ensureSeedData } from "@/db/seed";
import { eq, desc, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Automatically ensure seed data on load, then return full data state
export async function getDashboardData() {
  await ensureSeedData();

  const allBranches = await db.select().from(branches).orderBy(branches.id);
  const allProducts = await db.select().from(products).orderBy(products.id);
  const allCustomers = await db.select().from(customers).orderBy(customers.id);
  const allEmployees = await db.select().from(employees).orderBy(employees.id);
  
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const allOrderItems = await db.select().from(orderItems);
  const allAttendance = await db.select().from(attendance);
  const allPayroll = await db.select().from(payrollRuns);
  const allProcurements = await db.select().from(procurementRequests).orderBy(desc(procurementRequests.dateRequested));
  const allDeliveries = await db.select().from(deliveries);

  return {
    branches: allBranches,
    products: allProducts,
    customers: allCustomers,
    employees: allEmployees,
    orders: allOrders,
    orderItems: allOrderItems,
    attendance: allAttendance,
    payroll: allPayroll,
    procurements: allProcurements,
    deliveries: allDeliveries
  };
}

// POS Cashier Checkout
export async function createSaleAction(
  branchId: number,
  customerId: number | null,
  cartItems: { productId: number; quantity: number }[],
  paymentMethod: string,
  discountAmount: number,
  isCredit: boolean
) {
  try {
    // 1. Calculate totals
    let total = 0;
    const itemsToProcess = [];

    for (const item of cartItems) {
      const prodList = await db.select().from(products).where(eq(products.id, item.productId));
      if (prodList.length === 0) throw new Error("Product not found");
      const prod = prodList[0];

      if (prod.stock < item.quantity && !isCredit) {
        // Soft block or let it pass for checkout demo, let's allow it but warn or deduct
      }

      const itemTotal = prod.price * item.quantity;
      total += itemTotal;
      itemsToProcess.push({
        product: prod,
        quantity: item.quantity,
        unitPrice: prod.price,
        totalPrice: itemTotal
      });
    }

    const netTotal = Math.max(0, total - discountAmount);
    const paymentStatus = isCredit ? "Pending" : "Paid";

    // 2. Insert order
    const newOrder = await db.insert(orders).values({
      branchId: branchId,
      customerId: customerId,
      totalAmount: netTotal,
      discountAmount: discountAmount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      isCredit: isCredit,
    }).returning();

    const orderId = newOrder[0].id;

    // 3. Process each item (Deduct stock, insert order items)
    for (const item of itemsToProcess) {
      await db.insert(orderItems).values({
        orderId: orderId,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });

      // Deduct stock
      const newStock = Math.max(0, item.product.stock - item.quantity);
      await db.update(products)
        .set({ 
          stock: newStock,
          salesCount: item.product.salesCount + item.quantity
        })
        .where(eq(products.id, item.product.id));
    }

    // 4. Update branch cash/bank balances
    const branchToUpdate = await db.select().from(branches).where(eq(branches.id, branchId));
    if (branchToUpdate.length > 0) {
      const b = branchToUpdate[0];
      const rev = b.revenue + netTotal;
      let cash = b.cashBalance;
      let mobile = b.mobileBalance;
      let bank = b.bankBalance;

      if (paymentMethod === "Cash") {
        cash += netTotal;
      } else if (paymentMethod === "M-Pesa STK") {
        mobile += netTotal;
      } else {
        bank += netTotal;
      }

      await db.update(branches)
        .set({ cashBalance: cash, mobileBalance: mobile, bankBalance: bank, revenue: rev })
        .where(eq(branches.id, branchId));
    }

    // 5. Update customer loyalty points and outstanding debt
    if (customerId) {
      const customerToUpdate = await db.select().from(customers).where(eq(customers.id, customerId));
      if (customerToUpdate.length > 0) {
        const c = customerToUpdate[0];
        const addedPoints = Math.floor(netTotal / 100); // 1 point per 100 KES
        let debt = c.outstandingDebt;
        if (isCredit) {
          debt += netTotal;
        }

        await db.update(customers)
          .set({ 
            loyaltyPoints: c.loyaltyPoints + addedPoints,
            outstandingDebt: debt
          })
          .where(eq(customers.id, customerId));
      }
    }

    // 6. Create active delivery if it's M-Pesa or Cash with standard delivery
    if (paymentMethod !== "Credit") {
      const riders = await db.select().from(employees).where(eq(employees.role, "Delivery Rider"));
      if (riders.length > 0) {
        const rider = riders[0];
        await db.insert(deliveries).values({
          orderId: orderId,
          riderId: rider.id,
          status: "In Transit",
          vehicleNo: "KMDQ 491A (Motorcycle)",
          routeInfo: "HQ -> Customer Address",
          estimatedTime: "25 mins"
        });
      }
    }

    revalidatePath("/");
    return { success: true, orderId };
  } catch (error: any) {
    console.error("Sale transaction failed:", error);
    return { success: false, error: error.message };
  }
}

// Procurement purchase request
export async function createProcurementRequest(
  productId: number,
  quantity: number,
  supplierName: string,
  costPerUnit: number
) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const totalCost = quantity * costPerUnit;

    await db.insert(procurementRequests).values({
      productId,
      quantity,
      supplierName,
      costPerUnit,
      totalCost,
      status: "Pending Approval",
      dateRequested: todayStr
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Approve Procurement Request
export async function approveProcurementRequest(requestId: number, action: "Approve" | "Deliver") {
  try {
    const request = await db.select().from(procurementRequests).where(eq(procurementRequests.id, requestId));
    if (request.length === 0) throw new Error("Request not found");
    const req = request[0];

    if (action === "Approve") {
      await db.update(procurementRequests)
        .set({ status: "Approved" })
        .where(eq(procurementRequests.id, requestId));
    } else if (action === "Deliver") {
      // 1. Set status
      await db.update(procurementRequests)
        .set({ status: "Delivered" })
        .where(eq(procurementRequests.id, requestId));

      // 2. Increase stock
      if (req.productId) {
        const prod = await db.select().from(products).where(eq(products.id, req.productId));
        if (prod.length > 0) {
          await db.update(products)
            .set({ stock: prod[0].stock + req.quantity })
            .where(eq(products.id, req.productId));
        }
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// HR Employee Clock In
export async function clockInAttendance(employeeId: number, status: string, method: string) {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = status === "Present" ? "08:00" : status === "Late" ? "08:45" : null;

    // Check if attendance log already exists for this employee today
    const existing = await db.select().from(attendance).where(
      and(
        eq(attendance.employeeId, employeeId),
        eq(attendance.date, todayStr)
      )
    );

    if (existing.length > 0) {
      await db.update(attendance)
        .set({ status, checkInTime: timeStr, method })
        .where(eq(attendance.id, existing[0].id));
    } else {
      await db.insert(attendance).values({
        employeeId,
        date: todayStr,
        status,
        checkInTime: timeStr,
        method
      });
    }

    // Update status in employee table
    await db.update(employees)
      .set({ status })
      .where(eq(employees.id, employeeId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Payroll operations
export async function updatePayrollStatus(payrollId: number, newStatus: string) {
  try {
    await db.update(payrollRuns)
      .set({ status: newStatus })
      .where(eq(payrollRuns.id, payrollId));

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create New CRM Customer
export async function createNewCustomerAction(
  name: string,
  phone: string,
  email: string,
  segment: string,
  creditLimit: number
) {
  try {
    const res = await db.insert(customers).values({
      name,
      phone,
      email,
      segment,
      outstandingDebt: 0,
      creditLimit: creditLimit,
      loyaltyPoints: 10, // Initial bonus points
      preferredCategory: "General"
    }).returning();

    revalidatePath("/");
    return { success: true, customer: res[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// AI Intelligence response simulation backed by database records
export async function askBusinessAiAction(userQuery: string) {
  try {
    const allProducts = await db.select().from(products);
    const allBranches = await db.select().from(branches);
    const allCustomers = await db.select().from(customers);
    const allEmployees = await db.select().from(employees);
    const allOrders = await db.select().from(orders);

    const queryLower = userQuery.toLowerCase();

    // 1. "Why are profits declining?"
    if (queryLower.includes("profit") || queryLower.includes("decline") || queryLower.includes("why")) {
      const deadStockCount = allProducts.filter(p => p.stock > 50 && p.salesCount === 0).length;
      const totalOutstandingDebts = allCustomers.reduce((acc, c) => acc + c.outstandingDebt, 0);
      const lowSalesCount = allProducts.filter(p => p.stock < p.reorderLevel).length;

      return {
        reply: `### OpenFloat AI Financial Diagnosis: Profit Performance Analysis

We detected three main contributors to the current cash flow congestion and mild margin squeeze:

1. **Dead Stock Locked Capital**: There are **${deadStockCount} products** acting as dead stock (high volume, zero sales), notably **"Legacy CRT Monitor Power Cables"** with 125 units. This locks up valuable operating capital.
2. **High Customer Receivables**: Total outstanding customer debt stands at **KES ${totalOutstandingDebts.toLocaleString()}**. Major Corporate buyers (e.g., Acme Corporate Group) have overdue balances of **KES 185,000**, delaying liquidity.
3. **Imbalanced Product Mix & Stockouts**: **${lowSalesCount} high-demand products** are currently at risk or out of stock (e.g., *Bamboo Water Bottles* is at 0 stock, *Logitech MX Mouse* has only 4 left), leading to missed revenue opportunities.

#### Suggested Actions:
* **Liquidate Dead Stock**: Execute a clearance bundle sale (e.g., 50% discount on Legacy cables packaged with fast-movers).
* **Automate Debt Reminders**: Enable the automated SMS/Email M-Pesa link to Acme Corporate Group to recover outstanding bills.
* **Refill Hot Sellers**: Immediately approve the pending procurement request of 50 Bamboo Water Bottles from GreenLife Kenya.`,
        chartData: [
          { label: "Active Revenue", value: 2450000, color: "#10b981" },
          { label: "Locked Dead Stock", value: 62500, color: "#6b7280" },
          { label: "Outstanding Debts", value: totalOutstandingDebts, color: "#ef4444" },
          { label: "Lost Stockout Revenue", value: 120000, color: "#f59e0b" }
        ],
        chartTitle: "Capital Allocation Breakdown (KES)",
        actions: [
          "Approve Bamboo Flask Procurement",
          "Trigger Debt Recovery Reminder to Acme Group",
          "Initiate 50% Dead Stock Clearance Campaign"
        ]
      };
    }

    // 2. "Which products should I restock?"
    if (queryLower.includes("restock") || queryLower.includes("product") || queryLower.includes("stock") || queryLower.includes("depletion")) {
      const outOfStock = allProducts.filter(p => p.stock === 0);
      const criticalStock = allProducts.filter(p => p.stock > 0 && p.stock <= p.reorderLevel);

      let textReport = "### OpenFloat AI Stock Refill Guide\n\nI have evaluated your inventory balances. Here are the immediate action points:\n\n";
      
      if (outOfStock.length > 0) {
        textReport += `#### 🔴 OUT OF STOCK (Critically Urgent)\n`;
        outOfStock.forEach(p => {
          textReport += `* **${p.name}** | Stock: 0 | Reorder Level: ${p.reorderLevel} | Supplier: ${p.supplierName}\n`;
        });
      }

      if (criticalStock.length > 0) {
        textReport += `\n#### 🟡 NEAR REORDER LIMIT (Refill Recommended)\n`;
        criticalStock.forEach(p => {
          textReport += `* **${p.name}** | Current Stock: ${p.stock} | Reorder Level: ${p.reorderLevel} | Supplier: ${p.supplierName}\n`;
        });
      }

      const chartData = [...outOfStock, ...criticalStock].map(p => ({
        label: p.name.substring(0, 15) + "...",
        value: p.stock,
        color: p.stock === 0 ? "#ef4444" : "#f59e0b"
      }));

      return {
        reply: textReport + `\n\n**AI Recommendation:** Establish an automated procurement workflow to submit Purchase Orders once stock drops past 1.5x the reorder level. This reduces lead-time stockouts.`,
        chartData,
        chartTitle: "Stock Status of Depleted Products",
        actions: [
          "Auto-generate Purchase Requests",
          "Review Supplier Lead Times",
          "Setup Reorder Push Notifications"
        ]
      };
    }

    // 3. "Which branch is underperforming?"
    if (queryLower.includes("branch") || queryLower.includes("underperform") || queryLower.includes("performance") || queryLower.includes("comparison")) {
      const sortedBranches = [...allBranches].sort((a, b) => a.revenue - b.revenue);
      const worstBranch = sortedBranches[0];
      const bestBranch = sortedBranches[sortedBranches.length - 1];

      return {
        reply: `### OpenFloat AI Branch Competitiveness Matrix

Based on live performance analytics:

* **🏆 Top Performer**: **${bestBranch.name}** (${bestBranch.city}) with a recorded revenue of **KES ${bestBranch.revenue.toLocaleString()}** and cash balance of **KES ${bestBranch.cashBalance.toLocaleString()}**.
* **⚠️ Needs Intervention**: **${worstBranch.name}** (${worstBranch.city}) is trailing with **KES ${worstBranch.revenue.toLocaleString()}** revenue.

#### Root Cause Analysis for ${worstBranch.name}:
1. **Low Cash to Mobile Float Ratio**: Mobile balance is only KES ${worstBranch.mobileBalance.toLocaleString()}. Local customers report M-Pesa float shortages, leading to aborted POS transactions.
2. **Staff Attendance Disruption**: Out of 2 cashiers in Eldoret/Kisumu, there has been repeated tardiness.
3. **Category Gaps**: Store is missing high-demand electronics like the iPhone 15 series.

#### Action Plan:
* **Float Reallocation**: Transfer KES 50,000 from Nairobi's bank float directly to ${worstBranch.name}'s Mobile Float.
* **Local Marketing**: Target regular customers with regional customized discounts.`,
        chartData: allBranches.map(b => ({
          label: b.name,
          value: b.revenue,
          color: b.id === worstBranch.id ? "#ef4444" : b.id === bestBranch.id ? "#10b981" : "#3b82f6"
        })),
        chartTitle: "Branch Revenue Comparison (KES)",
        actions: [
          `Transfer Float to ${worstBranch.name}`,
          "Deploy Performance Bonus Incentives",
          "Setup Branch Stock Redistribution"
        ]
      };
    }

    // 4. "Which customers are likely to default?"
    if (queryLower.includes("default") || queryLower.includes("customer") || queryLower.includes("debt") || queryLower.includes("cred")) {
      const creditCustomers = allCustomers.filter(c => c.outstandingDebt > 0).sort((a, b) => b.outstandingDebt - a.outstandingDebt);
      const highRisk = creditCustomers.filter(c => c.churnRisk > 50 || c.outstandingDebt > (c.creditLimit * 0.5));

      let replyText = `### OpenFloat AI Credit & Debt Risk Assessment

We analyzed your customer receivables ledger against default risks (calculated using churn metrics, late payments, and credit utilization rates).

#### 🚨 Critical Risk Profiles:
`;

      highRisk.forEach(c => {
        const utilRate = Math.round((c.outstandingDebt / c.creditLimit) * 100);
        replyText += `* **${c.name}** | Debt: **KES ${c.outstandingDebt.toLocaleString()}** | Limit: KES ${c.creditLimit.toLocaleString()} | **${utilRate}% Utilized** | Churn Risk: **${c.churnRisk}%**\n`;
      });

      replyText += `\n#### Suggested Recovery Sequence:
1. **Freeze Accounts**: Block additional credit purchases for customers exceeding 60% credit utilization.
2. **STK Prompt Collection**: Push a 1-click M-Pesa payment prompt to Johnstone Kiprop's phone (+254712345678) directly from the POS interface.
3. **Structured Repayment**: Convert Acme Corporate Group's KES 185,000 debt into 3 interest-free installments.`;

      return {
        reply: replyText,
        chartData: creditCustomers.map(c => ({
          label: c.name,
          value: c.outstandingDebt,
          color: c.churnRisk > 50 ? "#ef4444" : "#f59e0b"
        })),
        chartTitle: "Outstanding Debts by Customer (KES)",
        actions: [
          "Freeze Over-limit Credit Accounts",
          "Launch M-Pesa STK Debt Collection Push",
          "Export Debt Aging PDF Spreadsheet"
        ]
      };
    }

    // Default response
    return {
      reply: `### OpenFloat Intelligent Assistant

Hello! I am your AI Business Advisor. I can analyze your live PostgreSQL databases to address your business operations.

Try asking me:
* **"Why are profits declining?"** to see a full financial breakdown.
* **"Which products should I restock?"** to view out-of-stock items and supplier lead times.
* **"Which branch is underperforming?"** to compare regional revenue cards and attendance correlation.
* **"Which customers are likely to default?"** to audit outstanding debts, credit limits, and churn risk.

Currently, we are monitoring **${allBranches.length} branches**, **${allProducts.length} items in inventory**, and **${allCustomers.length} registered customers**.`,
      chartData: [
        { label: "Products", value: allProducts.length, color: "#3b82f6" },
        { label: "Branches", value: allBranches.length, color: "#10b981" },
        { label: "Customers", value: allCustomers.length, color: "#f59e0b" },
        { label: "Employees", value: allEmployees.length, color: "#8b5cf6" }
      ],
      chartTitle: "System Inventory Entity Count",
      actions: ["Run System Diagnostics", "Optimize Stock Levels", "Refresh Dashboard Metrics"]
    };

  } catch (error: any) {
    return {
      reply: `Sorry, I encountered an error while retrieving data: ${error.message}`,
      chartData: [],
      chartTitle: "Error",
      actions: []
    };
  }
}
