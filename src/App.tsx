import { useState, useEffect } from "react";
import { Customer, Material, Campaign, FollowUpTask, RoughEstimate, FinalQuotation, CustomerApproval, PaymentRecord, Invoice, MediaAttachment, TimelineEntry, Vendor, MaterialPurchase, SystemSettings, ChangeOrder, QuotationRevision } from "./types";
import { INITIAL_CUSTOMERS, INITIAL_CAMPAIGNS, INITIAL_FOLLOWUPS } from "./data/mockData";
import { INITIAL_MATERIALS } from "./data/materials";
import { INITIAL_VENDORS, INITIAL_PURCHASES } from "./data/mockProcurement";
import { DashboardStats } from "./components/DashboardStats";
import { CustomerProfiles } from "./components/CustomerProfiles";
import { RoughQuotationCalculator } from "./components/RoughQuotationCalculator";
import { FinalQuotationGenerator } from "./components/FinalQuotationGenerator";
import { CustomerPortalView } from "./components/CustomerPortalView";
import { ProcurementHub } from "./components/ProcurementHub";
import { CampaignManagement } from "./components/CampaignManagement";
import { FollowUpAutomationPanel } from "./components/FollowUpAutomationPanel";
import { SettingsModule } from "./components/SettingsModule";
import { 
  syncLeadToGoogle, 
  syncCustomerToGoogle, 
  syncSiteVisitToGoogle, 
  syncQuotationToGoogle, 
  syncInvoiceToGoogle, 
  syncPaymentToGoogle, 
  syncWhatsAppLogToGoogle, 
  syncCampaignToGoogle 
} from "./utils/googleSync";

import { 
  Building, 
  Users, 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  UserCheck, 
  Settings, 
  Briefcase, 
  Bell, 
  ShieldCheck, 
  Paintbrush, 
  Clock, 
  FolderSync, 
  FileSpreadsheet,
  Download,
  Upload
} from "lucide-react";

