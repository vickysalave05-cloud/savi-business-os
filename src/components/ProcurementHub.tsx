import React, { useState, useMemo } from "react";
import { Customer, Material, Vendor, MaterialPurchase } from "../types";
import { 
  Plus, 
  Trash2, 
  Search, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Coins, 
  Users, 
  Layers, 
  FileText, 
  Check, 
  Star, 
  Share2, 
  AlertTriangle, 
  Percent, 
  Truck, 
  ArrowUpRight, 
  ShieldCheck, 
  HardDrive, 
  Wrench,
  Download,
  Filter,
  DollarSign,
  CloudLightning
} from "lucide-react";
import { MaterialsDatabase } from "./MaterialsDatabase";
import { syncMaterialPurchaseToGoogle } from "../utils/googleSync";

interface ProcurementHubProps {
  customers: Customer[];
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onUpdateMaterialRate: (id: string, newRate: number) => void;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  purchases: MaterialPurchase[];
  setPurchases: React.Dispatch<React.SetStateAction<MaterialPurchase[]>>;
}

export const ProcurementHub: React.FC<ProcurementHubProps> = ({
  customers,
  materials,
  onAddMaterial,
  onUpdateMaterialRate,
  vendors,
  setVendors,
  purchases,
  setPurchases
}) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledger" | "variance" | "profit" | "vendors" | "products">("dashboard");

  // Filter/Search states for ledger
  const [searchPurchase, setSearchPurchase] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterProject, setFilterProject] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");

  // Filter/Search states for vendors
  const [searchVendor, setSearchVendor] = useState("");
  const [filterVendorCategory, setFilterVendorCategory] = useState("All");

  // Cost tracking selected project
  const [selectedProjectId, setSelectedProjectId] = useState<string>("All");

  // Profitability engine customer selector
  const projectsList = useMemo(() => {
    return customers.filter(c => c.project && c.project.id);
  }, [customers]);

  const [selectedProfitCustomerId, setSelectedProfitCustomerId] = useState<string>(
    projectsList.length > 0 ? projectsList[0].id : ""
  );

  // Form states for NEW Purchase
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [pCustId, setPCustId] = useState("");
  const [pVendorId, setPVendorId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("2026-06-21");
  const [pInvoiceNum, setPInvoiceNum] = useState("");
  const [pCategory, setPCategory] = useState<MaterialPurchase["materialCategory"]>("Paint");
  const [pBrand, setPBrand] = useState("Asian Paints");
  const [pProductName, setPProductName] = useState("");
  const [pQty, setPQty] = useState<number>(0);
  const [pUnit, setPUnit] = useState("Liters");
  const [pRate, setPRate] = useState<number>(0);
  const [pGstPercent, setPGstPercent] = useState<number>(18);
  const [pTransport, setPTransport] = useState<number>(0);
  const [pLoading, setPLoading] = useState<number>(0);
  const [pOther, setPOther] = useState<number>(0);
  const [pStatus, setPStatus] = useState<MaterialPurchase["paymentStatus"]>("Paid");
  const [pPaidAmount, setPPaidAmount] = useState<number>(0);
  const [pWastageQty, setPWastageQty] = useState<number>(0);
  const [pWastageReason, setPWastageReason] = useState("");
  const [driveUploading, setDriveUploading] = useState(false);
  const [driveAttached, setDriveAttached] = useState(false);
  const [mockDriveFileId, setMockDriveFileId] = useState("");

  // Form states for NEW Vendor
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vName, setVName] = useState("");
  const [vMobile, setVMobile] = useState("");
  const [vAddress, setVAddress] = useState("");
  const [vGst, setVGst] = useState("");
  const [vCats, setVCats] = useState<string[]>(["Paint"]);
  const [vRating, setVRating] = useState<number>(5);

  // Auto-Update Vendor unpaid/purchase count details
  const vendorsWithCalculatedStats = useMemo(() => {
    return vendors.map(v => {
      const vendorPurchases = purchases.filter(p => p.vendorId === v.id);
      const outstanding = vendorPurchases
        .filter(p => p.paymentStatus !== "Paid")
        .reduce((sum, p) => sum + (p.finalPurchaseAmount - p.paidAmount), 0);

      return {
        ...v,
        purchaseCount: vendorPurchases.length,
        outstandingPayment: outstanding
      };
    });
  }, [vendors, purchases]);

  // Handle New Purchase Submission
  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pVendorId) {
      alert("Please select a Vendor first.");
      return;
    }

    const selectedVendor = vendors.find(v => v.id === pVendorId);
    if (!selectedVendor) return;

    let targetCust: Customer | undefined;
    let pName = "Generic Store/Warehouse Inventory";
    let cName = "Stock Pool";
    let pId = "stock-pool";

    if (pCustId && pCustId !== "stock") {
      targetCust = customers.find(c => c.id === pCustId);
      if (targetCust && targetCust.project) {
        pId = targetCust.project.id;
        pName = targetCust.project.notes ? targetCust.project.notes.split(".")[0] : "Painting Works";
        cName = targetCust.name;
      }
    }

    const baseAmount = Number(pQty) * Number(pRate);
    const gstVal = Math.round(baseAmount * (Number(pGstPercent) / 100) * 100) / 100;
    const grossTotal = baseAmount + gstVal + Number(pTransport) + Number(pLoading) + Number(pOther);

    const actualPaid = pStatus === "Paid" ? grossTotal : pStatus === "Pending" ? 0 : Number(pPaidAmount);

    const newPurchase: MaterialPurchase = {
      id: `pur-${Date.now()}`,
      projectId: pId,
      customerId: pCustId || "stock",
      projectName: pName,
      customerName: cName,
      purchaseDate: purchaseDate,
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      vendorMobile: selectedVendor.mobile,
      vendorGst: selectedVendor.gstNumber,
      invoiceNumber: pInvoiceNum || `INV-${Date.now().toString().slice(-4)}`,
      materialCategory: pCategory,
      brand: pBrand,
      productName: pProductName || `${pBrand} Paint Grade A`,
      quantity: Number(pQty),
      unit: pUnit,
      rate: Number(pRate),
      amount: baseAmount,
      gstPercent: Number(pGstPercent),
      gstAmount: gstVal,
      transportCost: Number(pTransport),
      loadingUnloadingCost: Number(pLoading),
      otherCharges: Number(pOther),
      finalPurchaseAmount: grossTotal,
      paymentStatus: pStatus,
      paidAmount: actualPaid,
      invoiceCopyUrl: driveAttached ? `https://drive.google.com/open?id=${mockDriveFileId}` : undefined,
      billPdfUrl: driveAttached ? `https://drive.google.com/file/d/${mockDriveFileId}/view` : undefined,
      googleDriveFileId: driveAttached ? mockDriveFileId : undefined,
      wastageQuantity: Number(pWastageQty) || 0,
      wastageReason: pWastageReason || undefined
    };

    setPurchases(prev => [newPurchase, ...prev]);

    // Sync to Google
    syncMaterialPurchaseToGoogle(newPurchase);

    // Force timelines updates to customer
    if (targetCust) {
      targetCust.timeline.push({
        id: `t-pur-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: "Procured Materials",
        description: `Directly logged bill copy [${newPurchase.invoiceNumber}] from ${newPurchase.vendorName}. Total cost: ₹${newPurchase.finalPurchaseAmount.toLocaleString("en-IN")}. Standard inventory logged.`,
        icon: "Briefcase",
        user: "Operations Manager"
      });
    }

    // Reset Form states
    setShowAddPurchase(false);
    setPCustId("");
    setPVendorId("");
    setPInvoiceNum("");
    setPProductName("");
    setPQty(0);
    setPRate(0);
    setPTransport(0);
    setPLoading(0);
    setPOther(0);
    setDriveAttached(false);
    setMockDriveFileId("");
    setPWastageQty(0);
    setPWastageReason("");
  };

  // Handle New Vendor Addition
  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim()) return;

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: vName,
      mobile: vMobile,
      address: vAddress || "Pune Retail Market Area",
      gstNumber: vGst || undefined,
      materialCategories: vCats,
      purchaseCount: 0,
      outstandingPayment: 0,
      rating: vRating,
      createdAt: new Date().toISOString()
    };

    setVendors(prev => [...prev, newVendor]);
    setShowAddVendor(false);
    setVName("");
    setVMobile("");
    setVAddress("");
    setVGst("");
    setVCats(["Paint"]);
  };

  const toggleCategorySelection = (cat: string) => {
    if (vCats.includes(cat)) {
      if (vCats.length > 1) {
        setVCats(vCats.filter(c => c !== cat));
      }
    } else {
      setVCats([...vCats, cat]);
    }
  };

  // Google Drive Simulation helper
  const triggerGoogleDriveSimulationUpload = () => {
    setDriveUploading(true);
    setTimeout(() => {
      const generatedId = `gdrive-pdf-id-${Math.floor(100000 + Math.random() * 900000)}`;
      setMockDriveFileId(generatedId);
      setDriveUploading(false);
      setDriveAttached(true);
    }, 1500);
  };

  // Compute stats for Tab 1 (Dashboard Dashboard Analytics)
  const totalPurchaseCostAggregate = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.finalPurchaseAmount, 0);
  }, [purchases]);

  const totalOutstandingToVendors = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.finalPurchaseAmount - p.paidAmount), 0);
  }, [purchases]);

  const categoryPurchasePie = useMemo(() => {
    const list: Record<string, number> = {};
    purchases.forEach(p => {
      list[p.materialCategory] = (list[p.materialCategory] || 0) + p.finalPurchaseAmount;
    });
    return list;
  }, [purchases]);

  const vendorPurchasePie = useMemo(() => {
    const list: Record<string, number> = {};
    purchases.forEach(p => {
      list[p.vendorName] = (list[p.vendorName] || 0) + p.finalPurchaseAmount;
    });
    return list;
  }, [purchases]);

  const projectPurchasePie = useMemo(() => {
    const list: Record<string, number> = {};
    purchases.forEach(p => {
      const label = p.customerId === "stock" ? "General Stock" : `${p.customerName}`;
      list[label] = (list[label] || 0) + p.finalPurchaseAmount;
    });
    return list;
  }, [purchases]);

  const topMaterialsUsedArray = useMemo(() => {
    const list: Record<string, { qty: number, brand: string, unit: string, cost: number }> = {};
    purchases.forEach(p => {
      const key = `${p.brand} ${p.productName}`;
      if (!list[key]) {
        list[key] = { qty: 0, brand: p.brand, unit: p.unit, cost: 0 };
      }
      list[key].qty += p.quantity;
      list[key].cost += p.finalPurchaseAmount;
    });
    return Object.entries(list)
      .map(([name, obj]) => ({ name, ...obj }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [purchases]);

  // Compute variables for Tab 3 (Cost Tracking and Variance Screen)
  const costVarianceReportData = useMemo(() => {
    // Group all material estimator quotes from CRM customers
    return customers.map(cust => {
      const acceptedQuote = cust.finalQuotations.find(q => q.status === "Approved") || cust.finalQuotations[0];
      
      let estimatedCost = 0;
      if (acceptedQuote) {
        // sum up actual paint/putty/primer lines
        estimatedCost = acceptedQuote.items
          .filter(item => ["Paint", "Primer", "Putty", "Texture", "Waterproofing"].includes(item.category))
          .reduce((sum, i) => sum + i.amount, 0);
      } else if (cust.roughEstimate) {
        // assume material cost is roughly 35% of total rough estimate
        estimatedCost = cust.roughEstimate.totalEstimate * 0.35;
      }

      // get actual purchases
      const actualPurchased = purchases
        .filter(p => p.customerId === cust.id)
        .reduce((sum, p) => sum + p.finalPurchaseAmount, 0);

      const varianceValue = actualPurchased - estimatedCost;
      const pctVariance = estimatedCost > 0 ? (varianceValue / estimatedCost) * 100 : 0;
      
      // wastage estimation (aggregate reported wastage cost)
      const wastageValue = purchases
        .filter(p => p.customerId === cust.id)
        .reduce((sum, p) => sum + ((p.wastageQuantity || 0) * p.rate), 0);

      return {
        customerId: cust.id,
        customerName: cust.name,
        projectName: cust.project?.notes?.split(".")[0] || (cust.roughEstimate ? `${cust.roughEstimate.workType} Area` : "Refinishing"),
        projectStatus: cust.project?.status || "Lead Pipeline",
        estimatedCost,
        actualPurchased,
        varianceValue,
        pctVariance,
        wastageValue,
        balanceStockValue: Math.max(0, actualPurchased - estimatedCost - wastageValue)
      };
    });
  }, [customers, purchases]);

  // Profitability calculations for selected customer (Tab 4)
  const selectedProfitabilityData = useMemo(() => {
    if (!selectedProfitCustomerId) return null;
    const cust = customers.find(c => c.id === selectedProfitCustomerId);
    if (!cust) return null;

    const acceptedQuote = cust.finalQuotations.find(q => q.status === "Approved") || cust.finalQuotations[0];
    const quotationAmount = acceptedQuote ? acceptedQuote.finalAmount : (cust.roughEstimate ? cust.roughEstimate.totalEstimate : 0);

    // Actual material cost
    const materialCost = purchases
      .filter(p => p.customerId === cust.id)
      .reduce((sum, p) => sum + p.finalPurchaseAmount, 0);

    // Labour / Services
    let labourCost = 0;
    let transportCost = 0;
    let scaffoldingCost = 0;
    if (acceptedQuote) {
      labourCost = acceptedQuote.items.filter(i => i.category === "Labour").reduce((sum, i) => sum + i.amount, 0);
      transportCost = acceptedQuote.items.filter(i => i.category === "Transport").reduce((sum, i) => sum + i.amount, 0);
      scaffoldingCost = acceptedQuote.items.filter(i => i.category === "Scaffolding").reduce((sum, i) => sum + i.amount, 0);
    } else if (cust.roughEstimate) {
      // rough breakdown ratios
      labourCost = cust.roughEstimate.totalEstimate * 0.40;
      transportCost = 3000;
      scaffoldingCost = 2000;
    }

    // other expenses logged
    const otherExpenses = purchases
      .filter(p => p.customerId === cust.id && p.materialCategory === "Other")
      .reduce((sum, p) => sum + p.finalPurchaseAmount, 0);

    const totalProjectCost = materialCost + labourCost + transportCost + scaffoldingCost + otherExpenses;
    const grossProfit = quotationAmount - materialCost;
    const netProfit = quotationAmount - totalProjectCost;
    const profitPercentage = quotationAmount > 0 ? (netProfit / quotationAmount) * 100 : 0;

    return {
      custName: cust.name,
      quotationAmount,
      materialCost,
      labourCost,
      transportCost,
      scaffoldingCost,
      otherExpenses,
      totalProjectCost,
      grossProfit,
      netProfit,
      profitPercentage
    };
  }, [selectedProfitCustomerId, customers, purchases]);

  // Filter purchase ledger rows
  const filteredPurchasesLedger = useMemo(() => {
    return purchases.filter(p => {
      const matchesSearch = p.vendorName.toLowerCase().includes(searchPurchase.toLowerCase()) || 
                            p.productName.toLowerCase().includes(searchPurchase.toLowerCase()) ||
                            p.invoiceNumber.toLowerCase().includes(searchPurchase.toLowerCase());
      const matchesCategory = filterCategory === "All" || p.materialCategory === filterCategory;
      const matchesProject = filterProject === "All" || p.projectId === filterProject;
      const matchesPayment = filterPayment === "All" || p.paymentStatus === filterPayment;

      return matchesSearch && matchesCategory && matchesProject && matchesPayment;
    });
  }, [purchases, searchPurchase, filterCategory, filterProject, filterPayment]);

  // Filter vendor list rows
  const filteredVendorDirectory = useMemo(() => {
    return vendorsWithCalculatedStats.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchVendor.toLowerCase()) || 
                            (v.gstNumber && v.gstNumber.toLowerCase().includes(searchVendor.toLowerCase())) ||
                            v.mobile.includes(searchVendor);
      const matchesCategory = filterVendorCategory === "All" || v.materialCategories.includes(filterVendorCategory);
      return matchesSearch && matchesCategory;
    });
  }, [vendorsWithCalculatedStats, searchVendor, filterVendorCategory]);

  return (
    <div className="space-y-6" id="procurement-hub-workspace">
      {/* 1. SECTION BRAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-teal-400 font-bold uppercase tracking-widest text-[10px] bg-slate-800 py-1 px-3 rounded-full border border-slate-700/60 inline-block mb-2 shadow-inner">PROCUREMENT ENGINE v3.5</span>
          <h2 className="text-2xl font-extrabold tracking-tight" id="procurement-main-heading">Materials Procurement & Cost Hub</h2>
          <p className="text-xs text-slate-300 max-w-xl">Central corporate ledger connecting raw paint inventories, project allocations, Google Drive secure file storage, real-time wastage logs, and automatic project profitability calculators.</p>
        </div>
        
        {/* ACTION SHORTCUT FOR ENTIRE CONTEXT */}
        <div className="flex flex-wrap gap-2">
          <button 
            id="quick-add-purchase-btn"
            onClick={() => { setShowAddPurchase(true); setActiveTab("ledger"); }}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record Purchase
          </button>
          <button 
            id="quick-add-vendor-btn"
            onClick={() => { setShowAddVendor(true); setActiveTab("vendors"); }}
            className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" /> Register Vendor
          </button>
        </div>
      </div>

      {/* 2. TABBED NAVIGATION */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 no-scrollbar" id="procurement-nav-bar">
        {(["dashboard", "ledger", "variance", "profit", "vendors", "products"] as const).map((tab) => {
          const labels = {
            dashboard: "Procurement Dashboard",
            ledger: "Purchase Ledger",
            variance: "Material Cost Tracker",
            profit: "Profitability Engine",
            vendors: "Vendor Management",
            products: "Master Trade Products"
          };
          const isActive = activeTab === tab;
          return (
            <button
              id={`tab-btn-${tab}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-5 text-xs font-bold whitespace-nowrap rounded-xl transition-all ${
                isActive 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* 3. CONDITIONAL RENDER SPAN OF CLIENT TAB MODULES */}

      {/* ======================================================== */}
      {/* TAB A: PROCUREMENT ANALYTICS DASHBOARD */}
      {/* ======================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6" id="dashboard-tab-space">
          {/* Executive Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Total Purchases</span>
                <span className="text-xl font-black text-slate-800 font-mono">₹{totalPurchaseCostAggregate.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Pending Liability</span>
                <span className="text-xl font-black text-orange-700 font-mono">₹{totalOutstandingToVendors.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Active Vendors</span>
                <span className="text-xl font-black text-slate-800 font-mono">{vendors.length} Dealers</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Total Wastage Cost</span>
                <span className="text-xl font-black text-rose-700 font-mono">
                  ₹{purchases.reduce((sum, p) => sum + ((p.wastageQuantity || 0) * p.rate), 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual breakdown lists mimicking charts */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-800">Category-wise Share</h4>
                <p className="text-[10px] text-slate-400">Inventory investment across product classes</p>
              </div>
              <div className="space-y-3">
                {Object.keys(categoryPurchasePie).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No purchases recorded yet</p>
                ) : (
                  Object.entries(categoryPurchasePie).map(([category, amt]) => {
                    const amtVal = Number(amt);
                    const pct = totalPurchaseCostAggregate > 0 ? (amtVal / totalPurchaseCostAggregate) * 100 : 0;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{category}</span>
                          <span className="font-mono">₹{amtVal.toLocaleString("en-IN")} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-800">Dealer / Vendor Allocation</h4>
                <p className="text-[10px] text-slate-400">Financial distribution among partners</p>
              </div>
              <div className="space-y-3">
                {Object.keys(vendorPurchasePie).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No vendor sales logged</p>
                ) : (
                  Object.entries(vendorPurchasePie).map(([dealer, amt]) => {
                    const amtVal = Number(amt);
                    const pct = totalPurchaseCostAggregate > 0 ? (amtVal / totalPurchaseCostAggregate) * 100 : 0;
                    return (
                      <div key={dealer} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate max-w-44">{dealer}</span>
                          <span className="font-mono">₹{amtVal.toLocaleString("en-IN")} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-violet-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-800">Project-wise Expenditure</h4>
                <p className="text-[10px] text-slate-400">Capital tied directly to painting projects</p>
              </div>
              <div className="space-y-3">
                {Object.keys(projectPurchasePie).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No project allocations</p>
                ) : (
                  Object.entries(projectPurchasePie).map(([proj, amt]) => {
                    const amtVal = Number(amt);
                    const pct = totalPurchaseCostAggregate > 0 ? (amtVal / totalPurchaseCostAggregate) * 100 : 0;
                    return (
                      <div key={proj} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="truncate max-w-44">{proj}</span>
                          <span className="font-mono font-bold text-slate-800">₹{amtVal.toLocaleString("en-IN")} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-800 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Top materials used & trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Top Utilized Materials</h4>
                  <p className="text-[10px] text-slate-400">Most commonly purchased trade items</p>
                </div>
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 py-0.5 px-2 rounded font-bold uppercase font-mono">By Cost Volume</span>
              </div>
              <div className="divide-y divide-slate-100">
                {topMaterialsUsedArray.map((mat, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-500">{idx + 1}</span>
                      <div>
                        <span className="font-bold text-slate-805 block">{mat.name}</span>
                        <span className="text-[10px] text-slate-400">Total volume ordered: {mat.qty} {mat.unit}</span>
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-700">₹{mat.cost.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-800">Purchase Timing & Trends Summary</h4>
                <p className="text-[10px] text-slate-400">High-level material cost evaluation indices</p>
              </div>
              <div className="py-4 space-y-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="font-bold text-slate-600">Active Supply Index State</span>
                  <span className="font-bold text-teal-700 flex items-center gap-1">Optimal <ShieldCheck className="w-4 h-4" /></span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="font-bold text-slate-600">Inflation Adjusted Material Margin</span>
                  <span className="font-bold text-slate-800 font-mono">18.4% standard</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <span className="font-bold text-slate-600">Pending Vendor Overdue Liabilities</span>
                  <span className={`font-bold font-mono ${totalOutstandingToVendors > 10000 ? "text-amber-700" : "text-green-700"}`}>
                    ₹{totalOutstandingToVendors.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center">Auto-refreshed periodically matching trade bulk rates</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB B: MATERIAL PURCHASE LEDGER */}
      {/* ======================================================== */}
      {activeTab === "ledger" && (
        <div className="space-y-6" id="ledger-tab-space">
          {/* LEDGER FILTER CONTROLS BAR */}
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-450" />
              <input 
                id="search-purchase-input"
                type="text"
                placeholder="Search ledger by Vendor, Product, Brand, Invoice..."
                value={searchPurchase}
                onChange={(e) => setSearchPurchase(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-10 text-xs focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex gap-2">
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Paint">Paint</option>
                <option value="Primer">Primer</option>
                <option value="Putty">Putty</option>
                <option value="Texture">Texture</option>
                <option value="Waterproofing">Waterproofing</option>
                <option value="Cement">Cement</option>
                <option value="Other">Other</option>
              </select>

              <select
                id="filter-project"
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none max-w-[150px] truncate"
              >
                <option value="All">All Projects</option>
                <option value="stock">General Stock Only</option>
                {customers.filter(c => c.project && c.project.id).map(c => (
                  <option key={c.project?.id} value={c.project?.id}>{c.name}</option>
                ))}
              </select>

              <select
                id="filter-payment"
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC RECORD ENTRY DRAWER IF ACTIVATED */}
          {showAddPurchase ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4" id="ledger-add-drawer">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-white text-base">Record Material Purchase Invoice</h3>
                  <p className="text-[11px] text-slate-300">Creates real-time transaction records, tethers stock to project targets, and hooks file receipts into Google Drive.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddPurchase(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-1 px-3 text-xs font-bold"
                >
                  Close Form
                </button>
              </div>

              <form onSubmit={handleRecordPurchase} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                
                {/* Section A: Vendor & Reference */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[10px] text-teal-400 uppercase tracking-widest font-black block">Section 1: Trade Vendor & Doc</span>
                  
                  <div>
                    <label className="block text-slate-400 mb-1">Select Active Dealer / Vendor *</label>
                    <select
                      id="form-purchase-vendor"
                      required
                      value={pVendorId}
                      onChange={(e) => setPVendorId(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    >
                      <option value="">-- Choose Vendor --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.mobile})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Supplier Invoice Number *</label>
                    <input 
                      id="form-purchase-invoice"
                      type="text"
                      required
                      placeholder="e.g. BALAJI-20182"
                      value={pInvoiceNum}
                      onChange={(e) => setPInvoiceNum(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Material Purchase Date *</label>
                    <input 
                      id="form-purchase-date"
                      type="date"
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  {/* Project Alignment Selector - MANDATORY INTERNAL SHIELD */}
                  <div>
                    <label className="block text-slate-400 mb-1">Tether to Project Assignment *</label>
                    <select
                      id="form-purchase-project"
                      required
                      value={pCustId}
                      onChange={(e) => setPCustId(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs font-bold text-teal-300"
                    >
                      <option value="">-- Choose Target Project --</option>
                      <option value="stock">General Inventory Stock (No Customer Link)</option>
                      {customers.filter(c => c.project && c.project.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.project?.notes?.split(".")[0] || "Painting Services"}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section B: Product & Quantities */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[10px] text-teal-400 uppercase tracking-widest font-black block">Section 2: Material Parameters</span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Trade Category</label>
                      <select
                        id="form-purchase-category"
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value as MaterialPurchase["materialCategory"])}
                        className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                      >
                        <option value="Paint">Paint</option>
                        <option value="Primer">Primer</option>
                        <option value="Putty">Putty</option>
                        <option value="Texture">Texture</option>
                        <option value="Waterproofing">Waterproofing</option>
                        <option value="Cement">Cement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Brand Name</label>
                      <select
                        id="form-purchase-brand"
                        value={pBrand}
                        onChange={(e) => setPBrand(e.target.value)}
                        className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                      >
                        <option value="Asian Paints">Asian Paints</option>
                        <option value="Berger">Berger</option>
                        <option value="Nerolac">Nerolac</option>
                        <option value="Indigo">Indigo</option>
                        <option value="Dr Fixit">Dr Fixit</option>
                        <option value="Pidilite">Pidilite</option>
                        <option value="Sika">Sika</option>
                        <option value="Fosroc">Fosroc</option>
                        <option value="JK Cement">JK Cement</option>
                        <option value="Birla White">Birla White</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Specific Product Title *</label>
                    <input 
                      id="form-purchase-product"
                      type="text"
                      required
                      placeholder="e.g. Royale Luxury Sheen Emulsion"
                      value={pProductName}
                      onChange={(e) => setPProductName(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="col-span-1">
                      <label className="block text-slate-400 mb-0.5">Quantity *</label>
                      <input 
                        id="form-purchase-qty"
                        type="number"
                        min="1"
                        required
                        value={pQty || ""}
                        onChange={(e) => setPQty(Number(e.target.value))}
                        className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs font-mono text-center"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-slate-400 mb-0.5">Unit</label>
                      <select
                        id="form-purchase-unit"
                        value={pUnit}
                        onChange={(e) => setPUnit(e.target.value)}
                        className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs text-center"
                      >
                        <option value="Liters">Liters</option>
                        <option value="Kgs">Kgs</option>
                        <option value="Bags">Bags</option>
                        <option value="Boxes">Boxes</option>
                        <option value="Rolls">Rolls</option>
                        <option value="Lumpsum">Lumpsum</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-slate-400 mb-0.5">Dealer Rate *</label>
                      <input 
                        id="form-purchase-rate"
                        type="number"
                        min="1"
                        required
                        value={pRate || ""}
                        onChange={(e) => setPRate(Number(e.target.value))}
                        className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Wastage parameters during log */}
                  <div className="border border-slate-800 p-2.5 rounded-xl space-y-2 bg-[#0c121e]">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] text-amber-300 font-bold uppercase tracking-wider">Log Spill/Wastage ?</label>
                      <span className="text-[9px] text-slate-400">Track balance stock</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Qty Wasted</label>
                        <input 
                          id="form-purchase-wastage-qty"
                          type="number"
                          placeholder="e.g. 2"
                          value={pWastageQty || ""}
                          onChange={(e) => setPWastageQty(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 text-xs font-mono text-center text-amber-300"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Wastage Note / Reason</label>
                        <input 
                          id="form-purchase-wastage-reason"
                          type="text"
                          placeholder="Leakage, hardening..."
                          value={pWastageReason}
                          onChange={(e) => setPWastageReason(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Financials, Taxes & Google Drive Integration */}
                <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-teal-400 uppercase tracking-widest font-black block mb-2">Section 3: Costs & Drive Secure</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Taxes GST %</label>
                        <select
                          id="form-purchase-gst"
                          value={pGstPercent}
                          onChange={(e) => setPGstPercent(Number(e.target.value))}
                          className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-1.5 text-xs font-mono text-white"
                        >
                          <option value="18">18% standard</option>
                          <option value="12">12% low paint</option>
                          <option value="28">28% heavy goods</option>
                          <option value="5">5% raw items</option>
                          <option value="0">0% exempted</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Transport Cost</label>
                        <input 
                          id="form-purchase-transport"
                          type="number"
                          value={pTransport || ""}
                          onChange={(e) => setPTransport(Number(e.target.value))}
                          className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-center font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Loading Charges</label>
                        <input 
                          id="form-purchase-loading"
                          type="number"
                          value={pLoading || ""}
                          onChange={(e) => setPLoading(Number(e.target.value))}
                          className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-center font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Other/Custom Fee</label>
                        <input 
                          id="form-purchase-other"
                          type="number"
                          value={pOther || ""}
                          onChange={(e) => setPOther(Number(e.target.value))}
                          className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-1.5 text-xs text-center font-mono"
                        />
                      </div>
                    </div>

                    {/* Google Drive Connector Cloud Attachment */}
                    <div className="border border-teal-900 bg-teal-950/20 p-3 rounded-xl mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-teal-350 text-[10px] uppercase tracking-wider font-extrabold">
                          <HardDrive className="w-3.5 h-3.5 text-teal-400" /> Google Drive Cloud Storage
                        </span>
                        {driveAttached && <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Securely Stored</span>}
                      </div>

                      <p className="text-[10px] text-slate-350 leading-relaxed">Instantly compile physical vendor bills and upload securely to Google Drive under project directories.</p>

                      <button
                        type="button"
                        id="btn-trigger-drive-sim"
                        onClick={triggerGoogleDriveSimulationUpload}
                        disabled={driveUploading}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                          driveAttached 
                            ? "bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-700"
                            : driveUploading 
                              ? "bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed"
                              : "bg-slate-850 hover:bg-slate-750 text-teal-300 border-slate-700"
                        }`}
                      >
                        {driveUploading ? (
                          <>Uploading to Drive...</>
                        ) : driveAttached ? (
                          <><Check className="w-4 h-4" /> Bill Uploaded ({mockDriveFileId})</>
                        ) : (
                          <>Authorize Drive & Upload Supplier Bill</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Payment Liability</label>
                        <select
                          id="form-purchase-payment"
                          value={pStatus}
                          onChange={(e) => setPStatus(e.target.value as MaterialPurchase["paymentStatus"])}
                          className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-1.5 text-xs"
                        >
                          <option value="Paid">Paid (Full Cash/Bank)</option>
                          <option value="Partially Paid">Partially Paid (Token)</option>
                          <option value="Pending">Pending (Credit Basis)</option>
                        </select>
                      </div>

                      {pStatus === "Partially Paid" && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Token Paid (INR) *</label>
                          <input 
                            id="form-purchase-paid-amount"
                            type="number"
                            required
                            placeholder="Amount in ₹"
                            value={pPaidAmount || ""}
                            onChange={(e) => setPPaidAmount(Number(e.target.value))}
                            className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-1.5 text-xs font-mono font-bold"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      id="btn-save-purchase-record"
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black tracking-wider text-xs uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Save Material Invoice
                    </button>
                  </div>

                </div>

              </form>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                id="btn-show-add-purchase-form"
                onClick={() => setShowAddPurchase(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4 text-teal-400" /> Log Material Purchase Bill
              </button>
            </div>
          )}

          {/* RENDERING TABLE OF PURCHASES */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden id-purchase-ledger-table-card">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purchase Records Ledger</span>
              <span className="text-[10px] text-slate-400 font-bold font-mono">{filteredPurchasesLedger.length} Records found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#0f172a] text-slate-200 uppercase text-[9px] font-bold tracking-widest text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Invoice No</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Dealer / Vendor</th>
                    <th className="py-3.5 px-3">Target Client</th>
                    <th className="py-3.5 px-3">Material specs</th>
                    <th className="py-3.5 px-3 text-right">Volume</th>
                    <th className="py-3.5 px-3 text-right">Gross Buy (₹)</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3 text-center">Cloud link</th>
                    <th className="py-3.5 px-4 text-center">Wastage / Spill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredPurchasesLedger.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400 italic">No purchase transactions match filters</td>
                    </tr>
                  ) : (
                    filteredPurchasesLedger.map((pur) => {
                      const outstanding = pur.paymentStatus === "Paid" ? 0 : pur.finalPurchaseAmount - pur.paidAmount;
                      const hasWastage = pur.wastageQuantity && pur.wastageQuantity > 0;
                      return (
                        <tr key={pur.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-4 px-4 font-mono font-bold text-slate-900">{pur.invoiceNumber}</td>
                          <td className="py-4 px-3 font-mono text-[11px] whitespace-nowrap">{pur.purchaseDate}</td>
                          <td className="py-4 px-3 font-bold">
                            <span className="block">{pur.vendorName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{pur.vendorMobile}</span>
                          </td>
                          <td className="py-4 px-3">
                            <span className="block max-w-[120px] truncate">{pur.customerName}</span>
                            <span className="text-[9px] font-mono text-slate-400 block max-w-[100px] truncate">{pur.projectId}</span>
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="py-0.5 px-1.5 text-[8.5px] uppercase rounded-full bg-slate-100 text-slate-700 block text-center min-w-[50px]">
                                {pur.materialCategory}
                              </span>
                              <span className="font-bold">{pur.brand} - {pur.productName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-right font-mono text-[11px] whitespace-nowrap">
                            {pur.quantity} {pur.unit}
                          </td>
                          <td className="py-4 px-3 text-right font-mono font-black text-slate-800">
                            ₹{pur.finalPurchaseAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-[9px] uppercase font-extrabold rounded-full ${
                              pur.paymentStatus === "Paid" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : pur.paymentStatus === "Pending" 
                                  ? "bg-rose-100 text-rose-800" 
                                  : "bg-amber-100 text-amber-800"
                            }`}>
                              {pur.paymentStatus}
                            </span>
                            {outstanding > 0 && <span className="block text-[9px] text-slate-450 font-mono mt-0.5">₹{outstanding.toLocaleString("en-IN")} due</span>}
                          </td>
                          <td className="py-4 px-3 text-center">
                            {pur.googleDriveFileId ? (
                              <a 
                                href={pur.invoiceCopyUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200"
                                title="Open simulated Google Drive receipt"
                              >
                                <HardDrive className="w-3.5 h-3.5" /> Open Drive
                              </a>
                            ) : (
                              <span className="text-slate-400 font-medium italic text-[11px]">No PDF attached</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {hasWastage ? (
                              <span 
                                className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-150 rounded text-[9px] font-mono select-none block max-w-[100px] truncate"
                                title={`Reason: ${pur.wastageReason}`}
                              >
                                {pur.wastageQuantity} {pur.unit} Wasted
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">0 units</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB C: PROJECT MATERIAL COST TRACKING & VARIANCE ANALYSIS */}
      {/* ======================================================== */}
      {activeTab === "variance" && (
        <div className="space-y-6" id="variance-tab-space">
          {/* Detailed table and comparison */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-805 text-base">Material Budget vs Actual Expenditures Analysis</h3>
              <p className="text-xs text-slate-400 mt-1">Estimator’s Material Quotation slabs compared to actual procurement bills. Highlights system variances and wastage costs.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e293b] text-slate-300 uppercase text-[9px] font-bold tracking-widest">
                  <tr>
                    <th className="py-4 px-5">Customer & Project</th>
                    <th className="py-4 px-4 font-mono text-center">Project Status</th>
                    <th className="py-4 px-4 text-right">Quoted Budget (₹)</th>
                    <th className="py-4 px-4 text-right">Actual Material Cost (₹)</th>
                    <th className="py-4 px-4 text-right">Wastage / Spills (₹)</th>
                    <th className="py-4 px-4 text-right">Variance Value (₹)</th>
                    <th className="py-4 px-4 text-center">Variance %</th>
                    <th className="py-4 px-5 text-center">Variance alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                  {costVarianceReportData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400 italic">No CRM active project records currently compiled</td>
                    </tr>
                  ) : (
                    costVarianceReportData.map((row) => {
                      const isOverBudget = row.varianceValue > 0;
                      return (
                        <tr key={row.customerId} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-900 block">{row.customerName}</span>
                            <span className="text-[10px] text-slate-400 italic block mt-0.5">{row.projectName}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full ${
                              row.projectStatus === "Completed" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : row.projectStatus === "In Progress" 
                                  ? "bg-teal-50 text-teal-800 border border-teal-100" 
                                  : "bg-slate-100 text-slate-600"
                            }`}>
                              {row.projectStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-slate-605">
                            ₹{row.estimatedCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-slate-805">
                            ₹{row.actualPurchased.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-4 px-4 text-right font-mono text-rose-600">
                            ₹{row.wastageValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </td>
                          <td className={`py-4 px-4 text-right font-mono font-black ${isOverBudget ? "text-rose-700" : "text-emerald-700"}`}>
                            {isOverBudget ? `+` : ``}₹{Math.abs(row.varianceValue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </td>
                          <td className={`py-4 px-4 text-center font-mono font-extrabold ${isOverBudget ? "text-rose-700" : "text-emerald-700"}`}>
                            {isOverBudget ? `+` : `-`}{row.pctVariance.toFixed(1)}%
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold ${
                              isOverBudget 
                                ? "bg-rose-50 border border-rose-200 text-rose-700" 
                                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            }`}>
                              {isOverBudget ? (
                                <><AlertTriangle className="w-3 h-3 text-rose-500" /> Over Budget</>
                              ) : (
                                <><ShieldCheck className="w-3 h-3 text-emerald-500" /> Under Budget</>
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 text-xs text-slate-450 leading-relaxed font-semibold">
              <span className="text-slate-800 font-extrabold">Formula Explanation:</span> Quoted Budget includes painting raw material items compiled. Actual Material Cost wraps all direct purchase records tied to the Customer ID. Material Variance values are calculated automatically. Leakage / Spillage reports are deducted from balance stocks.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB D: PROJECT PROFITABILITY ENGINE */}
      {/* ======================================================== */}
      {activeTab === "profit" && (
        <div className="space-y-6" id="profitability-tab-space">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="profit-engine-box">
            <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-slate-850 text-base">Project-wise Profitability Evaluation Engine</h3>
                <p className="text-xs text-slate-400">Undergo automatic deduction tracking matching Gross incomes, Materials, Labour costs, and Scaffolding factors.</p>
              </div>

              {/* CRM Project Selectors */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Choose Active Project:</label>
                <select
                  id="profit-project-selector"
                  value={selectedProfitCustomerId}
                  onChange={(e) => setSelectedProfitCustomerId(e.target.value)}
                  className="bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-slate-800"
                >
                  <option value="">-- Choose Project --</option>
                  {projectsList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.project?.notes?.split(".")[0] || "Refinishing"})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProfitabilityData ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="profitability-engine-metrics">
                {/* Visual scorecard */}
                <div className="lg:col-span-1 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-6 flex flex-col justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Accepted Net Quotation</span>
                    <h4 className="text-3xl font-black font-mono tracking-tight mt-1">₹{selectedProfitabilityData.quotationAmount.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</h4>
                    <p className="text-[10px] text-slate-350 italic mt-1 pb-4 border-b border-slate-800">Agreed contract proposal amount value</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Gross Capital Outlay</span>
                      <p className="text-lg font-extrabold font-mono text-slate-200">₹{selectedProfitabilityData.totalProjectCost.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Net Realised Profit</span>
                      <p className={`text-2xl font-black font-mono ${selectedProfitabilityData.netProfit > 0 ? "text-teal-400" : "text-rose-450"}`}>
                        ₹{selectedProfitabilityData.netProfit.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-405 block tracking-wide">Net Profit Margin %</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-black text-white">{selectedProfitabilityData.profitPercentage.toFixed(1)}%</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        selectedProfitabilityData.profitPercentage > 25 
                          ? "bg-emerald-900 border border-emerald-700 text-emerald-300"
                          : selectedProfitabilityData.profitPercentage > 10 
                            ? "bg-teal-900 border border-teal-700 text-teal-300"
                            : "bg-rose-950 border border-rose-800 text-rose-300"
                      }`}>
                        {selectedProfitabilityData.profitPercentage > 25 ? "Exceptional Yield" : selectedProfitabilityData.profitPercentage > 10 ? "Optimal Profit" : "Risk Margin Warning"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analytical cost slabs and Gross/Net profitability sheets */}
                <div className="lg:col-span-2 space-y-4 flex flex-col justify-between" id="analytical-profit-slabs">
                  <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-3.5">
                    <span className="text-xs uppercase font-extrabold text-slate-500 block">Itemized Cost Outlay Parameters (Actuals Log)</span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Actual Material Cost</span>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">₹{selectedProfitabilityData.materialCost.toLocaleString("en-IN")}</p>
                        <span className="text-[9px] text-slate-450 block italic">Purchased raw paints</span>
                      </div>

                      <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Labour Cost Slabs</span>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">₹{selectedProfitabilityData.labourCost.toLocaleString("en-IN")}</p>
                        <span className="text-[9px] text-slate-450 block italic">Artisan labor expenses</span>
                      </div>

                      <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Transport Slabs</span>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">₹{selectedProfitabilityData.transportCost.toLocaleString("en-IN")}</p>
                        <span className="text-[9px] text-slate-450 block italic">Logistics freight</span>
                      </div>

                      <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Scaffolding Cost</span>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">₹{selectedProfitabilityData.scaffoldingCost.toLocaleString("en-IN")}</p>
                        <span className="text-[9px] text-slate-450 block italic">Exterior heights setup</span>
                      </div>

                      <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide block">Other Log Expenses</span>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">₹{selectedProfitabilityData.otherExpenses.toLocaleString("en-IN")}</p>
                        <span className="text-[9px] text-slate-450 block italic">Misc site expenditure</span>
                      </div>

                      <div className="p-3 bg-slate-900 text-white rounded-xl space-y-0.5 shadow-md">
                        <span className="text-[10px] text-teal-400 uppercase font-black tracking-wide block">Total Project Costs</span>
                        <p className="text-sm font-extrabold text-white font-mono">₹{selectedProfitabilityData.totalProjectCost.toLocaleString("en-IN")}</p>
                        <span className="text-[9px] text-slate-400 block italic">Aggregate outlays</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Margin bars */}
                  <div className="space-y-3 p-4 border border-slate-150 rounded-2xl bg-white">
                    <span className="text-xs uppercase font-extrabold text-slate-500 block">Profit Breakdown Analysis</span>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-705">
                          <span>Gross Margin (Quotation - Materials)</span>
                          <span className="font-bold text-slate-800 font-mono">
                            ₹{selectedProfitabilityData.grossProfit.toLocaleString("en-IN")} ({(selectedProfitabilityData.grossProfit / selectedProfitabilityData.quotationAmount * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(selectedProfitabilityData.grossProfit / selectedProfitabilityData.quotationAmount * 100)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-705">
                          <span>Net Margin (Quotation - Total Cost)</span>
                          <span className={`font-mono font-bold ${selectedProfitabilityData.netProfit > 20000 ? "text-teal-700" : "text-slate-800"}`}>
                            ₹{selectedProfitabilityData.netProfit.toLocaleString("en-IN")} ({selectedProfitabilityData.profitPercentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: `${Math.max(0, selectedProfitabilityData.profitPercentage)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-10 text-center">Kindly choose an active project pipeline from the drop-down selector above to load metrics.</p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB E: VENDOR MANAGEMENT DIRECTORY */}
      {/* ======================================================== */}
      {activeTab === "vendors" && (
        <div className="space-y-6" id="vendors-tab-space">
          {/* SEARCH AND ADD VENDOR CONTROLS */}
          <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-450" />
              <input 
                id="search-vendor-input"
                type="text"
                placeholder="Search vendor database by Name, Mobile, GST or address..."
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 pl-10 text-xs focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 md:flex gap-2">
              <select
                id="filter-vendor-category"
                value={filterVendorCategory}
                onChange={(e) => setFilterVendorCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-800"
              >
                <option value="All">All Categories</option>
                <option value="Paint">Paint</option>
                <option value="Waterproofing">Waterproofing</option>
                <option value="Putty">Putty</option>
                <option value="Cement">Cement</option>
                <option value="Other">Other</option>
              </select>

              <button
                id="btn-trigger-add-vendor"
                type="button"
                onClick={() => setShowAddVendor(!showAddVendor)}
                className="bg-slate-900 border border-slate-800 text-teal-300 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-teal-400" /> Register Partner Vendor
              </button>
            </div>
          </div>

          {/* ADD VENDOR FORM (DRAWER SLIDE) */}
          {showAddVendor && (
            <div className="bg-[#0f172a] text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4" id="form-add-vendor-box">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-extrabold text-white text-base">Register Partner Dealer Vendor</h4>
                  <p className="text-[11px] text-slate-400">Add merchant locations, raw material specialization categories, and mobile contacts cleanly.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddVendor(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg py-1 px-3 text-xs"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddVendorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Dealer Business Name *</label>
                    <input 
                      id="vendor-add-name"
                      type="text"
                      required
                      placeholder="e.g. Pune Supreme Paints & Hardware"
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Mobile Contact Number *</label>
                    <input 
                      id="vendor-add-mobile"
                      type="text"
                      required
                      placeholder="e.g. +91 91580XXXXX"
                      value={vMobile}
                      onChange={(e) => setVMobile(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Vendor GSTIN Number (Optional)</label>
                    <input 
                      id="vendor-add-gst"
                      type="text"
                      placeholder="e.g. 27AAAA0000A1Z0"
                      value={vGst}
                      onChange={(e) => setVGst(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="block text-slate-400 mb-1">Business Address *</label>
                    <input 
                      id="vendor-add-address"
                      type="text"
                      required
                      placeholder="e.g. Gole Road, Shivajinagar, Pune"
                      value={vAddress}
                      onChange={(e) => setVAddress(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Select Material Dealership Categories (Multi-select)</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {["Paint", "Primer", "Putty", "Texture", "Waterproofing", "Cement", "Other"].map(cat => {
                        const isSelected = vCats.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCategorySelection(cat)}
                            className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all border ${
                              isSelected 
                                ? "bg-teal-500 text-slate-950 border-teal-400" 
                                : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Dealer Rating Index</label>
                      <select
                        id="vendor-add-rating"
                        value={vRating}
                        onChange={(e) => setVRating(Number(e.target.value))}
                        className="w-full bg-slate-850 border border-slate-700 text-white rounded-lg p-2 text-xs"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ Excellent (Prompt Delivery)</option>
                        <option value="4">⭐⭐⭐⭐ Good partnership</option>
                        <option value="3">⭐⭐⭐ Standard retailer</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        id="btn-add-vendor-submit"
                        type="submit"
                        className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black tracking-wider uppercase py-2.5 rounded-xl transition-all"
                      >
                        Register Vendor
                      </button>
                    </div>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* VENDOR GRID DIRECTORY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="vendor-grid">
            {filteredVendorDirectory.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-10 text-center col-span-3">No trade vendors registered matching filter parameters</p>
            ) : (
              filteredVendorDirectory.map((vend) => (
                <div key={vend.id} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between" id={`vendor-card-${vend.id}`}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-805 text-sm">{vend.name}</h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{vend.gstNumber || "GSTIN NA"}</span>
                      </div>
                      <div className="flex text-amber-500" title={`Rating: ${vend.rating}/5`}>
                        {Array.from({ length: vend.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-normal">
                      <p className="font-bold flex items-center gap-1"><span className="text-slate-400">Mob:</span> {vend.mobile}</p>
                      <p className="text-slate-500 leading-normal font-medium flex items-center gap-1 truncate"><span className="text-slate-400">Dir:</span> {vend.address}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {vend.materialCategories.map(cat => (
                        <span key={cat} className="text-[8.5px] uppercase font-bold py-0.5 px-1.5 bg-slate-100 text-slate-600 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Log Transactions</span>
                      <p className="text-slate-800 font-bold font-mono text-[11px]">{vend.purchaseCount} Procurement Bills</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Outstanding Liability</span>
                      <p className={`font-mono font-bold text-[11px] ${vend.outstandingPayment > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                        ₹{vend.outstandingPayment.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB F: MASTER PRODUCTS DATABASE (ORIGINAL RESTORED SHEET) */}
      {/* ======================================================== */}
      {activeTab === "products" && (
        <div id="original-products-tab-space" className="space-y-6">
          <MaterialsDatabase
            materials={materials}
            onAddMaterial={onAddMaterial}
            onUpdateMaterialRate={onUpdateMaterialRate}
          />
        </div>
      )}

    </div>
  );
};
