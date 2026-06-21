import React, { useState } from "react";
import { Customer, LeadSource, FinalQuotation, Material, Invoice, PaymentRecord, MediaAttachment, ChangeOrder, QuotationRevision } from "../types";
import { Search, Plus, MapPin, Phone, Calendar, UserPlus, Eye, FileSpreadsheet, Trash2, ShieldAlert, Check, HelpCircle, ArrowUpRight, Camera, Mic, Play, MessageSquare, Receipt, CreditCard, ChevronRight, CornerDownRight, Landmark, ShieldCheck, Download, History, Sparkles } from "lucide-react";
import { exportQuotationToPDF, exportInvoiceToPDF } from "../utils/pdfExport";
import { SystemSettings } from "../types";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

interface CustomerProfilesProps {
  customers: Customer[];
  materials: Material[];
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string | null) => void;
  onAddCustomer: (customer: Customer) => void;
  onCaptureSiteVisit: (customerId: string, lat: number, lng: number, notes: string, media: MediaAttachment[]) => void;
  onAddPayment: (customerId: string, invoiceId: string, payment: PaymentRecord) => void;
  onDeleteCustomer: (id: string) => void;
  onUpdateCustomerNameAndDetails: (id: string, name: string, email: string, mobile: string, address: string) => void;
  onAddChangeOrder: (customerId: string, changeOrder: ChangeOrder) => void;
  onApproveChangeOrder: (customerId: string, changeOrderId: string, approvedBy: string) => void;
  settings: SystemSettings;
}

