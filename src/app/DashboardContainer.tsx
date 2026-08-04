'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition, useMemo, useEffect } from "react";
import { 
  createSaleAction, 
  createProcurementRequest, 
  approveProcurementRequest, 
  clockInAttendance, 
  updatePayrollStatus, 
  askBusinessAiAction,
  createNewCustomerAction
} from "./actions";
import { 
  Building2, 
  ShoppingCart, 
  Package, 
  Users, 
  LineChart, 
  Calculator, 
  Truck, 
  MessageSquare, 
  Bell, 
  Smartphone, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Award,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Sliders,
  Database,
  LogOut,
  UserCircle,
  Shield,
  Lock
} from "lucide-react";

import toast from 'react-hot-toast';

interface Props {
  initialData: {
    branches: any[];
    products: any[];
    customers: any[];
    employees: any[];
    orders: any[];
    orderItems: any[];
    attendance: any[];
    payroll: any[];
    procurements: any[];
    deliveries: any[];
  };
}

// ============================================================
// ROLE-BASED PERMISSIONS & SIDEBAR ITEMS
// ============================================================

// Define what each role can access
const ROLE_PERMISSIONS: Record<string, { modules: string[] }> = {
  Owner: {
    modules: ["executive", "sales", "inventory", "procurement", "accounting", "hr", "crm", "branches", "logistics", "ai"],
  },
  Director: {
    modules: ["executive", "sales", "inventory", "procurement", "accounting", "hr", "crm", "branches", "logistics", "ai"],
  },
  "Branch Manager": {
    modules: ["executive", "sales", "inventory", "procurement", "hr", "crm", "logistics", "ai"],
  },
  Accountant: {
    modules: ["executive", "accounting", "procurement", "ai"],
  },
  Storekeeper: {
    modules: ["executive", "inventory", "procurement", "logistics", "ai"],
  },
  Cashier: {
    modules: ["executive", "sales", "crm", "ai"],
  },
  "Human Resource Officer": {
    modules: ["executive", "hr", "ai"],
  },
  "Procurement Officer": {
    modules: ["executive", "procurement", "inventory", "ai"],
  },
  "Sales Representative": {
    modules: ["executive", "sales", "crm", "ai"],
  },
  "Delivery Rider": {
    modules: ["executive", "logistics", "ai"],
  },
  "System Administrator": {
    modules: ["executive", "sales", "inventory", "procurement", "accounting", "hr", "crm", "branches", "logistics", "ai"],
  },
};

// Define sidebar items for each role
const SIDEBAR_ITEMS: Record<string, Array<{ id: string; name: string; icon: any }>> = {
  Owner: [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "sales", name: "POS Sales Terminal", icon: ShoppingCart },
    { id: "inventory", name: "Warehouse Ledger", icon: Package },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "accounting", name: "Accounting ERP", icon: LineChart },
    { id: "hr", name: "HR & Payroll", icon: Users },
    { id: "crm", name: "Customer CRM", icon: Award },
    { id: "branches", name: "Branch Switcher", icon: Sliders },
    { id: "logistics", name: "Logistics Fleet", icon: Truck },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  Director: [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "sales", name: "POS Sales Terminal", icon: ShoppingCart },
    { id: "inventory", name: "Warehouse Ledger", icon: Package },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "accounting", name: "Accounting ERP", icon: LineChart },
    { id: "hr", name: "HR & Payroll", icon: Users },
    { id: "crm", name: "Customer CRM", icon: Award },
    { id: "branches", name: "Branch Switcher", icon: Sliders },
    { id: "logistics", name: "Logistics Fleet", icon: Truck },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  "Branch Manager": [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "sales", name: "POS Sales Terminal", icon: ShoppingCart },
    { id: "inventory", name: "Warehouse Ledger", icon: Package },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "hr", name: "HR & Payroll", icon: Users },
    { id: "crm", name: "Customer CRM", icon: Award },
    { id: "logistics", name: "Logistics Fleet", icon: Truck },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  Accountant: [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "accounting", name: "Accounting ERP", icon: LineChart },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  Storekeeper: [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "inventory", name: "Warehouse Ledger", icon: Package },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "logistics", name: "Logistics Fleet", icon: Truck },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  Cashier: [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "sales", name: "POS Sales Terminal", icon: ShoppingCart },
    { id: "crm", name: "Customer CRM", icon: Award },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  "Human Resource Officer": [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "hr", name: "HR & Payroll", icon: Users },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  "Procurement Officer": [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "inventory", name: "Warehouse Ledger", icon: Package },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  "Sales Representative": [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "sales", name: "POS Sales Terminal", icon: ShoppingCart },
    { id: "crm", name: "Customer CRM", icon: Award },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  "Delivery Rider": [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "logistics", name: "Logistics Fleet", icon: Truck },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
  "System Administrator": [
    { id: "executive", name: "Command Center", icon: Building2 },
    { id: "sales", name: "POS Sales Terminal", icon: ShoppingCart },
    { id: "inventory", name: "Warehouse Ledger", icon: Package },
    { id: "procurement", name: "Procurement PO", icon: Calculator },
    { id: "accounting", name: "Accounting ERP", icon: LineChart },
    { id: "hr", name: "HR & Payroll", icon: Users },
    { id: "crm", name: "Customer CRM", icon: Award },
    { id: "branches", name: "Branch Switcher", icon: Sliders },
    { id: "logistics", name: "Logistics Fleet", icon: Truck },
    { id: "ai", name: "AI Assistant", icon: MessageSquare }
  ],
};

// Helper function to get sidebar items for a role
const getSidebarItems = (role: string) => {
  return SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.Owner;
};

// Helper function to check if a role has access to a module
const hasPermission = (role: string, moduleId: string) => {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.modules.includes(moduleId);
};