export default function App() {
  // CORE DATABASE STATE ENGINE
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("savi_painting_customers");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem("savi_painting_materials");
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem("savi_painting_campaigns");
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [tasks, setTasks] = useState<FollowUpTask[]>(() => {
    const saved = localStorage.getItem("savi_painting_tasks");
    return saved ? JSON.parse(saved) : INITIAL_FOLLOWUPS(INITIAL_CUSTOMERS);
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem("savi_painting_vendors");
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [purchases, setPurchases] = useState<MaterialPurchase[]>(() => {
    const saved = localStorage.getItem("savi_painting_purchases");
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>("cust-rajesh");
  const [activeNav, setActiveNav] = useState<
    "dashboard" | "customers" | "rough" | "final" | "portal" | "materials" | "campaigns" | "followups" | "settings"
  >("dashboard");

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("savi_painting_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.termsAndConditions) {
          parsed.termsAndConditions = [
            "Work shall commence only after agreed advance payment is received.",
            "Any additional work requested by customer after quotation approval shall be treated as a Change Order and billed separately.",
            "Quotation is based on the scope of work specifically mentioned in the document.",
            "Any area not included in the approved quotation is chargeable separately.",
            "Material brand, grade or specification changes requested after approval may change pricing.",
            "Delays caused by weather, rain, site readiness, electricity issues, water availability or third-party interference shall not be contractor responsibility.",
            "Customer must inspect work during execution and immediately report concerns.",
            "Final payment signifies acceptance of completed work.",
            "Warranty applies only where specifically mentioned.",
            "Natural wear, seepage, dampness, structural cracks, hidden leakage, civil defects and third-party damage are excluded unless explicitly included.",
            "Customer supplied materials remain customer responsibility.",
            "Work schedule may be adjusted based on site conditions and labour availability.",
            "Any dispute shall be subject to Pune jurisdiction."
          ];
          parsed.paymentAdvancePercent = 50;
          parsed.paymentWorkPercent = 40;
          parsed.paymentCompletionPercent = 10;
          parsed.approvalStatement = "I have read and understood the quotation, scope of work, payment terms, material specifications and conditions. I voluntarily approve this quotation.";
          parsed.warrantyPolicy = "Standard 1-Year Painting Application Warranty on premium brands. Excludes structural cracks and water seepages.";
          parsed.companyAddress = "Pune-Hinjawadi Road, Hinjawadi Phase 1, Pune, Maharashtra 411057";
          parsed.companyContact = "+91 98765 43210";
          parsed.companyEmail = "contact@savipainting.in";
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      gstEnabled: false,
      gstNumber: "",
      businessName: "SAVI PAINTING & DECOR SERVICES",
      gstStatus: "GST Not Registered",
      nonGstText: "Supplier Not Registered Under GST",
      termsAndConditions: [
        "Work shall commence only after agreed advance payment is received.",
        "Any additional work requested by customer after quotation approval shall be treated as a Change Order and billed separately.",
        "Quotation is based on the scope of work specifically mentioned in the document.",
        "Any area not included in the approved quotation is chargeable separately.",
        "Material brand, grade or specification changes requested after approval may change pricing.",
        "Delays caused by weather, rain, site readiness, electricity issues, water availability or third-party interference shall not be contractor responsibility.",
        "Customer must inspect work during execution and immediately report concerns.",
        "Final payment signifies acceptance of completed work.",
        "Warranty applies only where specifically mentioned.",
        "Natural wear, seepage, dampness, structural cracks, hidden leakage, civil defects and third-party damage are excluded unless explicitly included.",
        "Customer supplied materials remain customer responsibility.",
        "Work schedule may be adjusted based on site conditions and labour availability.",
        "Any dispute shall be subject to Pune jurisdiction."
      ],
      paymentAdvancePercent: 50,
      paymentWorkPercent: 40,
      paymentCompletionPercent: 10,
      approvalStatement: "I have read and understood the quotation, scope of work, payment terms, material specifications and conditions. I voluntarily approve this quotation.",
      warrantyPolicy: "Standard 1-Year Painting Application Warranty on premium brands. Excludes structural cracks and water seepages.",
      companyAddress: "Pune-Hinjawadi Road, Hinjawadi Phase 1, Pune, Maharashtra 411057",
      companyContact: "+91 98765 43210",
      companyEmail: "contact@savipainting.in"
    };
  });

  // Local storage synchronization triggered on state alterations
  useEffect(() => {
    localStorage.setItem("savi_painting_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("savi_painting_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("savi_painting_materials", JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem("savi_painting_campaigns", JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem("savi_painting_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("savi_painting_vendors", JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem("savi_painting_purchases", JSON.stringify(purchases));
  }, [purchases]);

  // SYSTEM MUTATORS AND OPERATIONAL CALLBACKS

  // 1. Add manual leads
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    
    // Auto-create Today's Follow-up task for the new lead
    const task: FollowUpTask = {
      id: `task-auto-${Date.now()}`,
      customerId: newCustomer.id,
      customerName: newCustomer.name,
      customerMobile: newCustomer.mobile,
      type: "Lead Response",
      dueDate: "2026-06-21", // Today
      status: "Today",
      description: `New lead captured from ${newCustomer.source}. Direct outreach schedule priority.`
    };
    setTasks((prev) => [task, ...prev]);
    setSelectedCustomerId(newCustomer.id);
    setActiveNav("customers");

    // Sync to Google
    syncLeadToGoogle(newCustomer);
    syncCustomerToGoogle(newCustomer);
  };

  // 2. Resolve unknown inquiry profiles (Essential normalized updating workflow!)
  const handleUpdateCustomerNameAndDetails = (
    id: string,
    name: string,
    email: string,
    mobile: string,
    address: string
  ) => {
    let updatedCust: Customer | null = null;
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isFormerlyUnknown = c.name === "Unknown Inquiry";
          const updatedTimeline = [...c.timeline];
          
          if (isFormerlyUnknown) {
            updatedTimeline.push({
              id: `t-edit-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: "Profile Registered",
              description: `Upgraded 'Unknown Inquiry' profile to validated client [${name}]. Captured mobile and address parameters.`,
              icon: "UserCheck",
              user: "Office Secretary"
            });
          } else {
            updatedTimeline.push({
              id: `t-edit-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: "Profile Modified",
              description: "Customer profile metadata updated.",
              icon: "Settings",
              user: "Office Secretary"
            });
          }

          updatedCust = {
            ...c,
            name,
            email: email || undefined,
            mobile,
            locationAddress: address,
            isRegisteredCustomer: true,
            timeline: updatedTimeline,
          };
          return updatedCust;
        }
        return c;
      })
    );

    // Sync tasks names
    setTasks((prev) =>
      prev.map((t) => (t.customerId === id ? { ...t, customerName: name, customerMobile: mobile } : t))
    );

    // Sync to Google
    if (updatedCust) {
      syncLeadToGoogle(updatedCust);
      syncCustomerToGoogle(updatedCust);
    }
  };

  // 3. Delete selected pipelines
  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.customerId !== id));
    if (selectedCustomerId === id) {
      setSelectedCustomerId(null);
    }
    setActiveNav("customers");
  };

  // 4. Save Rough Estimators
  const handleSaveEstimate = (customerId: string, estimate: RoughEstimate) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [...c.timeline];
          updatedTimeline.push({
            id: `t-rough-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Rough Estimate Shared",
            description: `Sent instant approximate estimate range of ${estimate.minRange.toLocaleString()} - ${estimate.maxRange.toLocaleString()} (Avg: ${estimate.totalEstimate.toLocaleString()}) via WhatsApp. Work: ${estimate.workType}`,
            icon: "FileSpreadsheet",
            user: "Estimator"
          });

          // Register follow up for 2 days after rough estimate if no quotations is built yet
          return {
            ...c,
            roughEstimate: estimate,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );
  };

  // 5. Save comprehensive final quotation itemized rows
  const handleSaveQuotation = (customerId: string, quotation: FinalQuotation) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [...c.timeline];
          updatedTimeline.push({
            id: `t-quote-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Final Quotation Generated",
            description: `Drafted final itemized proposal ${quotation.quotationNumber} for a total of ₹${quotation.finalAmount.toLocaleString("en-IN")}. Standard T&C appended.`,
            icon: "FileText",
            user: "Office Clerk"
          });

          return {
            ...c,
            finalQuotations: [quotation, ...c.finalQuotations],
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    // Create a follow-up task: Quotation Sent → follow-up after 2 days
    const fDate = new Date();
    fDate.setDate(fDate.getDate() + 2);
    const fDateStr = fDate.toISOString().split("T")[0];

    const targetCust = customers.find((c) => c.id === customerId);
    const followup: FollowUpTask = {
      id: `task-fup-${Date.now()}`,
      customerId,
      customerName: targetCust?.name || "Customer",
      customerMobile: targetCust?.mobile || "",
      type: "Quotation Reminder",
      dueDate: fDateStr,
      status: "Pending",
      description: `Follow up on Quotation ${quotation.quotationNumber} (₹ ${quotation.finalAmount.toLocaleString()}). Check if revisions are required.`
    };
    setTasks((prev) => [followup, ...prev]);

    // Sync to Google Sheets
    syncQuotationToGoogle(customerId, quotation);
  };

  // 6. Capture GPS visit records, images, and voice notes
  const handleCaptureSiteVisit = (
    customerId: string,
    latitude: number,
    longitude: number,
    notes: string,
    media: MediaAttachment[]
  ) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [...c.timeline];
          updatedTimeline.push({
            id: `t-site-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Site Inspection Completed",
            description: `Completed structural check at GPS Coordinates: lat ${latitude}, long ${longitude}. Captured site parameters and recorded voice inspection note.`,
            icon: "MapPin",
            user: "Estimator"
          });

          return {
            ...c,
            siteVisit: {
              location: {
                latitude,
                longitude,
                googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                capturedAt: new Date().toISOString(),
              },
              media,
              notes,
              visitDate: new Date().toISOString().split("T")[0],
            },
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );

    const targetCust = customers.find((c) => c.id === customerId);
    syncSiteVisitToGoogle(customerId, targetCust?.name || "Client", latitude, longitude, notes);
  };

  // 7. CONTRACT DIGITAL APPROVAL SECURE WORKFLOW (AUTOMATIC PROJECT + LEDGER + INVOICE DRAFT CREATION)
  const handleApproveQuotation = (customerId: string, approval: CustomerApproval) => {
    let approvedCust: Customer | null = null;
    let approvedQuote: FinalQuotation | null = null;
    let invoice: Invoice | null = null;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [...c.timeline];
          
          // A. Mark quotation as Approved
          const updatedQuotes = c.finalQuotations.map((q) =>
            q.id === approval.quotationId ? { ...q, status: "Approved" as const } : q
          );

          // B. Auto provision opening balances in customer ledger
          const ledger = {
            totalBilled: approval.amount,
            totalPaid: 0,
            balanceDue: approval.amount,
            payments: [],
          };

          // C. Auto create project object
          const project = {
            id: `proj-auto-${Date.now()}`,
            startDate: new Date().toISOString(),
            status: "In Progress" as const,
            notes: "Contract assigned. Ready for material deployment checklist and team dispatch.",
          };

          // D. Auto compile Invoice Serial
          const invoiceNum = `SAVI-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const foundQuote = c.finalQuotations.find((q) => q.id === approval.quotationId);
          // Check if this specific quote was issued with GST, or fallback to system settings
          const isGstInvoice = foundQuote ? (foundQuote.gstEnabled !== false) : settings.gstEnabled;
          
          const calculatedSubtotal = isGstInvoice ? Math.round(approval.amount / 1.18) : approval.amount;
          const calculatedGst = isGstInvoice ? Math.round((approval.amount / 1.18) * 0.18) : 0;

          invoice = {
            id: `inv-auto-${Date.now()}`,
            invoiceNumber: invoiceNum,
            quotationId: approval.quotationId,
            createdAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // due in 8 days
            status: "Issued",
            items: [
              {
                id: `it-${Date.now()}`,
                description: `Contract service charges as per approved Proposal ${approval.quotationNumber}`,
                amount: approval.amount,
              },
            ],
            subtotal: calculatedSubtotal,
            gstAmount: calculatedGst,
            finalAmount: approval.amount,
            invoiceType: isGstInvoice ? "GST" : "Non-GST",
            gstEnabled: isGstInvoice,
            terms: [
              "Work starts after agreed advance payment.",
              "Additional work outside approved quotation is chargeable.",
              "Final payment signifies acceptance of completed work.",
              "Disputes subject to Pune jurisdiction."
            ],
            payments: [],
          };

          approvedQuote = updatedQuotes.find((q) => q.id === approval.quotationId) || null;

          updatedTimeline.push({
            id: `t-approve-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Quotation Contract Signed",
            description: `Proposal ${approval.quotationNumber} approved via digital signature by ${approval.customerName}. Complete legal blueprint stored safely.`,
            icon: "ShieldCheck",
            user: "Customer"
          });

          updatedTimeline.push({
            id: `t-proj-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Project Auto-Created",
            description: `Auto-instantiated Project ${project.id}. Working schedules set to start.`,
            icon: "Briefcase",
            user: "System"
          });

          updatedTimeline.push({
            id: `t-invoice-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Invoice Dispatched",
            description: `Auto-generated Invoice Draft ${invoiceNum} for sum of ₹${approval.amount.toLocaleString()}. Payment milestone reminders established.`,
            icon: "Receipt",
            user: "System"
          });

          approvedCust = {
            ...c,
            finalQuotations: updatedQuotes,
            approval,
            project,
            ledger,
            invoices: [invoice, ...c.invoices],
            timeline: updatedTimeline,
          };
          return approvedCust;
        }
        return c;
      })
    );

    // Create high-urgency Today follow-up remind item for 40% advance payment collections
    const task: FollowUpTask = {
      id: `task-adv-${Date.now()}`,
      customerId,
      customerName: approval.customerName,
      customerMobile: approval.mobile,
      type: "Payment Reminder",
      dueDate: "2026-06-21", // Today
      status: "Today",
      description: `Advance Payment collection: Outreaches ${approval.customerName} for the 40% project start advance sum.`
    };
    setTasks((prev) => [task, ...prev]);

    // Google Sheets Sync triggers
    if (approvedCust) {
      syncCustomerToGoogle(approvedCust);
    }
    if (invoice) {
      syncInvoiceToGoogle(customerId, invoice);
    }
    if (approvedQuote) {
      syncQuotationToGoogle(customerId, approvedQuote);
    }
  };

  const handleRejectOrRevision = (
    customerId: string,
    status: "Rejected" | "Revision Requested",
    remarks: string
  ) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [...c.timeline];
          const updatedQuotes = c.finalQuotations.map((q, idx) =>
            idx === 0 ? { ...q, status: status } : q
          );

          updatedTimeline.push({
            id: `t-reject-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: `Contract ${status}`,
            description: `Proposal status modified to ${status}. Details: "${remarks}"`,
            icon: "AlertCircle",
            user: "Customer"
          });

          return {
            ...c,
            finalQuotations: updatedQuotes,
            timeline: updatedTimeline,
          };
        }
        return c;
      })
    );
  };

  // 8. Register received payments (UPI, cash) balances ledger and invoices instantly
  const handleAddPayment = (customerId: string, invoiceId: string, payment: PaymentRecord) => {
    let updatedCust: Customer | null = null;
    let updatedInvoice: Invoice | null = null;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedTimeline = [...c.timeline];
          
          // Match and credit invoices payments
          const updatedInvoices = c.invoices.map((inv) => {
            if (inv.id === invoiceId) {
              const invPayments = [...inv.payments, payment];
              const paidTotal = invPayments.reduce((s, p) => s + p.amount, 0);
              const invStatus = paidTotal >= inv.finalAmount ? ("Paid" as const) : ("Issued" as const);
              updatedInvoice = {
                ...inv,
                payments: invPayments,
                status: invStatus,
              };
              return updatedInvoice;
            }
            return inv;
          });

          // Credit ledgers
          const ledgerPayments = [...c.ledger.payments, payment];
          const ledgerPaid = ledgerPayments.reduce((s, p) => s + p.amount, 0);
          const balance = c.ledger.totalBilled - ledgerPaid;

          updatedTimeline.push({
            id: `t-payment-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Payment Confirmed",
            description: `Received payment sum of ₹${payment.amount.toLocaleString()} via ${payment.mode}. Reference: ${payment.referenceNo}. Ledgers balanced immediately.`,
            icon: "CreditCard",
            user: "Office Clerk"
          });

          updatedCust = {
            ...c,
            invoices: updatedInvoices,
            ledger: {
              ...c.ledger,
              totalPaid: ledgerPaid,
              balanceDue: balance < 0 ? 0 : balance,
              payments: ledgerPayments,
            },
            timeline: updatedTimeline,
          };
          return updatedCust;
        }
        return c;
      })
    );

    // Google Sheets Sync triggers
    syncPaymentToGoogle(customerId, invoiceId, payment);
    if (updatedCust) {
      syncCustomerToGoogle(updatedCust);
    }
    if (updatedInvoice) {
      syncInvoiceToGoogle(customerId, updatedInvoice);
    }
  };

  const handleAddChangeOrder = (customerId: string, changeOrder: ChangeOrder) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const currentCOs = c.changeOrders || [];
          const updatedTimeline = [...c.timeline];
          updatedTimeline.push({
            id: `t-co-add-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Change Order Logged",
            description: `Variation Order ${changeOrder.changeOrderNumber} proposed for ₹${changeOrder.finalAmount.toLocaleString("en-IN")}. Description: ${changeOrder.reason}`,
            icon: "FileText",
            user: "Project Manager"
          });
          return {
            ...c,
            changeOrders: [...currentCOs, changeOrder],
            timeline: updatedTimeline
          };
        }
        return c;
      })
    );
  };

  const handleApproveChangeOrder = (customerId: string, changeOrderId: string, approvedBy: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const currentCOs = c.changeOrders || [];
          const matchedCO = currentCOs.find((co) => co.id === changeOrderId);
          if (!matchedCO || matchedCO.status === "Approved") return c;

          const updatedTimeline = [...c.timeline];
          const updatedCOs = currentCOs.map((co) => {
            if (co.id === changeOrderId) {
              return {
                ...co,
                status: "Approved" as const,
                approvedByClient: approvedBy,
                approvedAt: new Date().toISOString()
              };
            }
            return co;
          });

          // 1. Quotation Revision History
          const quotationId = matchedCO.quotationId;
          const activeQuote = c.finalQuotations.find((q) => q.id === quotationId) || c.finalQuotations[0];
          const originalAmount = activeQuote ? activeQuote.finalAmount : 0;
          
          // Sum of all approved change orders for this quotation (including this one just approved)
          const totalApprovedCOAmount = updatedCOs
            .filter((co) => co.quotationId === quotationId && co.status === "Approved")
            .reduce((sum, co) => sum + co.finalAmount, 0);

          const rawRevision: QuotationRevision = {
            id: `rev-${Date.now()}`,
            quotationId,
            revisionDate: new Date().toISOString(),
            originalAmount,
            addedAmount: matchedCO.finalAmount,
            finalAmount: originalAmount + totalApprovedCOAmount,
            reason: matchedCO.reason,
            approvedBy
          };
          const currentRevisions = c.quotationRevisions || [];

          // 2. Auto update active invoice value (append new items or adjust totals)
          // Look for an invoice linked to this quotation
          const activeInvoice = c.invoices.find((inv) => inv.quotationId === quotationId);
          let updatedInvoices = [...c.invoices];
          if (activeInvoice) {
            updatedInvoices = c.invoices.map((inv) => {
              if (inv.id === activeInvoice.id) {
                const subtotalDelta = matchedCO.subtotal;
                const gstDelta = matchedCO.gstAmount;
                const finalDelta = matchedCO.finalAmount;

                // Create new invoice items for each item in the change order
                const newInvItems = matchedCO.items.map((it) => ({
                  id: `inv-it-co-${it.id}`,
                  description: `Change Order variation: ${it.description} (${it.category})`,
                  amount: it.amount
                }));

                return {
                  ...inv,
                  items: [...inv.items, ...newInvItems],
                  subtotal: inv.subtotal + subtotalDelta,
                  gstAmount: inv.gstAmount + gstDelta,
                  finalAmount: inv.finalAmount + finalDelta,
                  status: (inv.status === "Paid" ? "Partially Paid" as const : inv.status)
                };
              }
              return inv;
            });
          } else {
            // No active invoice? Create one specifically for this Change Order!
            const invoiceNum = `SAVI-INV-CO-${Math.floor(1000 + Math.random() * 9000)}`;
            const isGstInvoice = matchedCO.gstPercent > 0;
            const newCOInvoice: Invoice = {
              id: `inv-co-${Date.now()}`,
              invoiceNumber: invoiceNum,
              quotationId,
              createdAt: new Date().toISOString(),
              dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              status: "Issued",
              items: matchedCO.items.map((it) => ({
                id: `it-${it.id}`,
                description: `Change Order variation: ${it.description} (${it.category})`,
                amount: it.amount
              })),
              subtotal: matchedCO.subtotal,
              gstAmount: matchedCO.gstAmount,
              finalAmount: matchedCO.finalAmount,
              invoiceType: isGstInvoice ? "GST" : "Non-GST",
              gstEnabled: isGstInvoice,
              terms: [
                "Billed as per approved Change Order Variation agreement.",
                "Disputes subject to Pune jurisdiction."
              ],
              payments: []
            };
            updatedInvoices = [newCOInvoice, ...c.invoices];
          }

          // 3. Update Customer Ledger
          const ledgerPayments = c.ledger.payments;
          const ledgerPaid = ledgerPayments.reduce((s, p) => s + p.amount, 0);
          
          const originalApprovedAmt = c.approval ? c.approval.amount : (activeQuote ? activeQuote.finalAmount : 0);
          const newTotalBilled = originalApprovedAmt + totalApprovedCOAmount;
          const newBalanceDue = newTotalBilled - ledgerPaid;

          updatedTimeline.push({
            id: `t-co-approve-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Change Order Approved",
            description: `Variation Order ${matchedCO.changeOrderNumber} approved by ${approvedBy}. Contract value expanded by ₹${matchedCO.finalAmount.toLocaleString("en-IN")}.`,
            icon: "ShieldCheck",
            user: "Customer"
          });

          return {
            ...c,
            changeOrders: updatedCOs,
            quotationRevisions: [...currentRevisions, rawRevision],
            invoices: updatedInvoices,
            ledger: {
              ...c.ledger,
              totalBilled: newTotalBilled,
              balanceDue: newBalanceDue < 0 ? 0 : newBalanceDue
            },
            timeline: updatedTimeline
          };
        }
        return c;
      })
    );
  };

  // 9. Marketing Campaigns
  const handleAddCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  const handleSendCampaignToCustomer = (campaignId: string, customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const camp = campaigns.find(cam => cam.id === campaignId);
          const updatedTimeline = [...c.timeline];
          const logText = camp ? camp.messageTemplate.replace("[Customer Name]", c.name) : "Campaign newsletter sent via WhatsApp.";
          
          updatedTimeline.push({
            id: `t-camp-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: "Ad Campaign Received",
            description: `Targeted newsletter broadcast "${camp?.title || "Savi Offer"}" route through WhatsApp. Click state tagged as Delivered.`,
            icon: "Megaphone",
            user: "System"
          });

          const activeCampaigns = [...c.campaigns, {
            campaignId,
            campaignName: camp?.title || "Savi Offer",
            sentAt: new Date().toISOString(),
            status: "Delivered" as const
          }];

          const whatsAppLogs = [...c.whatsAppLogs, {
            id: `wl-auto-${Date.now()}`,
            timestamp: new Date().toISOString(),
            messageType: "Campaign Promotional",
            messageText: logText,
            status: "Delivered" as const
          }];

          return {
            ...c,
            campaigns: activeCampaigns,
            whatsAppLogs,
            timeline: updatedTimeline
          };
        }
        return c;
      })
    );

    // Increment campaigns metrics
    setCampaigns(prev => prev.map(cam => {
      if (cam.id === campaignId) {
        const total = cam.targetCount + 1;
        const click = cam.clickedCount + (Math.random() > 0.4 ? 1 : 0);
        const reply = cam.respondedCount + (Math.random() > 0.75 ? 1 : 0);
        const buy = cam.interestedCount + (Math.random() > 0.9 ? 1 : 0);

        return {
          ...cam,
          targetCount: total,
          deliveredCount: total,
          clickedCount: click,
          respondedCount: reply,
          interestedCount: buy
        };
      }
      return cam;
    }));
  };

  // 10. Follow-up tasks mutators
  const handleCompleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Completed" as const } : t))
    );
  };

  const handleLaunchWhatsAppReminder = (task: FollowUpTask) => {
    const url = `https://wa.me/${task.customerMobile.replace(/[-+ \s]/g, "")}?text=${encodeURIComponent(
      `Hello ${task.customerName}! This is an active follow up regarding your Savi Painting account: ${task.description}. Let us know if we can help you coordinate milestones.`
    )}`;
    window.open(url, "_blank");

    // Add activity to timeline
    setCustomers(prev => prev.map(c => {
      if (c.id === task.customerId) {
        const updatedTimeline = [...c.timeline];
        updatedTimeline.push({
          id: `t-taskup-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: "WhatsApp Nudge Dispatched",
          description: `Dispatched manual nudge regarding task trigger: "${task.type}"`,
          icon: "MessageSquare",
          user: "Estimator"
        });
        return { ...c, timeline: updatedTimeline };
      }
      return c;
    }));
  };

  // Export Data for Backup (Durable CRM compliance)
  const handleExportDB = () => {
    const backupObj = { customers, materials, campaigns, tasks };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `savi_painting_os_backup_june2026.json`);
    dlAnchorElem.click();
  };

  // Target Customer for estimating views
  const estimatingCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const activeQuotation = estimatingCustomer?.finalQuotations[0] || null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white" id="app-shell">
      
      {/* HIGH DENSITY PREMIER HEADER */}
      <header className="bg-[#1e293b] text-slate-200 border-b border-sidebar border-slate-700" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded text-white flex items-center justify-center shrink-0">
              <Paintbrush className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SAVI PAINTING OS <span className="text-blue-400 font-normal text-xs bg-blue-900/40 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider leading-none">ENTERPRISE ULTIMATE</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium italic">Estimator Workspace (vickysalave05@gmail.com • Pune West Desk)</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300 flex-wrap justify-center sm:justify-end">
            <div className="bg-slate-900/60 px-3 py-1 rounded border border-slate-700 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>June 21, 2026 • 09:05 AM (Pune)</span>
            </div>
            
            <button
              id="btn-backup-export"
              onClick={handleExportDB}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] flex items-center gap-1.5"
              title="Download Secure Database JSON Backup"
            >
              <Download className="w-3.5 h-3.5 text-white" /> Backup DB
            </button>
          </div>
        </div>
      </header>

      {/* COMPACT HIGH DENSITY NAVIGATION PANEL */}
      <nav className="bg-[#0f172a] border-b border-slate-800 shadow-sm" id="primary-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex gap-1.5 overflow-x-auto">
          {/* Nav Item: Dashboard */}
          <button
            id="nav-btn-dashboard"
            onClick={() => setActiveNav("dashboard")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "dashboard"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Executive Stats
          </button>

          {/* Nav Item: Customer Profiles */}
          <button
            id="nav-btn-customers"
            onClick={() => setActiveNav("customers")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "customers"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" /> Customer Pipelines
          </button>

          {/* Nav Item: Rough Estimator */}
          <button
            id="nav-btn-rough"
            onClick={() => setActiveNav("rough")}
            disabled={!estimatingCustomer}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "rough"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Calculator className="w-4 h-4" /> Rough Estimator
          </button>

          {/* Nav Item: Final Proposals */}
          <button
            id="nav-btn-final"
            onClick={() => setActiveNav("final")}
            disabled={!estimatingCustomer}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "final"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" /> Final Proposals
          </button>

          {/* Nav Item: Live Portal simulation */}
          <button
            id="nav-btn-portal"
            onClick={() => setActiveNav("portal")}
            disabled={!activeQuotation}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
              activeNav === "portal"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            }`}
            title={!activeQuotation ? "Requires compiled quotation first!" : ""}
          >
            <UserCheck className="w-4 h-4" /> Digital Sign Simulator
            {activeQuotation && activeQuotation.status !== "Approved" && (
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Nav Item: Follow up matrix */}
          <button
            id="nav-btn-followups"
            onClick={() => setActiveNav("followups")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
              activeNav === "followups"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Bell className="w-4 h-4" /> Touchpoint Follow-Ups
            {tasks.filter(t => t.status === "Today" || t.status === "Overdue").length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] rounded font-bold">
                {tasks.filter(t => t.status === "Today" || t.status === "Overdue").length}
              </span>
            )}
          </button>

          {/* Nav Item: Materials Database */}
          <button
            id="nav-btn-materials"
            onClick={() => setActiveNav("materials")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "materials"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FolderSync className="w-4 h-4 text-teal-400" /> Procurement & Stores
          </button>

          {/* Nav Item: Marketing Campaigns */}
          <button
            id="nav-btn-campaigns"
            onClick={() => setActiveNav("campaigns")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "campaigns"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Building className="w-4 h-4 text-indigo-400" /> Promo Campaigns
          </button>

          {/* Nav Item: System Config Settings */}
          <button
            id="nav-btn-settings"
            onClick={() => setActiveNav("settings")}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeNav === "settings"
                ? "bg-blue-900/40 text-blue-400 border border-blue-500/30 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-400 animate-spin-slow" /> GST & Tax Settings
          </button>
        </div>
      </nav>

      {/* CORE WORKSPACE ENTRY VIEWPORTS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6" id="primary-workspace">
        
        {/* VIEW 1: EXECUTIVE STATS */}
        {activeNav === "dashboard" && (
          <DashboardStats customers={customers} campaigns={campaigns} />
        )}

        {/* VIEW 2: CUSTOMER PIPELINES CRM */}
        {activeNav === "customers" && (
          <CustomerProfiles
            customers={customers}
            materials={materials}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            onAddCustomer={handleAddCustomer}
            onCaptureSiteVisit={handleCaptureSiteVisit}
            onAddPayment={handleAddPayment}
            onDeleteCustomer={handleDeleteCustomer}
            onUpdateCustomerNameAndDetails={handleUpdateCustomerNameAndDetails}
            onAddChangeOrder={handleAddChangeOrder}
            onApproveChangeOrder={handleApproveChangeOrder}
            settings={settings}
          />
        )}

        {/* VIEW 3: ROUGH ESTIMATIONS */}
        {activeNav === "rough" && (
          <div className="space-y-6" id="view-rough-wrapper">
            {/* Quick target selector warning */}
            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-md shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="text-slate-400">Target Estimations Account: </span>
                <strong className="text-blue-400" id="estimating-customer-name-tag">{estimatingCustomer?.name} ({estimatingCustomer?.mobile})</strong>
              </div>
              <p className="text-[10px] text-slate-500">Choose a different profile in the Customer Pipeline page as needed.</p>
            </div>
            {estimatingCustomer ? (
              <RoughQuotationCalculator
                customer={estimatingCustomer}
                onSaveEstimate={handleSaveEstimate}
              />
            ) : (
              <p className="text-center text-slate-500 text-xs font-medium">Please register or select a pipeline customer lead first.</p>
            )}
          </div>
        )}

        {/* VIEW 4: FINAL PROPOSALS CONSTRUCTOR */}
        {activeNav === "final" && (
          <div className="space-y-6" id="view-final-wrapper">
            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-md shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="text-slate-400">Target Estimations Account: </span>
                <strong className="text-blue-400">{estimatingCustomer?.name} ({estimatingCustomer?.mobile})</strong>
              </div>
              <p className="text-[10px] text-slate-500">Formulates precise costing bounds for proposals.</p>
            </div>
            {estimatingCustomer ? (
              <FinalQuotationGenerator
                customer={estimatingCustomer}
                materials={materials}
                onSaveQuotation={handleSaveQuotation}
                settings={settings}
              />
            ) : (
              <p className="text-center text-slate-500 text-xs font-medium">Please register a pipeline customer lead first.</p>
            )}
          </div>
        )}

        {/* VIEW 5: DIGITAL SIGN PORTAL SIMULATORS */}
        {activeNav === "portal" && (
          <div className="space-y-6" id="view-portal-wrapper">
            <div className="text-center max-w-md mx-auto relative mb-2">
              <h4 className="font-extrabold text-slate-200 text-sm">Customer Approval Interface</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Simulate digital contract approvals from the client's smartphone.</p>
            </div>
            {estimatingCustomer && activeQuotation ? (
              <CustomerPortalView
                customer={estimatingCustomer}
                quotation={activeQuotation}
                settings={settings}
                onApprove={handleApproveQuotation}
                onRejectOrRevision={handleRejectOrRevision}
              />
            ) : (
              <div className="bg-[#0f172a] border border-slate-800 p-8 text-center text-slate-400 max-w-sm mx-auto rounded-xl">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h5 className="font-bold text-slate-300 text-xs">No Active Quotation</h5>
                <p className="text-[10px] text-slate-500 mt-1">Estimators must compile a final proposal in the 'Final Proposals' tab first before simulating signatures.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: TOUCHWORDS FOLLOWS PIPELINES */}
        {activeNav === "followups" && (
          <FollowUpAutomationPanel
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onLaunchWhatsAppReminder={handleLaunchWhatsAppReminder}
          />
        )}

        {/* VIEW 7: PRODUCT DATABASES & PROCUREMENT HUB MANAGMENT */}
        {activeNav === "materials" && (
          <ProcurementHub
            customers={customers}
            materials={materials}
            onAddMaterial={(mat) => setMaterials(prev => [mat, ...prev])}
            onUpdateMaterialRate={(id, rate) => setMaterials(prev => prev.map(m => m.id === id ? { ...m, rate } : m))}
            vendors={vendors}
            setVendors={setVendors}
            purchases={purchases}
            setPurchases={setPurchases}
          />
        )}

        {/* VIEW 8: PROMO CAMPAIGNS MARKETING */}
        {activeNav === "campaigns" && (
          <CampaignManagement
            campaigns={campaigns}
            customers={customers}
            onAddCampaign={handleAddCampaign}
            onSendCampaignToCustomer={handleSendCampaignToCustomer}
          />
        )}

        {/* VIEW 9: SYSTEM PREFERENCES / TAX CONFIGURATION */}
        {activeNav === "settings" && (
          <SettingsModule
            settings={settings}
            onSaveSettings={(newSettings) => setSettings(newSettings)}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-slate-500 text-[10px] text-center py-4 border-t border-slate-800" id="app-footer">
        <p className="font-semibold uppercase tracking-widest text-[#64748b] flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Database Synced • <span className="w-2 h-2 rounded-full bg-blue-500"></span> WhatsApp API: Active
        </p>
        <p className="mt-1 font-mono text-slate-600">Savi Painting OS Enterprise Ultimate • Pune Jurisdiction Standard Terms Apply • App Version 8.2.1-ULTIMATE</p>
      </footer>

    </div>
  );
}