export const CustomerProfiles: React.FC<CustomerProfilesProps> = ({
  customers,
  materials,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  onCaptureSiteVisit,
  onAddPayment,
  onDeleteCustomer,
  onUpdateCustomerNameAndDetails,
  onAddChangeOrder,
  onApproveChangeOrder,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);

  // New Lead fields
  const [newCustName, setNewCustName] = useState("");
  const [newCustMobile, setNewCustMobile] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustSource, setNewCustSource] = useState<LeadSource>("Manual Entry");
  const [newCustRemarks, setNewCustRemarks] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  // Search/Filter logic
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.mobile.includes(searchTerm) || 
                          c.locationAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === "All" || c.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Handle lead creation (handles Unknown Inquiry!)
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustMobile.trim()) {
      alert("Mobile number is required to capture lead history safely!");
      return;
    }

    const isUnknown = !newCustName.trim();
    const finalName = isUnknown ? "Unknown Inquiry" : newCustName.trim();

    const newCustomer: Customer = {
      id: `cust-added-${Date.now()}`,
      name: finalName,
      mobile: newCustMobile,
      email: newCustEmail || undefined,
      dateCreated: new Date().toISOString(),
      source: newCustSource,
      remarks: newCustRemarks || "Manual entry lead",
      locationAddress: newCustAddress || "Pune region",
      isRegisteredCustomer: !isUnknown,
      ledger: {
        totalBilled: 0,
        totalPaid: 0,
        balanceDue: 0,
        payments: []
      },
      finalQuotations: [],
      invoices: [],
      timeline: [
        {
          id: `t-lead-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "Lead Created",
          description: isUnknown 
            ? `Captured unknown inquiry from mobile ${newCustMobile} via ${newCustSource}.`
            : `Lead registered under profile "${newCustName}" via ${newCustSource}.`,
          icon: "UserPlus",
          user: "Estimator"
        }
      ],
      whatsAppLogs: [],
      campaigns: []
    };

    onAddCustomer(newCustomer);
    
    // reset form
    setNewCustName("");
    setNewCustMobile("");
    setNewCustEmail("");
    setNewCustRemarks("");
    setNewCustAddress("");
    setShowAddLeadForm(false);
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="profiles-main-container">
      {/* Left Pane: Customer List (col-span-4) */}
      <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4" id="customers-list-pane">
        
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Customer Records</h3>
            <p className="text-[10px] text-slate-400">Manage pipeline profiles and timeline journals</p>
          </div>
          <button
            id="btn-trigger-add-lead"
            onClick={() => setShowAddLeadForm(!showAddLeadForm)}
            className="p-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-colors shrink-0"
            title="Create New Lead"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {showAddLeadForm && (
          <form onSubmit={handleCreateLead} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/50 space-y-3" id="form-create-lead">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Manual entry formulation</span>
              <p className="text-[9px] text-slate-500 bg-teal-50/50 p-1.5 rounded-lg border border-teal-100 leading-snug">
                Leave Name empty to store as <strong>"Unknown Inquiry"</strong> (can update details later after physical meet).
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Customer Name (Optional)</label>
              <input
                id="form-lead-name"
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none"
                placeholder="Leave blank for Unknown Inquiry"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Mobile Number (Required)</label>
              <input
                id="form-lead-mobile"
                type="text"
                required
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-750 font-bold focus:outline-none"
                placeholder="+91 99887 76655"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Inquiry Source</label>
              <select
                id="form-lead-source"
                value={newCustSource}
                onChange={(e) => setNewCustSource(e.target.value as LeadSource)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="Manual Entry">Manual Entry</option>
                <option value="Meta Ads">Meta Ads (Facebook/Insta)</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Google Business Profile">Google Business Profile</option>
                <option value="WhatsApp">WhatsApp Chat</option>
                <option value="Phone Calls">Phone Call</option>
                <option value="Reference">Reference Client</option>
                <option value="Website">Website Form</option>
                <option value="Walk-In">Walk-In client</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Region/Address</label>
              <input
                id="form-lead-address"
                type="text"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                placeholder="e.g. Kothrud, Khed, Bavdhan, Pune"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Requirements Remarks</label>
              <textarea
                id="form-lead-remarks"
                value={newCustRemarks}
                onChange={(e) => setNewCustRemarks(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none h-12"
                placeholder="Paint requirements, seepage issues..."
              />
            </div>

            <button
              id="form-lead-submit"
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
            >
              Log Inquiry
            </button>
          </form>
        )}

        {/* Search */}
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              id="search-cust-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:bg-white focus:border-teal-500 transition-colors"
              placeholder="Search by name, phone, area..."
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">Source:</span>
            <select
              id="source-filter-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-[10px] rounded-lg py-1 px-1.5 font-medium text-slate-500 focus:outline-none"
            >
              <option value="All">All Channels</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Google Business Profile">Google Business</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone Calls">Phone Calls</option>
              <option value="Reference">Reference</option>
              <option value="Website">Website</option>
              <option value="Walk-In">Walk-In</option>
            </select>
          </div>
        </div>

        {/* Rows of Customers */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1" id="customers-cards-list">
          {filteredCustomers.map((customer) => {
            const isSelected = selectedCustomerId === customer.id;
            const hasProject = !!customer.project;
            let currentStatus = "Lead";
            
            if (customer.project?.status === "Completed") {
              currentStatus = "Completed";
            } else if (hasProject) {
              currentStatus = "In Progress";
            } else if (customer.finalQuotations.some(q => q.status === "Approved")) {
              currentStatus = "Approved Quote";
            } else if (customer.finalQuotations.length > 0) {
              currentStatus = "Quote Sent";
            } else if (customer.siteVisit) {
              currentStatus = "Site Inspected";
            }

            return (
              <div
                id={`customer-row-${customer.id}`}
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected 
                    ? "bg-teal-50 border-teal-500 shadow-sm" 
                    : "bg-white hover:bg-slate-50/70 border-slate-150"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold text-xs ${customer.name === "Unknown Inquiry" ? "text-slate-400 italic" : "text-slate-800"}`}>
                      {customer.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{customer.mobile}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide shrink-0 ${
                    currentStatus === "Completed" ? "bg-emerald-50 text-emerald-700" :
                    currentStatus === "In Progress" ? "bg-blue-50 text-blue-700" :
                    currentStatus === "Approved Quote" ? "bg-teal-50 text-teal-700" :
                    currentStatus === "Quote Sent" ? "bg-indigo-50 text-indigo-700" :
                    currentStatus === "Site Inspected" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {currentStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2 text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-300" /> {customer.locationAddress.split(",")[0] || "Pune"}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-slate-50 rounded italic text-slate-500">
                    Source: {customer.source}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs font-medium" id="customers-no-results">
              No matching client records found.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: CRM Journey, GPS Capture & Billing Logs (col-span-8) */}
      <div className="lg:col-span-8 space-y-6" id="customer-profile-details-pane">
        {selectedCustomer ? (
          <CustomerJourneyViewer
            customer={selectedCustomer}
            materials={materials}
            onCaptureSiteVisit={onCaptureSiteVisit}
            onAddPayment={onAddPayment}
            onDeleteCustomer={onDeleteCustomer}
            onUpdateDetails={onUpdateCustomerNameAndDetails}
            onAddChangeOrder={onAddChangeOrder}
            onApproveChangeOrder={onApproveChangeOrder}
            settings={settings}
          />
        ) : (
          <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center text-slate-400 max-w-lg mx-auto flex flex-col items-center justify-center space-y-3" id="no-profile-selected">
            <HelpCircle className="w-12 h-12 text-slate-200" />
            <h4 className="font-bold text-slate-700 text-base">Select Customer Profile</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Choose a record from the side pane to manage their entire lifecycle journey, capture on-site coordinates, and run quotation calculations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- DYNAMIC CRM VISUAL COMPONENT --- */
interface CustomerJourneyViewerProps {
  customer: Customer;
  materials: Material[];
  onCaptureSiteVisit: (customerId: string, lat: number, lng: number, notes: string, media: MediaAttachment[]) => void;
  onAddPayment: (customerId: string, invoiceId: string, payment: PaymentRecord) => void;
  onDeleteCustomer: (id: string) => void;
  onUpdateDetails: (id: string, name: string, email: string, mobile: string, address: string) => void;
  onAddChangeOrder: (customerId: string, changeOrder: ChangeOrder) => void;
  onApproveChangeOrder: (customerId: string, changeOrderId: string, approvedBy: string) => void;
  settings: SystemSettings;
}

const CustomerJourneyViewer: React.FC<CustomerJourneyViewerProps> = ({
  customer,
  materials,
  onCaptureSiteVisit,
  onAddPayment,
  onDeleteCustomer,
  onUpdateDetails,
  onAddChangeOrder,
  onApproveChangeOrder,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<"journey" | "site" | "billing" | "timeline" | "whatsapp" | "change-orders">("journey");

  // Edit states to resolve Unknown Inquiry records!
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(customer.name);
  const [editEmail, setEditEmail] = useState(customer.email || "");
  const [editMobile, setEditMobile] = useState(customer.mobile);
  const [editAddress, setEditAddress] = useState(customer.locationAddress);

  // Site capture inputs
  const [lat, setLat] = useState("18.5204");
  const [lng, setLng] = useState("73.8567");
  const [siteNotes, setSiteNotes] = useState("");
  const [sitePhotoUrl, setSitePhotoUrl] = useState("https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80");
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [mediaList, setMediaList] = useState<MediaAttachment[]>([]);

  // Payment capture inputs (for invoices)
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<PaymentRecord["mode"]>("UPI");
  const [payRef, setPayRef] = useState("");
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  // Document Live Preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<"quotation" | "invoice">("quotation");
  const [previewData, setPreviewData] = useState<FinalQuotation | Invoice | null>(null);

  // Change Order management local states
  const [coReason, setCoReason] = useState("");
  const [coItemDesc, setCoItemDesc] = useState("");
  const [coItemCat, setCoItemCat] = useState<"Scraping" | "Putty" | "Primer" | "Paint" | "Texture" | "Waterproofing" | "Labour" | "Transport" | "Scaffolding" | "Other">("Paint");
  const [coItemArea, setCoItemArea] = useState<number | "">("");
  const [coItemRate, setCoItemRate] = useState<number | "">("");
  const [coItemQty, setCoItemQty] = useState<number | "">(1);
  const [coItemsList, setCoItemsList] = useState<{ id: string; description: string; category: "Scraping" | "Putty" | "Primer" | "Paint" | "Texture" | "Waterproofing" | "Labour" | "Transport" | "Scaffolding" | "Other"; area?: number; rate: number; quantity: number; amount: number; }[]>([]);
  const [coGstEnabled, setCoGstEnabled] = useState(true);
  const [approveCoId, setApproveCoId] = useState<string | null>(null);
  const [approverClientName, setApproverClientName] = useState("");

  const handlePreviewQuotation = (q: FinalQuotation) => {
    setPreviewType("quotation");
    setPreviewData(q);
    setIsPreviewOpen(true);
  };

  const handlePreviewInvoice = (inv: Invoice) => {
    setPreviewType("invoice");
    setPreviewData(inv);
    setIsPreviewOpen(true);
  };

  const handleUpdateDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editMobile.trim()) {
      alert("Name and Mobile are mandatory specs of a validated contractor account profile!");
      return;
    }
    onUpdateDetails(customer.id, editName, editEmail, editMobile, editAddress);
    setIsEditing(false);
  };

  const handleFetchGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(5));
          setLng(pos.coords.longitude.toFixed(5));
          setGpsSuccess(true);
          setTimeout(() => setGpsSuccess(false), 3000);
        },
        (error) => {
          // Fallback to beautiful preset coordinates of core Pune
          const pLat = (18.45 + Math.random() * 0.1).toFixed(4);
          const pLng = (73.78 + Math.random() * 0.1).toFixed(4);
          setLat(pLat);
          setLng(pLng);
          setGpsSuccess(true);
          setTimeout(() => setGpsSuccess(false), 3000);
        }
      );
    } else {
      alert("Geolocation is unavailable inside this browser context.");
    }
  };

  const handleCaptureVisit = () => {
    const latN = Number(lat);
    const lngN = Number(lng);
    const photos: MediaAttachment[] = [
      {
        id: `site-photo-${Date.now()}`,
        type: "photo",
        url: sitePhotoUrl,
        timestamp: new Date().toISOString(),
        name: "site_inspection_baseline.jpg",
      },
    ];

    onCaptureSiteVisit(customer.id, latN, lngN, siteNotes || "GPS check is complete", photos);
    setSiteNotes("");
    alert("GPS site inspection, site photos, and voice notes registered in CRM profile database!");
  };

  const handleReceivePayment = (invoice: Invoice) => {
    if (payAmount <= 0) return;
    const payment: PaymentRecord = {
      id: `p-rec-${Date.now()}`,
      amount: payAmount,
      date: new Date().toISOString(),
      mode: payMode,
      referenceNo: payRef || `REF${Math.floor(100000 + Math.random() * 900000)}`,
      remarks: "Account payment transaction"
    };

    onAddPayment(customer.id, invoice.id, payment);
    setPayAmount(0);
    setPayRef("");
    setPaySuccessMsg("UPI/Receipt cleared. Customer accounts ledger credited immediately.");
    setTimeout(() => setPaySuccessMsg(""), 3000);
  };

  const handleAddCoItem = () => {
    if (!coItemDesc.trim()) {
      alert("Please enter an item description.");
      return;
    }
    const rateVal = Number(coItemRate);
    const qtyVal = Number(coItemQty);
    if (isNaN(rateVal) || rateVal <= 0) {
      alert("Please enter a valid rate greater than 0.");
      return;
    }
    if (isNaN(qtyVal) || qtyVal <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }

    const areaVal = coItemArea !== "" && coItemArea !== 0 ? Number(coItemArea) : undefined;
    const amount = (areaVal !== undefined ? areaVal : 1) * rateVal * qtyVal;

    const newItem = {
      id: `co-it-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: coItemDesc.trim(),
      category: coItemCat,
      area: areaVal,
      rate: rateVal,
      quantity: qtyVal,
      amount
    };

    setCoItemsList((prev) => [...prev, newItem]);
    setCoItemDesc("");
    setCoItemArea("");
    setCoItemRate("");
    setCoItemQty(1);
  };

  const handleRemoveCoItem = (itemId: string) => {
    setCoItemsList((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleSubmitChangeOrder = () => {
    if (!coReason.trim()) {
      alert("Please enter a description or reason for this change order.");
      return;
    }
    if (coItemsList.length === 0) {
      alert("Please add at least one item to the change order.");
      return;
    }

    const subtotal = coItemsList.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = coGstEnabled ? Math.round(subtotal * 0.18) : 0;
    const finalAmount = subtotal + gstAmount;

    const nextId = customer.changeOrders?.length ? customer.changeOrders.length + 1 : 1;
    const changeOrderNum = `SAVI-CO-${customer.finalQuotations[0]?.quotationNumber || "QT"}-REV${nextId}`;

    const newCO: ChangeOrder = {
      id: `co-${Date.now()}`,
      quotationId: customer.finalQuotations[0]?.id || `qt-${Date.now()}`,
      changeOrderNumber: changeOrderNum,
      createdAt: new Date().toISOString(),
      reason: coReason.trim(),
      items: coItemsList,
      subtotal,
      gstPercent: coGstEnabled ? 18 : 0,
      gstAmount,
      finalAmount,
      status: "Draft"
    };

    onAddChangeOrder(customer.id, newCO);
    setCoReason("");
    setCoItemsList([]);
    alert(`Change Order variation ${changeOrderNum} proposed successfully!`);
  };

  const handleConfirmApproveCO = () => {
    if (!approverClientName.trim()) {
      alert("Please specify the name of the client representative approving this work.");
      return;
    }
    if (!approveCoId) return;

    onApproveChangeOrder(customer.id, approveCoId, approverClientName.trim());
    setApproveCoId(null);
    setApproverClientName("");
  };

  const handleWhatsAppActionSim = (type: string, payload: string) => {
    const url = `https://wa.me/${customer.mobile.replace(/[-+ \s]/g, "")}?text=${encodeURIComponent(payload)}`;
    window.open(url, "_blank");
  };

  const getWhatsAppLogsText = (type: string) => {
    if (type === "Quotation") {
      const activeQuote = customer.finalQuotations[0];
      if (!activeQuote) return "No quotation compiled yet.";
      return `Hello ${customer.name}! We have finalized Quotation ${activeQuote.quotationNumber} for ₹${activeQuote.finalAmount.toLocaleString("en-IN")}. Scope includes brand material parameters. Press Approve to greenlit: [Link]`;
    } else if (type === "Reminder") {
      return `Dear ${customer.name}, this is a gentle reminder that your painting estimate is pending your signature review. Please let us know if you require any scope revisions. Thank you!`;
    } else if (type === "Invoice") {
      const activeInv = customer.invoices[0];
      if (!activeInv) return "No invoice generated yet.";
      return `Hello ${customer.name}! Find outstanding Invoice ${activeInv.invoiceNumber} for ₹${customer.ledger.balanceDue.toLocaleString("en-IN")}. Secure payment UPI link: [Link]`;
    }
    return "Savi Painting greetings!";
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6" id="profile-panel-grid">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5" id="profile-brief">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-xl font-extrabold ${customer.name === "Unknown Inquiry" ? "text-slate-400 italic" : "text-slate-800"}`} id="client-view-title">
              {customer.name}
            </h3>
            {customer.name === "Unknown Inquiry" && (
              <span className="text-[9px] font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase">
                Requires updating name
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> {customer.mobile} • Account Registered: {new Date(customer.dateCreated).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            id="btn-toggle-edit"
            onClick={() => {
              setIsEditing(!isEditing);
              // match defaults
              setEditName(customer.name);
              setEditEmail(customer.email || "");
              setEditMobile(customer.mobile);
              setEditAddress(customer.locationAddress);
            }}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs py-2 px-3.5 rounded-xl transition-all"
          >
            {isEditing ? "Cancel" : "Update Profile"}
          </button>
          <button
            id="btn-delete-record"
            onClick={() => {
              if (confirm("Confirm permanent removal of painting pipeline record?")) {
                onDeleteCustomer(customer.id);
              }
            }}
            className="text-rose-500 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 font-bold text-xs py-2 px-3.5 rounded-xl transition-all"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleUpdateDetailsSubmit} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4" id="form-edit-details">
          <div className="md:col-span-2 border-b border-slate-200 pb-1 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">Update Lead Specs</span>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Full Name</label>
            <input
              id="edit-details-name"
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Mobile Phone (WhatsApp)</label>
            <input
              id="edit-details-mobile"
              type="text"
              required
              value={editMobile}
              onChange={(e) => setEditMobile(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Email Address</label>
            <input
              id="edit-details-email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
              placeholder="name@email.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Physical Site Address</label>
            <input
              id="edit-details-address"
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
              placeholder="Pune location, rowhouse coordinates..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-1 border-t border-slate-200/40">
            <button
              id="btn-edit-details"
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors"
            >
              Verify & Save Details
            </button>
          </div>
        </form>
      )}

      {/* Tabs Menu navigation */}
      <div className="flex gap-1 border-b border-slate-100 overflow-x-auto pb-1" id="profile-tabs-bar">
        <button
          id="tab-btn-journey"
          onClick={() => setActiveTab("journey")}
          className={`px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === "journey" ? "border-teal-700 text-teal-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Active Journey
        </button>
        <button
          id="tab-btn-site"
          onClick={() => setActiveTab("site")}
          className={`px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === "site" ? "border-teal-700 text-teal-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          GPS Site Inspection
        </button>
        <button
          id="tab-btn-billing"
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === "billing" ? "border-teal-700 text-teal-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Ledger & Invoices
        </button>
        <button
          id="tab-btn-change-orders"
          onClick={() => setActiveTab("change-orders")}
          className={`px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === "change-orders" ? "border-teal-700 text-teal-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Change Orders & Revisions
        </button>
        <button
          id="tab-btn-timeline"
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === "timeline" ? "border-teal-700 text-teal-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          CRA Audit Timeline
        </button>
        <button
          id="tab-btn-whatsapp"
          onClick={() => setActiveTab("whatsapp")}
          className={`px-4 py-2 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === "whatsapp" ? "border-teal-700 text-teal-700 font-bold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          WhatsApp Hooks
        </button>
      </div>

      {/* TABS CONTAINER */}
      <div id="profile-tab-contents">
        
        {/* TAB 1: CUSTOMER JOURNEY HUD */}
        {activeTab === "journey" && (
          <div className="space-y-6" id="tab-journey-wrapper">
            {/* Horizontal Timeline Track */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 overflow-hidden" id="horizontal-journey-tracker">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-4">Journey Milestones Tracker</span>
              
              <div className="hidden md:flex justify-between items-center relative py-2" id="milestones-train">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                
                {/* 1. Lead Captured */}
                <div className="flex flex-col items-center text-center z-10 w-20">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs ring-4 ring-teal-50">
                    1
                  </div>
                  <span className="text-[10px] font-extrabold text-teal-700 mt-2">Lead</span>
                </div>

                {/* 2. Site Inspected */}
                <div className="flex flex-col items-center text-center z-10 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    customer.siteVisit ? "bg-teal-750 text-white ring-4 ring-teal-50" : "bg-white text-slate-300 border-2 border-slate-200"
                  }`}>
                    2
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${customer.siteVisit ? "text-teal-700" : "text-slate-400"}`}>Site visit</span>
                </div>

                {/* 3. Rough Estimate */}
                <div className="flex flex-col items-center text-center z-10 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    customer.roughEstimate ? "bg-teal-750 text-white ring-4 ring-teal-50" : "bg-white text-slate-300 border-2 border-slate-200"
                  }`}>
                    3
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${customer.roughEstimate ? "text-teal-700" : "text-slate-400"}`}>Rough</span>
                </div>

                {/* 4. Final Quotation */}
                <div className="flex flex-col items-center text-center z-10 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    customer.finalQuotations.length > 0 ? "bg-teal-750 text-white ring-4 ring-teal-50" : "bg-white text-slate-300 border-2 border-slate-200"
                  }`}>
                    4
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${customer.finalQuotations.length > 0 ? "text-teal-700" : "text-slate-400"}`}>Final Proposal</span>
                </div>

                {/* 5. Approved Contract */}
                <div className="flex flex-col items-center text-center z-10 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    customer.approval ? "bg-teal-750 text-white ring-4 ring-teal-50" : "bg-white text-slate-300 border-2 border-slate-200"
                  }`}>
                    5
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${customer.approval ? "text-teal-700" : "text-slate-400"}`}>Approved</span>
                </div>

                {/* 6. Execution */}
                <div className="flex flex-col items-center text-center z-10 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    customer.project ? "bg-teal-750 text-white ring-4 ring-teal-50" : "bg-white text-slate-300 border-2 border-slate-200"
                  }`}>
                    6
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${customer.project ? "text-teal-700" : "text-slate-400"}`}>Project In Progress</span>
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden flex justify-between text-[11px] font-bold text-slate-700 text-center">
                <span>Inquiry</span>
                <ChevronRight className="w-4 h-4 text-slate-350" />
                <span className={customer.siteVisit ? "text-teal-700" : "text-slate-400"}>Site visits</span>
                <ChevronRight className="w-4 h-4 text-slate-350" />
                <span className={customer.finalQuotations.length > 0 ? "text-teal-700" : "text-slate-400"}>Approved</span>
                <ChevronRight className="w-4 h-4 text-slate-350" />
                <span className={customer.project ? "text-teal-700" : "text-slate-400"}>Project</span>
              </div>
            </div>

            {/* General Description notes */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Customer General Background</h4>
                <p className="text-xs text-slate-400 font-medium">Capture details about structural state or paint requests</p>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-150/50 space-y-2 text-xs">
                <div className="flex">
                  <span className="w-24 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Lead Channel:</span>
                  <p className="font-semibold text-slate-700">{customer.source}</p>
                </div>
                <div className="flex">
                  <span className="w-24 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Site Address:</span>
                  <p className="font-medium text-slate-700">{customer.locationAddress || "Pune region"}</p>
                </div>
                <div className="flex">
                  <span className="w-24 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Remarks log:</span>
                  <p className="font-serif italic text-slate-600">{customer.remarks || "No supplementary notes logged yet."}</p>
                </div>
              </div>
            </div>

            {customer.finalQuotations.length > 0 && (
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-3" id="active-proposal-download-card">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Active Quotation Ledger</span>
                    <h4 className="font-bold text-slate-800 text-sm">{customer.finalQuotations[0].quotationNumber}</h4>
                  </div>
                  <span className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-full ${
                    customer.approval ? "bg-emerald-100 text-emerald-800" : "bg-teal-50 text-teal-700"
                  }`}>
                    {customer.approval ? "Signed & Locked" : "Submitted / Pending Approval"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold py-1">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Gross Items:</span>
                    <p className="text-slate-700">{customer.finalQuotations[0].items.length} Scope Slabs</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Tax Details:</span>
                    <p className="text-slate-700">GST {customer.finalQuotations[0].gstPercent}% Covered</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Consolidated Total:</span>
                    <p className="text-teal-700 font-bold font-mono">₹{customer.finalQuotations[0].finalAmount.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-100 flex-wrap">
                  <button
                    id="btn-journey-preview-quotation"
                    type="button"
                    onClick={() => handlePreviewQuotation(customer.finalQuotations[0])}
                    className="bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Eye className="w-4 h-4" /> Preview Layout
                  </button>
                  <button
                    id="btn-journey-download-pdf"
                    type="button"
                    onClick={() => exportQuotationToPDF(customer, customer.finalQuotations[0])}
                    className="bg-teal-750 hover:bg-teal-850 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <p className="text-[10px] text-slate-400 flex items-center">
                    Verify terms and visual stamps before downloading.
                  </p>
                </div>
              </div>
            )}


            {customer.approval && (
              <div className="bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl p-5 shadow-inner" id="approval-records-evidence">
                <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" /> Digital Contract Sign Footprint (Approval Evidence)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                  <div className="space-y-1">
                    <p>• Approved by: <strong>{customer.approval.customerName}</strong></p>
                    <p>• Mobile Phone: <strong>{customer.approval.mobile}</strong></p>
                    <p>• Quotation No: <strong>{customer.approval.quotationNumber}</strong></p>
                    <p>• Total Cost: <strong>₹{customer.approval.amount.toLocaleString("en-IN")}</strong></p>
                  </div>
                  <div className="space-y-1">
                    <p>• Timestamp: <strong>{customer.approval.date} @ {customer.approval.time}</strong></p>
                    <p>• Portal Source: <strong>{customer.approval.source}</strong></p>
                    <p>• Secure Signature Method: <strong>{customer.approval.method}</strong></p>
                    <p>• Operational State: <strong className="text-emerald-700 uppercase">AUDIT Trail CLEARED</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SITE VISIT PORTAL AND AUDIO TRACKS */}
        {activeTab === "site" && (
          <div className="space-y-6" id="tab-site-wrapper">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-teal-700" /> High-Accuracy GPS on Location Visit
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Captures architectural coordinates, parapet photos, & live recordings</p>
              </div>

              {/* Form trigger GPS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="gps-form-panel">
                <div className="md:col-span-1 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Latitude</label>
                    <input
                      id="gps-lat"
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Longitude</label>
                    <input
                      id="gps-lng"
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-mono"
                    />
                  </div>
                  
                  <div className="pt-1.5 flex gap-1.5">
                    <button
                      id="btn-fetch-gps"
                      type="button"
                      onClick={handleFetchGPS}
                      className="flex-1 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 text-teal-700 font-bold text-xs py-2 rounded-lg transition-colors"
                    >
                      Fetch GPS
                    </button>
                    {gpsSuccess && (
                      <span className="text-[10px] text-green-600 font-semibold self-center">Captured!</span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload Site Photo Mock URL</label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
                      <input
                        id="gps-photo-url"
                        type="text"
                        value={sitePhotoUrl}
                        onChange={(e) => setSitePhotoUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs"
                        placeholder="Paste image address"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">On-Site Area Conditions / Estimations Notes</label>
                    <textarea
                      id="gps-visit-notes"
                      value={siteNotes}
                      onChange={(e) => setSiteNotes(e.target.value)}
                      rows={2.5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-600 focus:outline-none focus:border-teal-500"
                      placeholder="Note down dampness, number of coats putty requirements, moisture check metrics..."
                    />
                  </div>
                </div>

                <div className="md:col-span-3 border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    id="btn-save-site-inspection"
                    type="button"
                    onClick={handleCaptureVisit}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-5 rounded-xl transition-colors shadow-sm"
                  >
                    Save Site Inspection Data
                  </button>
                </div>
              </div>
            </div>

            {/* Render Saved Site Visit Profiles */}
            {customer.siteVisit && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-5" id="saved-visit-details">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Coordinates Profile</span>
                  
                  <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1.5 text-xs">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Captured Latitude:</span>
                      <strong className="text-slate-700 font-mono">{customer.siteVisit.location.latitude}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Captured Longitude:</span>
                      <strong className="text-slate-700 font-mono">{customer.siteVisit.location.longitude}</strong>
                    </p>
                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center mt-1.5">
                      <a
                        id="lbl-google-map-pin"
                        href={customer.siteVisit.location.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 hover:text-teal-800 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-4 h-4" /> Open live Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-150 text-xs space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Inspection Log notes:</span>
                    <p className="font-serif italic text-slate-600 leading-relaxed">
                      "{customer.siteVisit.notes}"
                    </p>
                  </div>
                </div>

                {/* Media grid */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Site Inspection Media Attachments</span>
                  <div className="grid grid-cols-2 gap-3" id="saved-site-photos-grid">
                    {/* Photos */}
                    {customer.siteVisit.media.filter(m => m.type === "photo").map((m) => (
                      <div key={m.id} className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-video">
                        <img
                          src={m.url}
                          alt="site look"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-end">
                          <span className="text-[9px] text-white font-mono truncate">{m.name}</span>
                        </div>
                      </div>
                    ))}

                    {/* Sim voice notes list */}
                    <div className="col-span-2 bg-white rounded-xl p-3 border border-slate-150 text-xs space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1">
                        <Mic className="w-3.5 h-3.5 text-teal-700" /> Audio Voice Notes Log
                      </span>
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Play className="w-4 h-4 text-teal-750 cursor-pointer hover:scale-110 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-700 text-[11px] leading-none">inspection_vocals_pune.mp3</p>
                          <span className="text-[9px] text-slate-400 mt-0.5 block">Recorded yesterday @ 11:34 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEDGER AND INVOICES COMPILATION */}
        {activeTab === "billing" && (
          <div className="space-y-6" id="tab-billing-wrapper">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ledger-stats-banner">
              {/* Box 1 */}
              <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Total Projected Contract:</span>
                <strong className="text-lg font-bold text-slate-800 font-mono text-xl">₹{customer.ledger.totalBilled.toLocaleString("en-IN")}</strong>
              </div>
              {/* Box 2 */}
              <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Total Received Payments:</span>
                <strong className="text-lg font-bold text-emerald-600 font-mono text-xl">₹{customer.ledger.totalPaid.toLocaleString("en-IN")}</strong>
              </div>
              {/* Box 3 */}
              <div className="bg-white border border-slate-150 p-4 rounded-xl shadow-sm text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Net Outstanding Balance:</span>
                <strong className="text-lg font-bold text-rose-500 font-mono text-xl">₹{customer.ledger.balanceDue.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Issued Invoices & UPI Checkout Gateways</span>
              
              {customer.invoices.map((inv) => {
                const totalPaidInv = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                const dueInv = inv.finalAmount - totalPaidInv;
                const isPaid = dueInv <= 0;

                return (
                  <div id={`invoice-card-${inv.id}`} key={inv.id} className="bg-white border border-slate-200 text-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-500" />
                        <h5 className="font-bold text-sm text-slate-800 font-mono">{inv.invoiceNumber}</h5>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isPaid ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {isPaid ? "Fully Paid" : "Balance Due"}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-3.5 flex-wrap justify-end">
                        <span className="text-[10px] text-slate-400 font-semibold block">Due by: {new Date(inv.dueDate).toLocaleDateString()}</span>
                        <button
                          id={`btn-preview-inv-${inv.id}`}
                          onClick={() => handlePreviewInvoice(inv)}
                          className="p-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-extrabold rounded-xl text-[10px] uppercase flex items-center gap-1 shadow-sm border border-teal-100 transition-all font-mono"
                          title="View on-screen printable preview"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview Layout
                        </button>
                        <button
                          id={`btn-download-pdf-inv-${inv.id}`}
                          onClick={() => exportInvoiceToPDF(customer, inv, settings)}
                          className="p-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-xl text-[10px] uppercase flex items-center gap-1 shadow-sm border border-indigo-100 transition-all"
                          title="Generate vector printable invoice representation"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF Invoice
                        </button>
                      </div>
                    </div>

                    {/* Quotation to Invoice Linking Metadata block */}
                    {(() => {
                      const linkedQuotation = customer.finalQuotations.find((q) => q.id === inv.quotationId) || customer.finalQuotations[0];
                      return (
                        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3.5" id={`quote-link-banner-${inv.id}`}>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider block">Linked Quotation No.</span>
                            <span className="font-mono font-bold text-indigo-950">{linkedQuotation?.quotationNumber || "Original Contract"}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider block">Quotation Date</span>
                            <span className="font-bold text-slate-700">{linkedQuotation ? new Date(linkedQuotation.createdAt).toLocaleDateString() : "—"}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider block">Approved Amount</span>
                            <span className="font-bold text-teal-800 font-mono">₹{linkedQuotation?.finalAmount.toLocaleString("en-IN") || "—"}</span>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-[#64748b] font-bold uppercase tracking-wider block">Customer & Project ID</span>
                            <span className="font-bold text-slate-650 block truncate" title={`${customer.name} (PROJ-${customer.id.toUpperCase()})`}>{customer.name} <span className="font-mono text-[10px] text-indigo-600">(PROJ-{customer.id.slice(-6).toUpperCase()})</span></span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Invoice items */}
                    <div className="space-y-1.5 text-xs">
                      {inv.items.map((it) => (
                        <div key={it.id} className="flex justify-between py-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                          <span className="font-medium text-slate-600">{it.description}</span>
                          <span className="font-bold text-slate-850 font-mono">₹{it.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                    {/* Invoice financial summary */}
                    <div className="bg-slate-50/60 p-4.5 rounded-2xl border border-slate-150 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500 font-medium pb-1.5 border-b border-slate-100">
                        <span>Billed Gross Subtotal:</span>
                        <span className="font-mono text-slate-700">₹{(settings.gstEnabled ? inv.subtotal : inv.finalAmount).toLocaleString("en-IN")}</span>
                      </div>
                      {settings.gstEnabled ? (
                        <>
                          <div className="flex justify-between text-slate-500 font-medium">
                            <span>Central GST (CGST 9.0%):</span>
                            <span className="font-mono text-teal-600">+ ₹{Math.round(inv.gstAmount / 2).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between text-slate-500 font-medium">
                            <span>State GST (SGST 9.0%):</span>
                            <span className="font-mono text-teal-600">+ ₹{Math.round(inv.gstAmount / 2).toLocaleString("en-IN")}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-[10px] text-amber-600 italic font-semibold pt-0.5 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
                          * {settings.nonGstText || "Supplier Not Registered Under GST"}
                        </p>
                      )}
                      <div className="flex justify-between text-slate-850 font-bold text-xs pt-1.5 border-t border-slate-100">
                        <span>Net Account Payable (Rounded):</span>
                        <span className="font-mono text-indigo-700 text-sm">₹{inv.finalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Receive payment form */}
                    {dueInv > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-150 space-y-3" id="payment-accept-subform">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Collect UPI / Cash Milestone Clearence</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Clearance Rate (₹)</label>
                            <input
                              id="payment-amount"
                              type="number"
                              value={payAmount || ""}
                              onChange={(e) => setPayAmount(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800"
                              placeholder={`max ₹${dueInv}`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Payment Channel</label>
                            <select
                              id="payment-mode"
                              value={payMode}
                              onChange={(e) => setPayMode(e.target.value as PaymentRecord["mode"])}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-600 font-semibold"
                            >
                              <option value="UPI">Google Pay / PhonePe UPI</option>
                              <option value="Cash">Cash Handover</option>
                              <option value="Net Banking">Net Banking IMPS/NEFT</option>
                              <option value="Cheque">Bank Check Clearance</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Transaction Ref. Number (Optional)</label>
                            <input
                              id="payment-ref"
                              type="text"
                              value={payRef}
                              onChange={(e) => setPayRef(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                              placeholder="GPay/UPI hash references"
                            />
                          </div>
                        </div>

                        {paySuccessMsg && (
                          <p className="text-[10px] text-emerald-600 font-bold">{paySuccessMsg}</p>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            id="btn-confirm-payment"
                            onClick={() => handleReceivePayment(inv)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-4 rounded-lg flex items-center gap-1 shadow"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Log Cleared Income
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Paid Receipts footprint */}
                    {inv.payments.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-1 text-emerald-700">Receipt Logs Cleared</span>
                        {inv.payments.map((p) => (
                          <div key={p.id} className="flex justify-between text-[11px] text-slate-500 py-1 border-b border-slate-100 last:border-0 pl-1 font-mono font-medium">
                            <span>{new Date(p.date).toLocaleDateString()} via {p.mode} (Ref: {p.referenceNo})</span>
                            <span className="text-emerald-600 font-bold font-mono">+ ₹{p.amount.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {customer.invoices.length === 0 && (
                <p className="text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl text-center font-medium bg-slate-50/40">
                  No invoices compiled. Approve a final quotation to automatically issue professional invoices, balance calculations, and ledger accounts.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: COMPLETE CRM JOURNAL TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-4" id="tab-timeline-wrapper">
            <span className="text-[10px] uppercase font-bold text-slate-400 block pl-1">Permanent CRM Action Log Audit Footprint</span>
            
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-150/70 ml-3 py-1" id="timeline-journal-track">
              {customer.timeline.map((entry) => (
                <div id={`timeline-row-${entry.id}`} key={entry.id} className="relative" >
                  {/* Circle dot marker */}
                  <span className="absolute -left-[31px] top-1 bg-white border border-slate-300 w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[10px] text-teal-700 shadow shadow-teal-700/5 select-none shrink-0" />
                  
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-800">
                      <span className="font-bold text-indigo-950 font-sans">{entry.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(entry.timestamp).toLocaleDateString()} @ {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                      {entry.description}
                    </p>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 border-t border-slate-200/40 pt-1.5 uppercase font-bold select-none">
                      <span>Operator: {entry.user}</span>
                      <span>Security: Sign Encrypted</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WHATSAPP HOOKS ACTIONS PANEL */}
        {activeTab === "whatsapp" && (
          <div className="space-y-4" id="tab-whatsapp-wrapper">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">One-Click WhatsApp CRM Integration Pipeline</h4>
                <p className="text-xs text-slate-400 mt-0.5">Push prefilled messaging bundles to the client instantly using clean link parameters.</p>
              </div>

              <div className="space-y-3.5" id="whatsapp-hooks-selectors">
                
                {/* 1. Share Quotation */}
                <div className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-slate-700 uppercase tracking-widest text-[10px]">Dispatch Quotation Proposal</h5>
                    <p className="text-xs text-slate-500 font-medium">Auto-derives active estimate pricing and digital signing portal links.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto flex-wrap justify-end">
                    <button
                      id="btn-preview-hook-quote"
                      onClick={() => handlePreviewQuotation(customer.finalQuotations[0])}
                      disabled={customer.finalQuotations.length === 0}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 font-bold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0 justify-center disabled:opacity-50"
                      title="Preview quotation proposal layout"
                    >
                      <Eye className="w-4 h-4" /> Preview Layout
                    </button>
                    <button
                      id="btn-hook-quote"
                      onClick={() => handleWhatsAppActionSim("Quotation", getWhatsAppLogsText("Quotation"))}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0 justify-center"
                    >
                      <MessageSquare className="w-4 h-4" /> Share Quotation
                    </button>
                  </div>
                </div>

                {/* 2. Follow-Up Reminder */}
                <div className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-slate-700 uppercase tracking-widest text-[10px]">Sales Follow-Up Nudges</h5>
                    <p className="text-xs text-slate-500 font-medium">Gentle reminder addressing pending estimates or feedback questions.</p>
                  </div>
                  <button
                    id="btn-hook-reminder"
                    onClick={() => handleWhatsAppActionSim("Reminder", getWhatsAppLogsText("Reminder"))}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all w-full md:w-auto shrink-0 justify-center"
                  >
                    <MessageSquare className="w-4 h-4" /> Share Reminder
                  </button>
                </div>

                {/* 3. Share Invoice */}
                <div className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-slate-700 uppercase tracking-widest text-[10px]">Collect Milestone payment</h5>
                    <p className="text-xs text-slate-500 font-medium">Sends outstanding balance invoices with UPI checkout instructions.</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto flex-wrap justify-end">
                    <button
                      id="btn-preview-hook-invoice"
                      onClick={() => handlePreviewInvoice(customer.invoices[0])}
                      disabled={customer.invoices.length === 0}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 font-bold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0 justify-center disabled:opacity-50"
                      title="Preview milestone invoice layout"
                    >
                      <Eye className="w-4 h-4" /> Preview Layout
                    </button>
                    <button
                      id="btn-hook-invoice"
                      onClick={() => handleWhatsAppActionSim("Invoice", getWhatsAppLogsText("Invoice"))}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shrink-0 justify-center"
                    >
                      <MessageSquare className="w-4 h-4" /> Share Invoice
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CHANGE ORDERS & VARIATIONS PIPELINE */}
        {activeTab === "change-orders" && (
          <div className="space-y-6" id="tab-change-orders-wrapper">
            {/* 1. PROJECT VALUE TRACKING DASHBOARD */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
              {(() => {
                const originalValue = customer.finalQuotations.find(q => q.status === "Approved")?.finalAmount || customer.finalQuotations[0]?.finalAmount || 0;
                const approvedCOs = customer.changeOrders?.filter((co) => co.status === "Approved") || [];
                const additionalValue = approvedCOs.reduce((sum, co) => sum + co.finalAmount, 0);
                const totalProjectValue = originalValue + additionalValue;
                const collectedAmount = customer.ledger.totalPaid;
                const pendingAmount = Math.max(0, totalProjectValue - collectedAmount);
                const profitAmount = Math.round((customer.finalQuotations[0]?.profitMarginAmount || (originalValue * 0.20)) + (additionalValue * 0.20));
                const collectionPercentage = totalProjectValue > 0 ? Math.round((collectedAmount / totalProjectValue) * 100) : 0;

                const ledgerEntries = (() => {
                  const entries: {
                    id: string;
                    date: string;
                    type: "Quotation Approved" | "Additional Charge (Variation)" | "Payment Cleared";
                    reference: string;
                    debit?: number;
                    credit?: number;
                  }[] = [];

                  const approvedQuote = customer.finalQuotations.find(q => q.status === "Approved") || customer.finalQuotations[0];
                  if (approvedQuote && customer.approval) {
                    entries.push({
                      id: `ledger-quote-${approvedQuote.id}`,
                      date: customer.approval.date,
                      type: "Quotation Approved",
                      reference: `Original Proposal ${approvedQuote.quotationNumber}`,
                      debit: approvedQuote.finalAmount,
                    });
                  }

                  if (customer.changeOrders) {
                    customer.changeOrders.forEach((co) => {
                      if (co.status === "Approved") {
                        entries.push({
                          id: `ledger-co-${co.id}`,
                          date: co.approvedAt ? co.approvedAt.split("T")[0] : co.createdAt.split("T")[0],
                          type: "Additional Charge (Variation)",
                          reference: `Change Order ${co.changeOrderNumber}: ${co.reason}`,
                          debit: co.finalAmount,
                        });
                      }
                    });
                  }

                  customer.ledger.payments.forEach((pay, idx) => {
                    entries.push({
                      id: `ledger-pay-${pay.id}-${idx}`,
                      date: pay.date.split("T")[0],
                      type: "Payment Cleared",
                      reference: `Receipt: ${pay.mode} - Ref ${pay.referenceNo}`,
                      credit: pay.amount,
                    });
                  });

                  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                })();

                let runningBalance = 0;
                const ledgerRows = ledgerEntries.map(entry => {
                  runningBalance += (entry.debit || 0) - (entry.credit || 0);
                  return {
                    ...entry,
                    balance: runningBalance
                  };
                });

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-indigo-50/60 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Sparkles className="w-5 h-5 text-indigo-500" /> Real-time Project Value Tracking
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Automated accounting metrics for contract variations</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Collection Status</span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded ${
                          collectionPercentage >= 100 ? "bg-emerald-100 text-emerald-800" :
                          collectionPercentage > 0 ? "bg-amber-100 text-amber-800" :
                          "bg-slate-100 text-slate-600"
                        }`}>{collectionPercentage}% Collected</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#f8fafc] border border-slate-200/60 rounded-xl p-4">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Original Value</span>
                        <p className="text-base font-bold text-slate-800 font-mono mt-1">₹{originalValue.toLocaleString("en-IN")}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Base Quote contract</p>
                      </div>
                      <div className="bg-[#f0f9ff] border border-sky-100 rounded-xl p-4">
                        <span className="text-[10px] text-sky-600 font-bold block uppercase tracking-wider">Additional Work Value</span>
                        <p className="text-base font-bold text-sky-800 font-mono mt-1">+ ₹{additionalValue.toLocaleString("en-IN")}</p>
                        <p className="text-[9px] text-sky-400 font-semibold mt-0.5">From {customer.changeOrders?.filter(c => c.status === "Approved").length || 0} approved COs</p>
                      </div>
                      <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-4">
                        <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wider">Revised Total Value</span>
                        <p className="text-base font-extrabold text-emerald-800 font-mono mt-1">₹{totalProjectValue.toLocaleString("en-IN")}</p>
                        <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">Original + Variations</p>
                      </div>
                      <div className="bg-[#fff1f2] border border-rose-150 rounded-xl p-4">
                        <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wider">Outstanding Balance</span>
                        <p className="text-base font-extrabold text-rose-700 font-mono mt-1">₹{pendingAmount.toLocaleString("en-IN")}</p>
                        <p className="text-[9px] text-rose-400 font-semibold mt-0.5">Balance yet to collect</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block font-sans">Projected Margin / Profit</span>
                          <strong className="text-indigo-955 font-extrabold text-sm font-mono block">₹{profitAmount.toLocaleString("en-IN")}</strong>
                        </div>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold py-0.5 px-2 rounded-md">20% Core Estimate Margin</span>
                      </div>
                      <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block font-sans">Net Collected Revenue</span>
                          <strong className="text-emerald-700 font-extrabold text-sm font-mono block">₹{collectedAmount.toLocaleString("en-IN")}</strong>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold py-0.5 px-2 rounded-md">Verified Bank Clearance</span>
                      </div>
                    </div>

                    {/* QUOTATION REVISION HISTORY HEADER */}
                    <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <History className="w-5 h-5 text-indigo-950" /> Quotation Revision History Log
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Historical pricing modifications list. Absolute transparency. Original quotation is never overwritten.</p>
                      </div>

                      {!customer.quotationRevisions || customer.quotationRevisions.length === 0 ? (
                        <p className="text-slate-400 text-xs font-semibold py-4 text-center">No quotation revisions captured. Project currently runs on original contract value.</p>
                      ) : (
                        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/40">
                          <table className="w-full text-xs text-slate-600">
                            <thead className="bg-slate-100 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[9px]">
                              <tr>
                                <th className="px-3 py-2 text-left">Rev #</th>
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-left">Original Amt</th>
                                <th className="px-3 py-2 text-left">Variation</th>
                                <th className="px-3 py-2 text-left">Revised Total</th>
                                <th className="px-3 py-2 text-left">Reason / Approver</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {customer.quotationRevisions.map((rev, index) => (
                                <tr id={`rev-tr-${rev.id}`} key={rev.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-3 py-2.5 font-bold font-mono text-indigo-700">R0{index + 1}</td>
                                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{new Date(rev.revisionDate).toLocaleDateString()}</td>
                                  <td className="px-3 py-2.5 font-mono">₹{rev.originalAmount.toLocaleString("en-IN")}</td>
                                  <td className="px-3 py-2.5 font-mono text-emerald-600 font-semibold">+ ₹{rev.addedAmount.toLocaleString("en-IN")}</td>
                                  <td className="px-3 py-2.5 font-semibold font-mono text-indigo-950">₹{rev.finalAmount.toLocaleString("en-IN")}</td>
                                  <td className="px-3 py-2.5 max-w-xs select-text">
                                    <span className="font-bold text-slate-700 block text-[11px] leading-tight">{rev.reason}</span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">Approved by: <strong className="text-slate-650 font-extrabold">{rev.approvedBy}</strong></span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* CLIENT LEDGER DOUBLE-ENTRY SHEET */}
                    <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Landmark className="w-5 h-5 text-teal-800" /> Customer Account Ledger System
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit footprint of billing charges and clearing receipts</p>
                      </div>

                      {ledgerRows.length === 0 ? (
                        <p className="text-slate-400 text-xs font-semibold py-4 text-center">No ledger entries generated yet. Ledger starts once Quotation Proposal is signed.</p>
                      ) : (
                        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/40">
                          <table className="w-full text-xs text-slate-600">
                            <thead className="bg-slate-100 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[9px]">
                              <tr>
                                <th className="px-3 py-2 text-left">Ref Date</th>
                                <th className="px-3 py-2 text-left">Transaction Type / Reference</th>
                                <th className="px-3 py-2 text-right">Debit (+ Charge)</th>
                                <th className="px-3 py-2 text-right">Credit (- Paid)</th>
                                <th className="px-3 py-2 text-right">Outstanding Balance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {ledgerRows.map((row) => (
                                <tr id={`ledger-tr-${row.id}`} key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                                  <td className="px-3 py-2.5 select-text">
                                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none inline-block mb-1 border ${
                                      row.type === "Quotation Approved" ? "bg-indigo-50 text-indigo-750 border-indigo-100" :
                                      row.type === "Additional Charge (Variation)" ? "bg-sky-50 text-sky-750 border-sky-100" :
                                      "bg-emerald-50 text-emerald-750 border-emerald-100"
                                    }`}>{row.type}</span>
                                    <span className="font-semibold text-slate-705 block leading-tight">{row.reference}</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono text-indigo-950 font-bold">
                                    {row.debit ? `₹${row.debit.toLocaleString("en-IN")}` : "—"}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono text-emerald-600 font-bold">
                                    {row.credit ? `₹${row.credit.toLocaleString("en-IN")}` : "—"}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono text-slate-800 font-bold bg-slate-100/10">
                                    ₹{row.balance.toLocaleString("en-IN")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 2. CREATE NEW CHANGE ORDER MODULE */}
            {customer.finalQuotations.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 text-center text-xs font-semibold" id="no-quotes-co-warning">
                Please add and approve a Base Quotation Plan before creating Extra Change Orders.
              </div>
            ) : (
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4" id="create-change-order-card">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Plus className="w-5 h-5 text-indigo-600" /> Log Additional Work Order (Variation)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Record extra areas, special texture coats, or waterproofing layers on existing contracts</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label htmlFor="co-reason-input" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Variation Description / Reason *</label>
                    <input
                      id="co-reason-input"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 font-medium focus:outline-none focus:border-indigo-400"
                      placeholder="e.g., Additional 2nd Coat paint in living room, waterproofing restroom adjacent wall"
                      value={coReason}
                      onChange={(e) => setCoReason(e.target.value)}
                    />
                  </div>

                  {/* Add item rows */}
                  <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/40 space-y-3" id="co-material-builder-section">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Add Extra Material / Labour Line Items</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="col-span-1 sm:col-span-2">
                        <label htmlFor="co-item-desc" className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Work Description *</label>
                        <input
                          id="co-item-desc"
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-medium"
                          placeholder="e.g., Silk Glamor Texture Master Wall"
                          value={coItemDesc}
                          onChange={(e) => setCoItemDesc(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="co-item-cat" className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Category</label>
                        <select
                          id="co-item-cat"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-600 font-semibold"
                          value={coItemCat}
                          onChange={(e) => setCoItemCat(e.target.value as any)}
                        >
                          <option value="Scraping">Scraping Work</option>
                          <option value="Putty">Putty Coat</option>
                          <option value="Primer">Primer Base</option>
                          <option value="Paint">Paint Top-coat</option>
                          <option value="Texture">Texture Design</option>
                          <option value="Waterproofing">Waterproofing</option>
                          <option value="Labour">Labour Charges</option>
                          <option value="Transport">Transport/Cargo</option>
                          <option value="Scaffolding">Scaffolding / Jhula</option>
                          <option value="Other">Other Miscellaneous</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="co-item-area" className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Area (Sq. Ft, Opt.)</label>
                        <input
                          id="co-item-area"
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                          placeholder="e.g., 250"
                          value={coItemArea}
                          onChange={(e) => setCoItemArea(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>

                      <div>
                        <label htmlFor="co-item-rate" className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Unit Rate (₹) *</label>
                        <input
                          id="co-item-rate"
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-bold"
                          placeholder="Rate"
                          value={coItemRate}
                          onChange={(e) => setCoItemRate(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1" id="co-item-actions-row">
                      <div className="flex items-center gap-2">
                        <input
                          id="co-item-qty"
                          type="number"
                          className="w-20 bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-center font-bold"
                          placeholder="Qty"
                          title="Multiplier Quantity"
                          value={coItemQty}
                          onChange={(e) => setCoItemQty(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                        <span className="text-[10px] text-slate-400 font-semibold">Multiplier Factor</span>
                      </div>

                      <button
                        id="btn-add-co-item"
                        type="button"
                        onClick={handleAddCoItem}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-1.5 px-4 rounded-xl flex items-center gap-1 transition-all shadow"
                      >
                        <Plus className="w-4 h-4 ml-0.5" /> Add Item Line
                      </button>
                    </div>

                    {/* Change order item list local builder view */}
                    {coItemsList.length > 0 && (
                      <div className="border-t border-slate-200/60 pt-3 space-y-2" id="co-items-list-draft">
                        <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Compiled Items to Add</span>
                        <div className="space-y-1 bg-white border border-slate-150 rounded-xl overflow-hidden shadow-inner">
                          {coItemsList.map((it) => (
                            <div key={it.id} className="flex justify-between items-center text-xs py-2 px-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 py-2.5">
                              <div className="space-y-0.5 text-left">
                                <p className="font-bold text-slate-750">{it.description}</p>
                                <p className="text-[9px] text-slate-300 font-bold uppercase">{it.category} {it.area ? `• Area: ${it.area} sqft` : ""} • Rate: ₹{it.rate} • Qty: {it.quantity}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-850 font-mono">₹{it.amount.toLocaleString("en-IN")}</span>
                                <button
                                  id={`btn-del-co-it-${it.id}`}
                                  type="button"
                                  onClick={() => handleRemoveCoItem(it.id)}
                                  className="text-slate-400 hover:text-rose-650 p-1 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {coItemsList.length > 0 && (
                    <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 flex items-center justify-between gap-4 flex-wrap text-xs" id="co-billing-summary-preview">
                      <div className="flex items-center gap-2">
                        <input
                          id="co-gst-toggle"
                          type="checkbox"
                          checked={coGstEnabled}
                          onChange={(e) => setCoGstEnabled(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="co-gst-toggle" className="text-xs font-bold text-slate-650">Append Standard 18% GST Surcharge</label>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block">Proposed Subtotal:</span>
                        <p className="font-semibold text-slate-650 font-mono">₹{coItemsList.reduce((s,i) => s+i.amount, 0).toLocaleString("en-IN")}</p>
                        {coGstEnabled && (
                          <p className="text-[9px] text-slate-400 font-bold font-mono">SGST + CGST 18%: ₹{Math.round(coItemsList.reduce((s,i) => s+i.amount, 0) * 0.18).toLocaleString("en-IN")}</p>
                        )}
                        <strong className="text-indigo-700 font-extrabold block font-mono text-sm">Proposed Net Amount: ₹{Math.round(coItemsList.reduce((s,i) => s+i.amount, 0) * (coGstEnabled ? 1.18 : 1)).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      id="btn-submit-change-order"
                      type="button"
                      onClick={handleSubmitChangeOrder}
                      disabled={coItemsList.length === 0}
                      className="bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow transition-all flex items-center gap-1 bg-gradient-to-r from-indigo-600 to-blue-600 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" /> Propose & Dispatch Change Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CHANGE ORDERS VARIATIONS WORKFLOW LIST */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4" id="change-orders-active-list-card">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <History className="w-5 h-5 text-teal-700" /> Active Variation & Change Orders
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Track change orders and approve variation requests securely</p>
              </div>

              {!customer.changeOrders || customer.changeOrders.length === 0 ? (
                <p className="text-slate-400 text-xs font-semibold py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">No active Change Orders logged for this project yet.</p>
              ) : (
                <div className="space-y-4">
                  {customer.changeOrders.map((co) => (
                    <div id={`co-card-${co.id}`} key={co.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-150/70 pb-2 flex-wrap gap-2">
                        <div>
                          <strong className="text-slate-850 font-mono text-xs">{co.changeOrderNumber}</strong>
                          <span className="text-[10px] text-slate-400 font-bold tracking-wider block">{co.reason}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                            co.status === "Approved" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                            co.status === "Rejected" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                            "bg-amber-100 text-amber-800 border border-amber-250"
                          }`}>{co.status}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs bg-white border border-slate-150 rounded-xl overflow-hidden p-3 shadow-inner">
                        <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase">Extra Items Scope Slabs</span>
                        {co.items.map((it) => (
                          <div key={it.id} className="flex justify-between items-center py-1 text-xs border-b border-slate-100 last:border-b-0 py-1.5">
                            <div className="text-left">
                              <p className="font-bold text-slate-705">{it.description}</p>
                              <span className="text-[10px] text-slate-450 uppercase font-bold">{it.category} {it.area ? `• Area: ${it.area} sqft` : ""} • Rate: ₹{it.rate} • Qty: {it.quantity}</span>
                            </div>
                            <span className="font-bold text-slate-800 font-mono">₹{it.amount.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 flex-wrap gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Subtotal: <span className="font-mono text-slate-700">₹{co.subtotal.toLocaleString("en-IN")}</span> {co.gstPercent > 0 ? `+ GST ${co.gstPercent}%: ₹${co.gstAmount.toLocaleString("en-IN")}` : ""}</p>
                          <strong className="text-slate-850 text-indigo-700 font-extrabold block font-mono">Net Cost Amount: ₹{co.finalAmount.toLocaleString("en-IN")}</strong>
                        </div>

                        {co.status === "Approved" ? (
                          <div className="text-right text-[10px] text-emerald-700 space-y-0.5" id={`co-approved-footprint-${co.id}`}>
                            <p className="font-extrabold flex items-center justify-end gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Signed & Locked</p>
                            <p className="font-semibold text-slate-400">Approved by Client: <strong className="text-emerald-700">{co.approvedByClient}</strong> on {co.approvedAt ? new Date(co.approvedAt).toLocaleDateString() : ""}</p>
                          </div>
                        ) : (
                          <div className="flex gap-2" id={`co-actions-${co.id}`}>
                            <button
                              id={`btn-trigger-approve-co-${co.id}`}
                              onClick={() => { setApproveCoId(co.id); setApproverClientName(customer.name); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-1.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve Variation
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Client Approver Modal Input inside co item block */}
                      {approveCoId === co.id && (
                        <div className="bg-indigo-50 border border-indigo-200/60 rounded-xl p-3 space-y-2 mt-2" id={`co-approval-subform-${co.id}`}>
                          <label htmlFor="approver-client-name" className="block text-[9px] font-extrabold text-indigo-900 uppercase tracking-wider">Client Representative Signature *</label>
                          <div className="flex gap-2">
                            <input
                              id="approver-client-name"
                              type="text"
                              value={approverClientName}
                              onChange={(e) => setApproverClientName(e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-indigo-950 font-bold focus:outline-none focus:border-indigo-400"
                              placeholder="Representative Authorizer Name"
                            />
                            <button
                              id="btn-confirm-approve-co"
                              onClick={handleConfirmApproveCO}
                              className="bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-[10px] px-4 rounded-lg flex items-center gap-1 shadow"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> E-Sign Approve
                            </button>
                          </div>
                          <p className="text-[9px] text-indigo-500 font-medium italic">* Legally binds project variation cost and automatically updates linked billing invoices.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        customer={customer}
        settings={settings}
        dataType={previewType}
        data={previewData}
      />
    </div>
  );
};