export default function DashboardContainer({ initialData }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  // Get user info from session
  const userRole = (session?.user as any)?.role || "Owner";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Role switching configuration
  const roles = [
    "Owner", "Director", "Branch Manager", "Accountant", "Storekeeper", 
    "Cashier", "Human Resource Officer", "Procurement Officer", 
    "Sales Representative", "Delivery Rider", "System Administrator"
  ];
  const [activeRole, setActiveRole] = useState<string>(userRole);

  // Get sidebar items based on the user's role
  const sidebarItems = getSidebarItems(activeRole);

  // Multi-branch state
  const [activeBranchId, setActiveBranchId] = useState<number>(data.branches[0]?.id ?? 1);
  const currentBranch = useMemo(() => {
    return data.branches.find(b => b.id === activeBranchId) || data.branches[0];
  }, [data.branches, activeBranchId]);

  // Sidebar Tabs - default to executive
  const [activeTab, setActiveTab] = useState<string>("executive");

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, type: "low-stock", message: "Logitech MX Mouse stock is low (4 left)", time: "Just now", read: false },
    { id: 2, type: "absence", message: "Sales Rep Fatuma Ibrahim is marked Absent today", time: "10m ago", read: false },
    { id: 3, type: "debt-due", message: "Acme Corporate Group debt of KES 185,000 is outstanding", time: "2h ago", read: false },
    { id: 4, type: "procurement", message: "New Restock Request filed for Bamboo Flask", time: "4h ago", read: true },
  ]);

  // POS / Cashier Screen States
  const [posSearch, setPosSearch] = useState("");
  const [posCategory, setPosCategory] = useState("All");
  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([]);
  const [posCustomer, setPosCustomer] = useState<number | null>(null);
  const [posPaymentMethod, setPosPaymentMethod] = useState<string>("Cash");
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posIsCredit, setPosIsCredit] = useState<boolean>(false);
  const [stkPushStatus, setStkPushStatus] = useState<"idle" | "sending" | "success" | "failed">("idle");
  const [stkPhoneNumber, setStkPhoneNumber] = useState("+254712345678");
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  // New Client States for Dynamic customer signup from POS
  const [showNewCustModal, setShowNewCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("+254");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustSegment, setNewCustSegment] = useState("Regular");
  const [newCustCreditLimit, setNewCustCreditLimit] = useState(30000);

  // Procurement state
  const [procureProduct, setProcureProduct] = useState<number>(data.products[0]?.id ?? 1);
  const [procureQty, setProcureQty] = useState<number>(50);
  const [procureSupplier, setProcureSupplier] = useState<string>("Global Imports KE");
  const [procureCost, setProcureCost] = useState<number>(1000);

  // HR & Attendance State
  const [attendanceEmp, setAttendanceEmp] = useState<number>(data.employees[0]?.id ?? 1);
  const [attendanceStatus, setAttendanceStatus] = useState<string>("Present");
  const [attendanceMethod, setAttendanceMethod] = useState<string>("Facial recognition");

  // Selected Employee for Payroll Slip
  const [payrollEmpId, setPayrollEmpId] = useState<number>(data.employees[0]?.id ?? 1);

  // AI Assistant States
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState<any[]>([
    {
      sender: "ai",
      text: `### OpenFloat POS X – Intelligent Commerce AI Agent\n\nHello ${userName}! I am connected directly to your PostgreSQL warehouse ledger and branch financials.\n\nYou are logged in as: **${userRole}**\n\nAsk me questions like:\n* **"Why are profits declining?"**\n* **"Which products should I restock?"**\n* **"Which branch is underperforming?"**\n* **"Which customers are likely to default?"**`,
      chartData: [
        { label: "Nairobi HQ", value: 1540000, color: "#3b82f6" },
        { label: "Mombasa Port", value: 680000, color: "#10b981" },
        { label: "Kisumu Retail", value: 340000, color: "#f59e0b" },
        { label: "Eldoret Depot", value: 190000, color: "#8b5cf6" },
      ],
      chartTitle: "Live Branch Sales Breakdown (KES)",
      actions: ["Run System Diagnostics", "Examine Overdue Debts", "Generate Weekly VAT Audits"]
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Simulated Mobile Frame
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Helper: Refresh Data State
  const refreshState = async () => {
    startTransition(async () => {
      const { getDashboardData } = await import("./actions");
      const updated = await getDashboardData();
      setData(updated);
    });
  };

  // Derived dashboard quick analytics metrics
  const stats = useMemo(() => {
    const todaySales = data.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalRevenue = data.branches.reduce((sum, b) => sum + b.revenue, 0);
    const cashInHand = data.branches.reduce((sum, b) => sum + b.cashBalance, 0);
    const bankBalance = data.branches.reduce((sum, b) => sum + b.bankBalance, 0);
    const mobileBalance = data.branches.reduce((sum, b) => sum + b.mobileBalance, 0);
    const customerDebts = data.customers.reduce((sum, c) => sum + c.outstandingDebt, 0);
    
    const invValuation = data.products.reduce((sum, p) => sum + (p.stock * p.cost), 0);
    const fastMoving = [...data.products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 3);
    const lowStock = data.products.filter(p => p.stock <= p.reorderLevel);
    const presentCount = data.employees.filter(e => e.status === "Present").length;
    const lateCount = data.employees.filter(e => e.status === "Late").length;
    const absentCount = data.employees.filter(e => e.status === "Absent").length;
    const supplierBalance = data.procurements
      .filter(p => p.status === "Approved")
      .reduce((sum, p) => sum + p.totalCost, 0);

    return {
      todaySales,
      totalRevenue,
      cashInHand,
      bankBalance,
      mobileBalance,
      customerDebts,
      invValuation,
      fastMoving,
      lowStock,
      presentCount,
      lateCount,
      absentCount,
      supplierBalance
    };
  }, [data]);

  // POS Product Filter
  const filteredProducts = useMemo(() => {
    return data.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || 
                          p.barcode.includes(posSearch) || 
                          p.sku.toLowerCase().includes(posSearch.toLowerCase());
      const matchCategory = posCategory === "All" || p.category === posCategory;
      return matchSearch && matchCategory;
    });
  }, [data.products, posSearch, posCategory]);

  const posCategories = ["All", "Electronics", "Office Supplies", "Food & Beverages", "Wellness"];

  // Cart actions
  const addToCart = (prodId: number) => {
    const prod = data.products.find(p => p.id === prodId);
    if (!prod) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === prodId);
      if (existing) {
        return prev.map(item => item.productId === prodId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: prodId, quantity: 1 }];
    });
  };

  const updateCartQty = (prodId: number, amt: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === prodId) {
          const newQ = item.quantity + amt;
          return newQ > 0 ? { ...item, quantity: newQ } : null;
        }
        return item;
      }).filter(Boolean) as any;
    });
  };

  const removeFromCart = (prodId: number) => {
    setCart(prev => prev.filter(item => item.productId !== prodId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const p = data.products.find(x => x.id === item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);
  }, [cart, data.products]);

  const cartItemsFull = useMemo(() => {
    return cart.map(item => {
      const p = data.products.find(x => x.id === item.productId);
      return {
        ...item,
        product: p
      };
    }).filter(x => x.product);
  }, [cart, data.products]);

  // Checkout process handler
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("🛒 Shopping cart is empty!");
      return;
    }

    if (posPaymentMethod === "M-Pesa STK") {
      setStkPushStatus("sending");
      toast.loading("📱 Sending M-Pesa STK prompt...", { id: 'stk' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStkPushStatus("success");
      toast.success("✅ STK Prompt sent successfully!", { id: 'stk' });
    }

    const res = await createSaleAction(
      activeBranchId,
      posCustomer,
      cart,
      posPaymentMethod,
      posDiscount,
      posIsCredit || posPaymentMethod === "Credit"
    );

    if (res.success) {
      const custObj = data.customers.find(c => c.id === posCustomer);
      setLastReceipt({
        receiptNo: `OFT-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString(),
        items: cartItemsFull,
        subtotal: cartTotal,
        discount: posDiscount,
        total: Math.max(0, cartTotal - posDiscount),
        paymentMethod: posPaymentMethod,
        customerName: custObj ? custObj.name : "Walk-in Customer",
        customerLoyalty: custObj ? custObj.loyaltyPoints + Math.floor((cartTotal - posDiscount) / 100) : 0,
        branch: currentBranch.name
      });
      
      setCart([]);
      setPosDiscount(0);
      setPosIsCredit(false);
      await refreshState();
      
      toast.success(`✅ Sale completed! Receipt #${lastReceipt?.receiptNo || 'OFT-'}`, { duration: 5000 });
      
      setTimeout(() => {
        setStkPushStatus("idle");
      }, 5000);
    } else {
      toast.error(`❌ Sale failed: ${res.error}`);
      setStkPushStatus("failed");
    }
  };

  // Create CRM Customer Dynamically from POS
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      toast.error("⚠️ Please provide at least a name and telephone contact.");
      return;
    }

    const res = await createNewCustomerAction(
      newCustName,
      newCustPhone,
      newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '')}@openfloat.com`,
      newCustSegment,
      newCustCreditLimit
    );

    if (res.success && res.customer) {
      toast.success(`🎉 Customer ${res.customer.name} registered successfully with 10 Loyalty Points!`);
      setPosCustomer(res.customer.id);
      setShowNewCustModal(false);
      setNewCustName("");
      setNewCustPhone("+254");
      setNewCustEmail("");
      await refreshState();
    } else {
      toast.error(`❌ Error creating customer: ${res.error}`);
    }
  };

  // Submit Restock Purchase Order
  const handleProcureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = data.products.find(p => p.id === procureProduct);
    const res = await createProcurementRequest(
      procureProduct,
      procureQty,
      procureSupplier,
      procureCost
    );

    if (res.success) {
      toast.success(`📦 Procurement order for ${prod?.name} submitted successfully for approval!`);
      await refreshState();
    } else {
      toast.error(`❌ Error submitting request: ${res.error}`);
    }
  };

  const handleApproveProcure = async (reqId: number, action: "Approve" | "Deliver") => {
    const res = await approveProcurementRequest(reqId, action);
    if (res.success) {
      toast.success(`✅ Procurement request successfully updated: ${action}d!`);
      await refreshState();
    } else {
      toast.error(`❌ Error: ${res.error}`);
    }
  };

  // Clock In Employee
  const handleClockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = data.employees.find(x => x.id === attendanceEmp);
    const res = await clockInAttendance(attendanceEmp, attendanceStatus, attendanceMethod);
    if (res.success) {
      toast.success(`✅ ${emp?.name} logged as [${attendanceStatus}] via ${attendanceMethod}`);
      await refreshState();
    } else {
      toast.error(`❌ Error clocking in: ${res.error}`);
    }
  };

  // Update Payroll Status
  const handlePayrollStatusChange = async (payId: number, status: string) => {
    const res = await updatePayrollStatus(payId, status);
    if (res.success) {
      toast.success(`✅ Payroll status changed to ${status}!`);
      await refreshState();
    } else {
      toast.error(`❌ Error updating payroll: ${res.error}`);
    }
  };

  // AI query handler
  const handleAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setAiLoading(true);
    setAiChat(prev => [...prev, { sender: "user", text: queryText }]);

    try {
      const response = await askBusinessAiAction(queryText);
      setAiChat(prev => [...prev, {
        sender: "ai",
        text: response.reply,
        chartData: response.chartData,
        chartTitle: response.chartTitle,
        actions: response.actions
      }]);
    } catch (error) {
      toast.error("❌ AI request failed. Please try again.");
      setAiChat(prev => [...prev, {
        sender: "ai",
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        chartData: [],
        chartTitle: "Error",
        actions: ["Try Again"]
      }]);
    }

    setAiInput("");
    setAiLoading(false);
  };

  // Selected Employee for payslip details
  const selectedEmpForPayslip = useMemo(() => {
    return data.employees.find(e => e.id === payrollEmpId) || data.employees[0];
  }, [data.employees, payrollEmpId]);

  const calculatedPayslip = useMemo(() => {
    if (!selectedEmpForPayslip) return null;
    const basic = selectedEmpForPayslip.basicSalary;
    const house = selectedEmpForPayslip.houseAllowance;
    const trans = selectedEmpForPayslip.transportAllowance;
    const airtime = selectedEmpForPayslip.airtimeAllowance;
    const commissions = selectedEmpForPayslip.role === "Sales Representative" ? 8500 : 0;
    const bonuses = selectedEmpForPayslip.role === "Cashier" ? 2500 : 0;
    
    const gross = basic + house + trans + airtime + commissions + bonuses;
    const paye = Math.round(gross * 0.15);
    const nssf = 1080;
    const shif = Math.round(gross * 0.0275);
    const loan = selectedEmpForPayslip.role === "Cashier" ? 1500 : 0;
    const totalDeductions = paye + nssf + shif + loan;
    const net = gross - totalDeductions;

    return {
      basic, house, trans, airtime, commissions, bonuses, gross, paye, nssf, shif, loan, totalDeductions, net
    };
  }, [selectedEmpForPayslip]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Platform Banner Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg animate-pulse">
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white">OpenFloat POS <span className="text-blue-500">X</span></h1>
                <span className="bg-blue-900/80 text-blue-300 text-xs font-mono px-2 py-0.5 rounded-full border border-blue-700">v4.0 ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400">Intelligent Commerce OS & ERP Engine</p>
            </div>
          </div>

          {/* User Info & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 px-2">
              <UserCircle className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">{userName}</span>
              <span className="text-[10px] text-slate-400">({userRole})</span>
            </div>
            
            <div className="h-4 w-px bg-slate-700"></div>
            
            <span className="text-xs text-slate-400 px-2 font-semibold flex items-center gap-1">
              <Sliders className="h-3 w-3 text-blue-400" /> Role:
            </span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-slate-950 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button 
              onClick={refreshState} 
              disabled={isPending}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
              title="Refresh and sync data with PostgreSQL"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">Sync DB</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 self-end md:self-auto">
            <button 
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${isMobileFrame ? "bg-amber-600 border-amber-500 text-white" : "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"}`}
            >
              <Smartphone className="h-4 w-4" />
              <span>{isMobileFrame ? "Exit Mobile View" : "Simulate Owner Mobile"}</span>
            </button>

            {/* Notification Dropdown Indicator */}
            <div className="relative group">
              <button className="bg-slate-900 p-2 rounded-lg border border-slate-700 relative text-slate-300 hover:text-white transition">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              </button>
              
              <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 hidden group-hover:block z-50">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Live Notification Center</h4>
                <div className="space-y-2.5">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2 rounded-lg text-xs flex gap-2 ${n.read ? "bg-slate-900/50 text-slate-400" : "bg-slate-900 text-slate-200 border-l-2 border-blue-500"}`}>
                      {n.type === "low-stock" && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                      {n.type === "absence" && <Clock className="h-4 w-4 text-red-400 shrink-0" />}
                      {n.type === "debt-due" && <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />}
                      {n.type === "procurement" && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
                      <div>
                        <p>{n.message}</p>
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-700 bg-red-950/50 text-red-400 hover:bg-red-950 hover:text-red-300 transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                {userRole[0]}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-200">{userRole}</div>
                <div className="text-[10px] text-slate-400">Branch: {currentBranch?.name || "N/A"}</div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sidebar Navigation - Role-based */}
        <aside className="lg:col-span-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-1 lg:space-x-0 lg:space-y-1 bg-slate-950 p-2 rounded-2xl border border-slate-800 h-fit">
          <div className="hidden lg:block px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            System Modules
          </div>
          
          {sidebarItems.map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition w-full ${
                  isSelected 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
          
          <div className="hidden lg:block pt-4 border-t border-slate-800/80 mt-2">
            <div className="px-3 py-2 bg-blue-950/40 rounded-xl border border-blue-900/30">
              <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 flex items-center gap-1">
                <Database className="h-3 w-3" /> Live Statistics
              </div>
              <div className="text-xs text-slate-300">
                <p className="flex justify-between"><span>Branches:</span> <span className="font-bold text-white">{data.branches.length}</span></p>
                <p className="flex justify-between"><span>Products:</span> <span className="font-bold text-white">{data.products.length}</span></p>
                <p className="flex justify-between"><span>Staff Count:</span> <span className="font-bold text-white">{data.employees.length}</span></p>
              </div>
            </div>
            
            {/* User Info Card */}
            <div className="px-3 py-2 mt-2 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-400" /> Session Info
              </div>
              <div className="text-[10px] text-slate-400">
                <p className="truncate">👤 {userName}</p>
                <p className="truncate">📧 {userEmail}</p>
                <p className="truncate">🔑 {userRole}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Board */}
        <main className="lg:col-span-10 space-y-6">

          {/* Personalized Greeting Box */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">OpenFloat Business Command Center</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Hello, {userRole} {userName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged into <span className="text-blue-400 font-semibold">{currentBranch?.name || "N/A"}</span> ({currentBranch?.city || "N/A"}). 
                Role: <span className="text-emerald-400 font-semibold">{userRole}</span>
              </p>
            </div>
            
            {/* Quick Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Today's Sales</div>
                <div className="text-xs font-black text-emerald-400">KES {stats.todaySales.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Active Cash Balance</div>
                <div className="text-xs font-black text-blue-400">KES {stats.cashInHand.toLocaleString()}</div>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400">Low Stock Warnings</div>
                <div className="text-xs font-black text-amber-500">{stats.lowStock.length} items</div>
              </div>
            </div>
          </div>

          {/* Conditional rendering of Simulated Owner Mobile Frame */}
          {isMobileFrame && (
            <div className="bg-slate-950 p-4 rounded-3xl border-4 border-slate-700 max-w-sm mx-auto shadow-2xl space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span className="font-mono text-[10px]">OpenFloat Mobile Owner</span>
                </div>
                <button onClick={() => setIsMobileFrame(false)} className="text-red-400 hover:text-white font-bold">✕ Close</button>
              </div>

              <div className="space-y-4 font-sans text-slate-100">
                <div className="bg-blue-900/40 p-3 rounded-xl border border-blue-800">
                  <div className="text-[10px] uppercase text-blue-300 font-bold">Live Enterprise Revenue</div>
                  <div className="text-xl font-extrabold text-white">KES {stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-400 mt-1">Real-time consolidated branch feed</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Push Approvals</h4>
                  
                  {data.procurements.filter(p => p.status === "Pending Approval").length === 0 ? (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
                      No pending approval workflows at this time.
                    </div>
                  ) : (
                    data.procurements.filter(p => p.status === "Pending Approval").map(p => {
                      const prodObj = data.products.find(x => x.id === p.productId);
                      return (
                        <div key={p.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-200">{prodObj?.name}</span>
                            <span className="text-yellow-400 font-mono text-[10px]">KES {p.totalCost.toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Supplier: {p.supplierName} | Qty: {p.quantity}</p>
                          <div className="flex space-x-2 pt-1">
                            <button 
                              onClick={() => handleApproveProcure(p.id, "Approve")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-1 rounded flex-1"
                            >
                              Approve RESTOCK
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live POS Activity Feed</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                    {data.orders.slice(0, 4).map(o => {
                      const cust = data.customers.find(c => c.id === o.customerId);
                      return (
                        <div key={o.id} className="bg-slate-900 p-1.5 rounded border border-slate-800/60 flex justify-between">
                          <div>
                            <span className="text-blue-400 font-mono">#{o.id}</span>
                            <span className="text-slate-300 ml-1">{cust ? cust.name : "Walk-in"}</span>
                          </div>
                          <span className="font-semibold text-emerald-400">KES {o.totalAmount.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-lg text-center text-[10px] text-blue-400">
                  📱 Mobile push notifications are fully configured for M-Pesa STK receipts & high-value sales.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: EXECUTIVE DASHBOARD - Everyone can see this */}
          {/* ============================================================ */}
          {activeTab === "executive" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-emerald-500 opacity-20"><TrendingUp className="h-12 w-12" /></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">TOTAL REVENUE</span>
                  <div className="text-2xl font-black text-white mt-1">KES {stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-400 mt-2"><span className="text-emerald-400 font-bold">↑ 12.4%</span> vs previous month</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-blue-500 opacity-20"><DollarSign className="h-12 w-12" /></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">GROSS PROFIT</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">KES {Math.round(stats.totalRevenue * 0.32).toLocaleString()}</div>
                  <p className="text-[10px] text-slate-400 mt-2">Margin at <span className="text-emerald-400 font-semibold">32.0%</span></p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-red-500 opacity-20"><ShieldAlert className="h-12 w-12" /></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">CUSTOMER DEBT</span>
                  <div className="text-2xl font-black text-red-400 mt-1">KES {stats.customerDebts.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-400 mt-2">{data.customers.filter(c => c.outstandingDebt > 0).length} accounts</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-purple-500 opacity-20"><Package className="h-12 w-12" /></div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">INVENTORY VALUE</span>
                  <div className="text-2xl font-black text-purple-400 mt-1">KES {stats.invValuation.toLocaleString()}</div>
                  <p className="text-[10px] text-slate-400 mt-2">{data.branches.length} branches</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-emerald-500" /> Fast Moving</h3>
                  {stats.fastMoving.map(p => (
                    <div key={p.id} className="flex justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800/60">
                      <div><div className="font-bold text-slate-200">{p.name}</div><span className="text-[10px] text-slate-400">{p.category}</span></div>
                      <span className="bg-emerald-950 text-emerald-400 text-xs font-bold px-2 py-1 rounded">{p.salesCount} sold</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between"><h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Revenue Distribution</h3></div>
                  <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-slate-800 pb-2 px-2">
                    {data.branches.map(b => {
                      const maxRev = Math.max(...data.branches.map(x => x.revenue)) || 1;
                      return (
                        <div key={b.id} className="flex-1 flex flex-col items-center group">
                          <div className="absolute -top-12 bg-slate-900 text-[10px] text-white py-1 px-2 rounded border border-slate-700 hidden group-hover:block whitespace-nowrap z-20">KES {b.revenue.toLocaleString()}</div>
                          <div style={{ height: `${Math.max(10, (b.revenue / maxRev) * 80)}px`, backgroundColor: b.color || '#3b82f6' }} className="w-full rounded-t transition-all"></div>
                          <span className="text-[9px] text-slate-400 mt-2 truncate max-w-full font-mono">{b.name.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1"><Users className="h-4 w-4 text-blue-400" /> Attendance</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-950/60 border border-emerald-900/50 p-2 rounded-xl"><span className="text-emerald-400 text-lg font-extrabold">{stats.presentCount}</span><span className="text-[10px] text-slate-400 block">Present</span></div>
                    <div className="bg-amber-950/60 border border-amber-900/50 p-2 rounded-xl"><span className="text-amber-400 text-lg font-extrabold">{stats.lateCount}</span><span className="text-[10px] text-slate-400 block">Late</span></div>
                    <div className="bg-red-950/60 border border-red-900/50 p-2 rounded-xl"><span className="text-red-400 text-lg font-extrabold">{stats.absentCount}</span><span className="text-[10px] text-slate-400 block">Absent</span></div>
                  </div>
                  <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-900/30">
                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-yellow-300" /> AI Suggestion</span>
                    <p className="text-xs text-slate-300">"Liquidating dead inventory could unlock <strong>KES 62,500</strong>."</p>
                    <button onClick={() => setActiveTab("ai")} className="text-xs text-blue-400 hover:text-blue-300 font-bold underline">Consult AI →</button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Recent Orders</h3></div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {data.orders.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No orders yet</p> : data.orders.map(o => {
                    const cust = data.customers.find(c => c.id === o.customerId);
                    const br = data.branches.find(b => b.id === o.branchId);
                    return (
                      <div key={o.id} className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-blue-400 font-mono">#{o.id}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-300 font-bold">{cust ? cust.name : "Walk-in"}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${o.paymentStatus === 'Paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>{o.paymentStatus}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">Branch: {br ? br.name : "HQ"} | {o.paymentMethod}</p>
                        </div>
                        <div className="text-right"><span className="text-emerald-400 font-black text-sm">KES {o.totalAmount.toLocaleString()}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SALES POS TERMINAL - Only roles with sales permission */}
          {/* ============================================================ */}
          {activeTab === "sales" && hasPermission(activeRole, "sales") && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-7 space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input type="text" placeholder="Search products..." value={posSearch} onChange={(e) => setPosSearch(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto">{posCategories.map(cat => <button key={cat} onClick={() => setPosCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${posCategory === cat ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 border border-slate-800"}`}>{cat}</button>)}</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                    {filteredProducts.map(p => {
                      const isOut = p.stock === 0;
                      return (
                        <div key={p.id} onClick={() => !isOut && addToCart(p.id)} className={`bg-slate-900 rounded-xl border p-3 flex gap-3 cursor-pointer transition ${isOut ? "border-red-900 opacity-60 cursor-not-allowed" : "border-slate-800 hover:border-blue-500"}`}>
                          <img src={p.imageUrl} alt={p.name} className="h-16 w-16 object-cover rounded-lg shrink-0 bg-slate-950 border border-slate-800" />
                          <div className="flex-1"><h4 className="font-bold text-xs text-slate-100 truncate">{p.name}</h4><div className="flex justify-between items-end mt-1"><span className="font-extrabold text-xs text-emerald-400">KES {p.price.toLocaleString()}</span><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isOut ? "bg-red-950 text-red-400" : "bg-emerald-950 text-emerald-400"}`}>{isOut ? "OUT" : `${p.stock} left`}</span></div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="xl:col-span-5 space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400"><ShoppingCart className="h-4 w-4 text-blue-500 inline mr-2" /> Cart</h3>
                    <button onClick={() => setCart([])} className="text-[10px] text-red-400 hover:underline"><Trash2 className="h-3 w-3 inline" /> Clear</button>
                  </div>
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {cart.length === 0 ? <div className="text-center py-10 text-slate-500 text-xs">Cart is empty</div> : cartItemsFull.map(item => (
                      <div key={item.productId} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="flex-1"><h4 className="font-bold text-slate-200 text-xs truncate">{item.product.name}</h4><p className="text-[10px] text-slate-400">KES {item.product.price.toLocaleString()} x {item.quantity}</p></div>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => updateCartQty(item.productId, -1)} className="p-1 bg-slate-950 border border-slate-700 rounded hover:bg-slate-800"><Minus className="h-3 w-3" /></button>
                          <span className="font-mono font-bold text-white w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.productId, 1)} className="p-1 bg-slate-950 border border-slate-700 rounded hover:bg-slate-800"><Plus className="h-3 w-3" /></button>
                          <button onClick={() => removeFromCart(item.productId)} className="p-1 text-red-500 hover:bg-red-950 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <select value={posCustomer || ""} onChange={(e) => setPosCustomer(e.target.value ? Number(e.target.value) : null)} className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-700 w-full">
                      <option value="">-- Walk-in --</option>
                      {data.customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.loyaltyPoints} pts)</option>)}
                    </select>
                    <button onClick={() => setShowNewCustModal(!showNewCustModal)} className="text-[10px] text-blue-400 mt-1 hover:underline">+ New Customer</button>
                    {showNewCustModal && (
                      <form onSubmit={handleCreateCustomer} className="bg-slate-900 p-3 rounded-xl border border-blue-900/40 space-y-2 mt-2">
                        <input type="text" placeholder="Name" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} className="bg-slate-950 border border-slate-700 rounded p-1 text-[11px] text-white w-full" required />
                        <input type="text" placeholder="Phone" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} className="bg-slate-950 border border-slate-700 rounded p-1 text-[11px] text-white w-full" required />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded w-full">Register</button>
                      </form>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div><label className="text-[10px] text-slate-400">Discount</label><input type="number" min="0" value={posDiscount} onChange={(e) => setPosDiscount(Number(e.target.value))} className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-1.5 border border-slate-700 w-full font-mono" /></div>
                    <div><label className="text-[10px] text-slate-400">Credit</label><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={posIsCredit} onChange={(e) => { setPosIsCredit(e.target.checked); if (e.target.checked) setPosPaymentMethod("Credit"); }} className="sr-only peer" /><div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></label></div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] text-slate-400">Payment</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["Cash", "M-Pesa STK", "Credit", "Split"].map(method => <button key={method} type="button" onClick={() => { setPosPaymentMethod(method); if (method === "Credit") setPosIsCredit(true); }} className={`px-2 py-2 rounded-xl text-xs font-bold border truncate ${posPaymentMethod === method ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"}`}>{method}</button>)}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Subtotal:</span><span className="font-mono">KES {cartTotal.toLocaleString()}</span></div>
                    {posDiscount > 0 && <div className="flex justify-between text-red-400"><span>Discount:</span><span className="font-mono">- KES {posDiscount.toLocaleString()}</span></div>}
                    <div className="flex justify-between text-base font-extrabold border-t border-slate-800 pt-1.5"><span>Total:</span><span className="font-mono text-emerald-400">KES {Math.max(0, cartTotal - posDiscount).toLocaleString()}</span></div>
                  </div>
                  <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold py-3 rounded-xl transition">Complete Checkout 🚀</button>
                </div>
                {lastReceipt && (
                  <div className="bg-white text-slate-900 p-4 rounded-xl border-2 border-slate-300 shadow-2xl font-mono text-xs space-y-3">
                    <div className="text-center border-b border-dashed border-slate-400 pb-2"><h4 className="font-bold text-sm">OPENFLOAT POS X</h4><p className="text-[10px] text-slate-500">{lastReceipt.branch}</p><p className="text-[9px] text-slate-400">{lastReceipt.date}</p></div>
                    <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2"><div className="flex justify-between"><span>Receipt:</span><span>{lastReceipt.receiptNo}</span></div><div className="flex justify-between"><span>Customer:</span><span className="font-bold">{lastReceipt.customerName}</span></div></div>
                    <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">{lastReceipt.items.map((item: any) => <div key={item.productId} className="flex justify-between"><span>{item.product.name.substring(0, 18)} x{item.quantity}</span><span>KES {(item.product.price * item.quantity).toLocaleString()}</span></div>)}</div>
                    <div className="text-right text-xs"><div className="flex justify-between"><span>Total:</span><span className="font-bold">KES {lastReceipt.total.toLocaleString()}</span></div></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: INVENTORY - Only roles with inventory permission */}
          {/* ============================================================ */}
          {activeTab === "inventory" && hasPermission(activeRole, "inventory") && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/50"><div><span className="text-[10px] text-slate-400">🟢 HEALTHY</span><span className="text-lg font-black text-emerald-400 block">{data.products.filter(p => p.stock > p.reorderLevel).length}</span></div></div>
                <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-900/50"><div><span className="text-[10px] text-slate-400">🟡 REORDER</span><span className="text-lg font-black text-amber-400 block">{data.products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length}</span></div></div>
                <div className="bg-red-950/40 p-3 rounded-xl border border-red-900/50"><div><span className="text-[10px] text-slate-400">🔴 OUT OF STOCK</span><span className="text-lg font-black text-red-400 block">{data.products.filter(p => p.stock === 0).length}</span></div></div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800"><div><span className="text-[10px] text-slate-400">⚫ DEAD STOCK</span><span className="text-lg font-black text-slate-400 block">{data.products.filter(p => p.stock > 50 && p.salesCount === 0).length}</span></div></div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">All Products</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.products.map(p => {
                    const margin = Math.round(((p.price - p.cost) / p.price) * 100);
                    const isOut = p.stock === 0;
                    const isLow = p.stock > 0 && p.stock <= p.reorderLevel;
                    return (
                      <div key={p.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div><div className="font-bold text-slate-200">{p.name}</div><div className="text-[10px] text-slate-400">Stock: {p.stock} | Margin: {margin}%</div></div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isOut ? 'bg-red-950 text-red-400' : isLow ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'}`}>{isOut ? 'OUT' : isLow ? 'REORDER' : 'OK'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: PROCUREMENT - Only roles with procurement permission */}
          {/* ============================================================ */}
          {activeTab === "procurement" && hasPermission(activeRole, "procurement") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">New Purchase Request</h3>
                <form onSubmit={handleProcureSubmit} className="space-y-3 mt-4">
                  <select value={procureProduct} onChange={(e) => setProcureProduct(Number(e.target.value))} className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-2 border border-slate-700 w-full">
                    {data.products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" min="1" value={procureQty} onChange={(e) => setProcureQty(Number(e.target.value))} placeholder="Qty" className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-1.5 border border-slate-700 w-full font-mono" />
                    <input type="number" min="1" value={procureCost} onChange={(e) => setProcureCost(Number(e.target.value))} placeholder="Cost/unit" className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-1.5 border border-slate-700 w-full font-mono" />
                  </div>
                  <input type="text" value={procureSupplier} onChange={(e) => setProcureSupplier(e.target.value)} placeholder="Supplier" className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-2 border border-slate-700 w-full" required />
                  <div className="bg-slate-900 p-2.5 rounded-xl text-xs flex justify-between"><span>Total:</span><strong className="text-emerald-400">KES {(procureQty * procureCost).toLocaleString()}</strong></div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs">Submit</button>
                </form>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Pending Requests</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto mt-4">
                  {data.procurements.filter(p => p.status === "Pending Approval").length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No pending requests</p> : data.procurements.filter(p => p.status === "Pending Approval").map(p => {
                    const prod = data.products.find(x => x.id === p.productId);
                    return (
                      <div key={p.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div><div className="font-bold text-slate-200">{prod?.name || 'Unknown'}</div><div className="text-[10px] text-slate-400">Qty: {p.quantity}</div></div>
                        <button onClick={() => handleApproveProcure(p.id, "Approve")} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1 rounded">Approve</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: ACCOUNTING - Only roles with accounting permission */}
          {/* ============================================================ */}
          {activeTab === "accounting" && hasPermission(activeRole, "accounting") && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><span className="text-xs text-slate-400">LIQUID POSITION</span><div className="text-xl font-mono font-black text-white">KES {(stats.cashInHand + stats.bankBalance + stats.mobileBalance).toLocaleString()}</div></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><span className="text-xs text-slate-400">RECEIVABLE</span><div className="text-xl font-mono font-black text-red-400">KES {stats.customerDebts.toLocaleString()}</div></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><span className="text-xs text-slate-400">PAYABLE</span><div className="text-xl font-mono font-black text-amber-500">KES {stats.supplierBalance.toLocaleString()}</div></div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Profit & Loss</h3>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1"><span>Revenue</span><span className="font-mono text-emerald-400">KES {stats.totalRevenue.toLocaleString()}</span></div>
                  <div className="flex justify-between border-b border-slate-800 pb-1"><span>Gross Margin</span><span className="font-mono text-emerald-400">KES {Math.round(stats.totalRevenue * 0.39).toLocaleString()}</span></div>
                  <div className="flex justify-between font-black text-white pt-2 text-base border-t-2 border-slate-700"><span>Net Margin</span><span className="font-mono text-emerald-400">KES {Math.max(0, Math.round(stats.totalRevenue * 0.39) - 120000).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: HR - Only roles with HR permission */}
          {/* ============================================================ */}
          {activeTab === "hr" && hasPermission(activeRole, "hr") && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400"><Clock className="h-4 w-4 text-emerald-400 inline" /> Attendance</h3>
                <form onSubmit={handleClockIn} className="space-y-3 mt-4">
                  <select value={attendanceEmp} onChange={(e) => setAttendanceEmp(Number(e.target.value))} className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-2 border border-slate-700 w-full">
                    {data.employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={attendanceStatus} onChange={(e) => setAttendanceStatus(e.target.value)} className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-1.5 border border-slate-700 w-full">
                      <option value="Present">Present</option><option value="Late">Late</option><option value="Absent">Absent</option>
                    </select>
                    <select value={attendanceMethod} onChange={(e) => setAttendanceMethod(e.target.value)} className="bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-1.5 border border-slate-700 w-full">
                      <option value="Facial">Facial</option><option value="Fingerprint">Fingerprint</option><option value="GPS">GPS</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs">Record Check-In</button>
                </form>
              </div>
              <div className="xl:col-span-7 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between"><h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Payroll</h3>
                  <select value={payrollEmpId} onChange={(e) => setPayrollEmpId(Number(e.target.value))} className="bg-slate-900 text-xs text-white rounded-lg px-2.5 py-1 border border-slate-700">
                    {data.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                {calculatedPayslip && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-xs"><div><span className="text-slate-400">Basic</span><strong className="text-white font-mono block">KES {calculatedPayslip.basic.toLocaleString()}</strong></div>
                    <div className="text-right"><span className="text-slate-400">Net Pay</span><strong className="text-emerald-400 font-mono text-lg block">KES {calculatedPayslip.net.toLocaleString()}</strong></div></div>
                    <button className="mt-4 bg-blue-600 text-white text-xs px-3 py-1 rounded">📧 Send Payslip</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: CRM - Only roles with CRM permission */}
          {/* ============================================================ */}
          {activeTab === "crm" && hasPermission(activeRole, "crm") && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center"><span className="text-[10px] text-blue-400 font-bold">💎 VIP</span><span className="text-xl font-black text-white block">{data.customers.filter(c => c.segment === "VIP").length}</span></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center"><span className="text-[10px] text-emerald-400 font-bold">🏢 CORPORATE</span><span className="text-xl font-black text-white block">{data.customers.filter(c => c.segment === "Corporate").length}</span></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center"><span className="text-[10px] text-amber-500 font-bold">⚠️ AT-RISK</span><span className="text-xl font-black text-white block">{data.customers.filter(c => c.churnRisk > 50).length}</span></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center"><span className="text-[10px] text-purple-400 font-bold">⭐ LOYALTY</span><span className="text-xl font-black text-white block">{data.customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)} pts</span></div>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Customers</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto mt-3">
                  {data.customers.map(c => (
                    <div key={c.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div><div className="font-bold text-slate-200">{c.name}</div><div className="text-[10px] text-slate-400">{c.email}</div></div>
                      <div className="text-right"><div className="font-mono text-red-400">KES {c.outstandingDebt.toLocaleString()}</div><div className="text-[10px] text-slate-400">{c.loyaltyPoints} pts</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 8: BRANCHES - Only roles with branches permission */}
          {/* ============================================================ */}
          {activeTab === "branches" && hasPermission(activeRole, "branches") && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Switch Branch</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {data.branches.map(b => {
                  const isSelected = b.id === activeBranchId;
                  return (
                    <div key={b.id} onClick={() => setActiveBranchId(b.id)} className={`p-4 rounded-xl border cursor-pointer transition ${isSelected ? "bg-blue-950 border-blue-500 shadow-xl" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`}>
                      <h4 className="font-bold text-white text-sm">{b.name}</h4>
                      <p className="text-xs text-slate-400">{b.city}</p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-2">KES {b.revenue.toLocaleString()}</p>
                      {isSelected && <span className="bg-blue-600 text-[10px] text-white font-bold px-2 py-0.5 rounded mt-2 block text-center">✓ Active</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 9: LOGISTICS - Only roles with logistics permission */}
          {/* ============================================================ */}
          {activeTab === "logistics" && hasPermission(activeRole, "logistics") && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Deliveries</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto mt-4">
                {data.deliveries.map(d => {
                  const rider = data.employees.find(x => x.id === d.riderId);
                  return (
                    <div key={d.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div><div className="font-bold text-slate-200">Delivery #{d.id}</div><div className="text-[10px] text-slate-400">Rider: {rider?.name || 'Unknown'} | Order #{d.orderId}</div></div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${d.status === 'Delivered' ? 'bg-emerald-950 text-emerald-400' : d.status === 'In Transit' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>{d.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 10: AI ASSISTANT - Only roles with AI permission */}
          {/* ============================================================ */}
          {activeTab === "ai" && hasPermission(activeRole, "ai") && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-yellow-300" /> AI Business Advisor</h3>
                <p className="text-xs text-slate-400">Ask questions about your business data</p>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={`space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-2xl text-xs max-w-2xl leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'}`}>
                      <div className="whitespace-pre-line text-left">{msg.text}</div>
                      {msg.chartData && (
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <h5 className="text-[10px] uppercase font-bold text-slate-400">{msg.chartTitle}</h5>
                          {msg.chartData.map((item: any, i: number) => {
                            const maxVal = Math.max(...msg.chartData.map((x: any) => x.value)) || 1;
                            return (
                              <div key={i} className="space-y-1 mt-1">
                                <div className="flex justify-between text-[9px]"><span>{item.label}</span><span className="font-mono font-bold">KES {item.value.toLocaleString()}</span></div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden"><div style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: item.color }} className="h-full rounded-full"></div></div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {msg.actions && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                          {msg.actions.map((act: string, i: number) => <button key={i} onClick={() => toast(`⚡ Executing: ${act}`)} className="bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-[10px] font-semibold px-2 py-1 rounded">⚡ {act}</button>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {aiLoading && <div className="text-left"><div className="bg-slate-900 inline-block p-3 rounded-xl text-xs text-slate-400 border border-slate-800 animate-pulse">Analyzing...</div></div>}
              </div>
              <div className="pt-2 border-t border-slate-800">
                <div className="flex flex-wrap gap-2 mb-2">
                  {["Why are profits declining?", "Which products should I restock?", "Which branch is underperforming?"].map(chip => <button key={chip} onClick={() => handleAiQuery(chip)} className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] px-3 py-1.5 rounded-lg border border-slate-800">🔍 {chip}</button>)}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ask a question..." value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiQuery(aiInput)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={() => handleAiQuery(aiInput)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 rounded-xl"><Send className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ACCESS DENIED - When user tries to access a module they don't have permission for */}
          {/* ============================================================ */}
          {!hasPermission(activeRole, activeTab) && activeTab !== "executive" && (
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center">
              <Lock className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">Access Restricted</h3>
              <p className="text-sm text-slate-400 mt-2">
                Your role ({activeRole}) does not have permission to access this module.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Please contact your administrator for access.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-300">OpenFloat POS X – Intelligent Commerce Platform</p>
          <p>Drizzle ORM & PostgreSQL: <span className="text-emerald-500 font-mono">ACTIVE</span></p>
          <p className="text-[10px] text-slate-500">© 2026 OpenFloat Inc. | Logged in as: {userName} ({userRole})</p>
        </div>
      </footer>
    </div>
  );
}