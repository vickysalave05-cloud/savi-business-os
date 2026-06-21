/**
 * Savi Painting OS Enterprise Ultimate - Core System Types
 */

export type LeadSource =
  | "Meta Ads"
  | "Facebook"
  | "Instagram"
  | "Google Ads"
  | "Google Business Profile"
  | "WhatsApp"
  | "Phone Calls"
  | "Reference"
  | "Website"
  | "Walk-In"
  | "Manual Entry";

export type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Viewed"
  | "Approved"
  | "Rejected"
  | "Revision Requested";

export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "Partially Paid"
  | "Paid"
  | "Overdue";

export type ProjectStatus =
  | "Not Started"
  | "In Progress"
  | "On Hold"
  | "Completed";

export type CampaignStatus =
  | "Delivered"
  | "Clicked"
  | "Responded"
  | "Interested";

// Material record type for the database
export interface Material {
  id: string;
  brand: string; // Asian Paints, Berger, Nerolac, Indigo, Dr Fixit, Pidilite, Sika, Fosroc, JK Cement, Birla White
  name: string;
  category: "Paint" | "Primer" | "Putty" | "Texture" | "Waterproofing" | "Cement" | "Other";
  coverage: number; // in sq ft per liter or kg
  consumptionRate: number; // standard liters/kgs per sq ft
  rate: number; // cost per liter or kg in INR
  packing: string; // e.g., "20L", "10L", "4L", "1L", "50kg"
  application: string; // guidelines for application
  materialType: string; // e.g., "Emulsion", "Acrylic", "Waterproof compound"
}

// Media attachment during site visits
export interface MediaAttachment {
  id: string;
  type: "photo" | "video" | "voice";
  url: string; // base64 or temporary object url
  timestamp: string;
  name: string;
}

// GPS Location info
export interface GPSLocation {
  latitude: number | null;
  longitude: number | null;
  googleMapsLink: string;
  capturedAt: string;
}

export interface SiteVisitData {
  location: GPSLocation;
  media: MediaAttachment[];
  notes: string;
  visitDate: string;
}

// CRM Timeline entry for auditing the customer journey
export interface TimelineEntry {
  id: string;
  timestamp: string;
  action: string; // e.g., "Lead Created", "Site Visit Captured", "Quotation Sent"
  description: string;
  icon: string; // lucide icon identifier
  user: string; // e.g., "Estimator", "System", "Admin"
}

export interface ChangeOrderItem {
  id: string;
  description: string;
  category: "Scraping" | "Putty" | "Primer" | "Paint" | "Texture" | "Waterproofing" | "Labour" | "Transport" | "Scaffolding" | "Other";
  area?: number;
  rate: number;
  quantity: number;
  amount: number;
}

export interface ChangeOrder {
  id: string;
  quotationId: string;
  changeOrderNumber: string;
  createdAt: string;
  reason: string;
  items: ChangeOrderItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  finalAmount: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  approvedByClient?: string;
  approvedAt?: string;
}

export interface QuotationRevision {
  id: string;
  quotationId: string;
  revisionDate: string;
  originalAmount: number;
  addedAmount: number;
  finalAmount: number;
  reason: string;
  approvedBy: string;
}

export interface RoughEstimate {
  approxArea: number; // sq ft
  workType: string; // Interior, Exterior, Waterproofing, Texture
  approxRate: number; // per sq ft
  totalEstimate: number;
  minRange: number;
  maxRange: number;
  customerBudget: number;
  budgetComparison: "Under Budget" | "Within Budget" | "Over Budget";
  sharedAt?: string;
}

export interface FinalQuotationItem {
  id: string;
  name: string;
  category: "Scraping" | "Putty" | "Primer" | "Paint" | "Texture" | "Waterproofing" | "Labour" | "Transport" | "Scaffolding";
  materialId?: string; // Optional reference to database
  materialBrand?: string;
  quantity: number; // in sq ft or overall lumpsum
  rate: number; // unit rate in INR
  amount: number;
}

export interface FinalQuotation {
  id: string;
  quotationNumber: string;
  createdAt: string;
  items: FinalQuotationItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstPercent: number;
  gstAmount: number;
  profitMarginPercent: number; // included in rate or added as cost
  profitMarginAmount: number;
  finalAmount: number;
  status: QuotationStatus;
  terms: string[];
  invoiceType?: "GST" | "Non-GST";
  gstEnabled?: boolean;
}

export interface CustomerApproval {
  customerName: string;
  mobile: string;
  quotationId: string;
  quotationNumber: string;
  amount: number;
  date: string;
  time: string;
  source: string; // e.g. "WhatsApp Link", "On-site Screen"
  method: "Click to Approve" | "E-Signature" | "WhatsApp Code";
  whatsappConfirmation: string;
  remarks: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  createdAt: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  finalAmount: number;
  terms: string[];
  payments: PaymentRecord[];
  invoiceType?: "GST" | "Non-GST";
  gstEnabled?: boolean;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  mode: "Cash" | "UPI" | "Net Banking" | "Cheque";
  referenceNo: string;
  remarks: string;
}

export interface FollowUpTask {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  type: "Lead Response" | "Quotation Feed" | "Quotation Reminder" | "Payment Reminder" | "Feedback Request";
  dueDate: string;
  status: "Today" | "Pending" | "Overdue" | "Completed";
  description: string;
}

export interface CampaignLog {
  campaignId: string;
  campaignName: string;
  sentAt: string;
  status: CampaignStatus;
}

// Single Unified Customer Record containing entire lifecycle history (normalized logic)
export interface Customer {
  id: string;
  name: string; // Or "Unknown Inquiry" if unknown
  mobile: string;
  email?: string;
  dateCreated: string;
  source: LeadSource;
  remarks: string;
  locationAddress: string;
  isRegisteredCustomer: boolean; // false until name/details are captured
  
  // Entire journey attributes
  siteVisit?: SiteVisitData;
  roughEstimate?: RoughEstimate;
  finalQuotations: FinalQuotation[];
  approval?: CustomerApproval;
  project?: {
    id: string;
    startDate: string;
    endDate?: string;
    status: ProjectStatus;
    notes: string;
  };
  ledger: {
    totalBilled: number;
    totalPaid: number;
    balanceDue: number;
    payments: PaymentRecord[];
  };
  invoices: Invoice[];
  changeOrders?: ChangeOrder[];
  quotationRevisions?: QuotationRevision[];
  timeline: TimelineEntry[];
  whatsAppLogs: {
    id: string;
    timestamp: string;
    messageType: string; // e.g., "Quotation", "Reminder", "Invoice", "Campaign"
    messageText: string;
    status: "Sent" | "Delivered";
  }[];
  campaigns: CampaignLog[];
}

export interface Campaign {
  id: string;
  title: string;
  type: "Summer Special" | "Monsoon Waterproofing" | "Festival Offer" | "New Year Sale" | "Referral Reward" | "Custom";
  messageTemplate: string;
  discountValue: string;
  targetCount: number;
  deliveredCount: number;
  clickedCount: number;
  respondedCount: number;
  interestedCount: number;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  mobile: string;
  address: string;
  gstNumber?: string;
  materialCategories: string[]; // e.g. ["Paint", "Waterproofing", "Putty"]
  purchaseCount: number; // total auto-calculated purchase count
  outstandingPayment: number; // total unpaid or partially unpaid purchases
  rating: number; // Quality/delivery rating (1 to 5)
  createdAt: string;
}

export interface MaterialPurchase {
  id: string;
  projectId: string; // Tethers to Customer's project
  customerId: string; // Customer ID
  projectName: string;
  customerName: string;
  purchaseDate: string; // YYYY-MM-DD
  vendorId: string;
  vendorName: string;
  vendorMobile: string;
  vendorGst?: string;
  invoiceNumber: string;
  materialCategory: "Paint" | "Primer" | "Putty" | "Texture" | "Waterproofing" | "Cement" | "Other";
  brand: string;
  productName: string;
  quantity: number;
  unit: string; // "Liters" | "Kgs" | "Bags" | "Boxes" | "Lumpsum"
  rate: number;
  amount: number; // quantity * rate
  gstPercent: number; // e.g. 18%
  gstAmount: number; // amount * (gstPercent/100)
  transportCost: number;
  loadingUnloadingCost: number;
  otherCharges: number;
  finalPurchaseAmount: number; // gross amount + gstAmount + transport + loading + other
  paymentStatus: "Paid" | "Partially Paid" | "Pending";
  paidAmount: number; // how much has been currently settled
  invoiceCopyUrl?: string; // Google Drive storage link
  billPdfUrl?: string; // Supplier physical invoice reference
  googleDriveFileId?: string; // actual drive identifier string
  wastageQuantity?: number; // tracked wastage in quantity
  wastageReason?: string;
}

export interface SystemSettings {
  gstEnabled: boolean;
  gstNumber: string;
  businessName: string;
  gstStatus: string;
  nonGstText: string;
  termsAndConditions?: string[];
  paymentAdvancePercent?: number;
  paymentWorkPercent?: number;
  paymentCompletionPercent?: number;
  approvalStatement?: string;
  warrantyPolicy?: string;
  companyAddress?: string;
  companyContact?: string;
  companyEmail?: string;
}


