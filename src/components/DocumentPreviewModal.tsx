import React from "react";
import { Customer, FinalQuotation, Invoice, SystemSettings } from "../types";
import { X, Download, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import { exportQuotationToPDF, exportInvoiceToPDF } from "../utils/pdfExport";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  settings: SystemSettings;
  dataType: "quotation" | "invoice";
  data: FinalQuotation | Invoice | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  customer,
  settings,
  dataType,
  data,
}) => {
  if (!isOpen || !data) return null;

  const isQuotation = dataType === "quotation";
  const itemizedInvoice = !isQuotation ? (data as Invoice) : null;
  const itemizedQuotation = isQuotation ? (data as FinalQuotation) : null;

  const docNumber = isQuotation 
    ? itemizedQuotation?.quotationNumber 
    : itemizedInvoice?.invoiceNumber;

  const docDate = isQuotation
    ? itemizedQuotation?.createdAt
    : itemizedInvoice?.createdAt;

  const formattedDate = docDate
    ? new Date(docDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const finalAmount = isQuotation
    ? itemizedQuotation?.finalAmount || 0
    : itemizedInvoice?.finalAmount || 0;

  const gstPercent = isQuotation
    ? itemizedQuotation?.gstPercent || 0
    : settings.gstEnabled ? 18 : 0;

  const gstAmount = isQuotation
    ? itemizedQuotation?.gstAmount || 0
    : itemizedInvoice?.gstAmount || 0;

  const subtotal = isQuotation
    ? itemizedQuotation?.subtotal || 0
    : itemizedInvoice?.subtotal || 0;

  const discountAmount = isQuotation
    ? itemizedQuotation?.discountAmount || 0
    : 0;

  const profitMarginAmount = isQuotation
    ? itemizedQuotation?.profitMarginAmount || 0
    : 0;

  const gstEnabled = isQuotation
    ? itemizedQuotation?.gstEnabled !== false
    : itemizedInvoice?.gstEnabled !== false && settings.gstEnabled;

  const itemsList = isQuotation
    ? itemizedQuotation?.items || []
    : itemizedInvoice?.items.map(it => ({
        id: it.id,
        name: it.description,
        category: "Milestone",
        quantity: 1,
        rate: it.amount,
        amount: it.amount
      })) || [];

  const terms = isQuotation
    ? (itemizedQuotation?.terms && itemizedQuotation.terms.length > 0 ? itemizedQuotation.terms : settings.termsAndConditions || [])
    : (itemizedInvoice?.terms && itemizedInvoice.terms.length > 0 ? itemizedInvoice.terms : settings.termsAndConditions || []);

  // Simulate WhatsApp Payload Trigger
  const handleWhatsAppAction = () => {
    let text = "";
    if (isQuotation && itemizedQuotation) {
      text = `Hello ${customer.name}! We have finalized Quotation ${itemizedQuotation.quotationNumber} for ₹${itemizedQuotation.finalAmount.toLocaleString("en-IN")}. Scope includes brand material parameters. Press Approve to greenlit: https://savi-paints.co/approve/${customer.id}`;
    } else if (itemizedInvoice) {
      text = `Hello ${customer.name}! Find outstanding Invoice ${itemizedInvoice.invoiceNumber} for ₹${customer.ledger.balanceDue.toLocaleString("en-IN")}. Secure payment UPI link: https://savi-paints.co/pay/${itemizedInvoice.id}`;
    }
    const url = `https://wa.me/${customer.mobile.replace(/[-+ \s]/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Safe Fallback Trigger for PDF Generation
  const handleDownloadPDF = () => {
    if (isQuotation && itemizedQuotation) {
      exportQuotationToPDF(customer, itemizedQuotation, settings);
    } else if (itemizedInvoice) {
      exportInvoiceToPDF(customer, itemizedInvoice, settings);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="doc-preview-backdrop">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl flex flex-col max-h-[92vh]" id="doc-preview-modal-shell">
        
        {/* Modal Controller Bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
          <div>
            <span className="text-[9px] uppercase font-heavy tracking-widest text-emerald-400 font-mono block">LIVE DOCUMENT VIEW</span>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isQuotation ? "Quotation Proposal Review" : "Milestone Invoice Review"} 
              <span className="text-slate-500 font-mono text-xs lowercase">({docNumber})</span>
            </h4>
          </div>
          
          <button 
            id="close-doc-preview-modal"
            onClick={onClose}
            className="p-1 px-3 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>

        {/* Dynamic Action Ribbons */}
        <div className="bg-slate-850 p-3.5 px-6 border-b border-slate-800 flex flex-wrap gap-3 items-center justify-between text-xs">
          <p className="text-slate-300">
            Verify details, stamp markers, and terms logs before dispatching the proposal to standard clients.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              id="btn-preview-modal-download"
              onClick={handleDownloadPDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
            >
              <Download className="w-4 h-4" /> Export Print PDF
            </button>
            <button
              id="btn-preview-modal-whatsapp"
              onClick={handleWhatsAppAction}
              className="bg-green-600 hover:bg-green-700 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
            >
              <MessageSquare className="w-4 h-4" /> Send to WhatsApp
            </button>
          </div>
        </div>

        {/* Main Digital Mockup Canvas (Realistic A4 Printable Paper Representation) */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-10 flex justify-center scrollbar-thin">
          
          <div className="w-full max-w-[210mm] bg-white text-slate-800 p-8 sm:p-12 shadow-2xl rounded-sm relative min-h-[297mm] flex flex-col justify-between font-sans border-t-[8px] border-indigo-600" id="interactive-printed-mockup">
            
            {/* Stamp Overlay Indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.09] select-none border-[6px] border-emerald-600 px-8 py-4 rounded-3xl text-emerald-600 font-black tracking-widest text-4xl rotate-12 flex flex-col items-center">
              <span>SAVI PAINTING</span>
              <span className="text-xl">DIGITALLY SIGNED & SEALED</span>
              <span className="text-xs">SYSTEM SECURED GENUINE</span>
            </div>

            <div>
              {/* BRANDING HEADER */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {settings.businessName}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-1.5 flex items-center gap-1">
                    Professional Surface Refinishing • Moisture Proofing • Texture Coat
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Pune Central Office, West Jurisdiction Lic #95180-293
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-widest block">
                    {isQuotation ? "OFFICIAL PROPOSAL" : "BILLING INVOICE"}
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                    ID: {docNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Issued: {formattedDate}
                  </p>
                  {settings.gstEnabled && settings.gstNumber && (
                    <span className="inline-block mt-1 text-[9px] bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600 font-bold">
                      GSTIN: {settings.gstNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* CLIENT PROFILE META BOARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">PREPARED FOR CLIENT:</span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{customer.name}</h3>
                  <div className="mt-1.5 space-y-0.5 text-slate-600">
                    <p>Phone: {customer.mobile}</p>
                    <p>Email: {customer.email || "not specified"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">SITE ADRESS & DETAILS:</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    Scope: {customer.roughEstimate?.approxArea ? `${customer.roughEstimate.approxArea} Sq.Ft. Painting` : "Custom Project Space"}
                  </p>
                  <p className="text-slate-600 mt-1 font-serif italic text-[11px] leading-relaxed">
                    {customer.locationAddress || "Pune Region, Maharashtra, India"}
                  </p>
                </div>
              </div>

              {/* ITEMIZATION GRID TABLE */}
              <div className="my-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2.5">
                  ITEMIZED BREAKDOWN OF CONTRACT WORKS:
                </span>
                
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-extrabold uppercase text-[9px] tracking-wider rounded-t-lg">
                      <th className="p-2 px-3 rounded-l-lg">Title & Scope Space</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Unit Rate</th>
                      <th className="p-2 text-right rounded-r-lg px-3">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 italic">No cost slabs mapped to proposal context.</td>
                      </tr>
                    ) : (
                      itemsList.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                          <td className="p-2 px-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="p-2">
                            <span className="inline-block text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            {isQuotation ? `${item.quantity.toLocaleString("en-IN")} SF` : "1 Units"}
                          </td>
                          <td className="p-2 text-right font-mono text-slate-600">
                            ₹{item.rate.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900 font-mono px-3">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* FINANCIAL SUMMARY TOTALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-4 border-t border-slate-150">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    CERTIFIED BANK CLEARING INFO:
                  </span>
                  <div className="text-[10px] text-slate-500 leading-relaxed font-mono space-y-0.5 bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <p className="font-bold text-slate-700">A/C: SAVI INTERIORS SERVICES</p>
                    <p>Bank: HDFC Bank Pune Central</p>
                    <p>IFSC: HDFC0002894 (Current)</p>
                    <p>UPI ID: savipainting@hdfcbank</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-11/12 text-xs border border-slate-200">
                  <div className="flex justify-between font-medium text-slate-500 pb-1.5 border-b border-slate-150">
                    <span>Aggregated Items Net Subtotal:</span>
                    <span className="font-mono text-slate-800">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {isQuotation && discountAmount > 0 && (
                    <div className="flex justify-between text-slate-500 mt-1.5">
                      <span>Customer Loyalty Discount:</span>
                      <span className="font-mono text-rose-600 font-semibold">- ₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {isQuotation && profitMarginAmount > 0 && (
                    <div className="flex justify-between text-slate-500 mt-1.5">
                      <span>Contract Office Margin:</span>
                      <span className="font-mono text-indigo-600">+ ₹{profitMarginAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {gstEnabled ? (
                    <div className="space-y-1 mt-1.5 border-t border-dashed border-slate-200 pt-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Central GST (CGST 9.0%):</span>
                        <span className="font-mono text-slate-600">+ ₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>State GST (SGST 9.0%):</span>
                        <span className="font-mono text-slate-600">+ ₹{Math.round(gstAmount / 2).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 rounded text-[9px] text-amber-900 border border-amber-200 italic mt-1.5">
                      * {settings.nonGstText || "Supplier Not Registered Under GST Slabs"}
                    </div>
                  )}

                  <div className="flex justify-between text-slate-900 font-extrabold text-xs pt-2 border-t border-slate-200 mt-2">
                    <span className="uppercase text-[10px] tracking-wider text-indigo-700">Net Billed Payable Total:</span>
                    <span className="font-mono text-indigo-700 text-sm">₹{finalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* COMPLIARY CONTRACT TERMS */}
              <div className="my-6 text-[10px] text-slate-400 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">CONTRACT REGULATION TERMS:</span>
                <ul className="list-decimal pl-4 space-y-0.5 leading-relaxed text-slate-500">
                  {terms.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                  {terms.length === 0 && (
                    <>
                      <li>Work starts strictly after mobilization advance of 40% is secured.</li>
                      <li>Any additions or alterations outside standard specs are chargeable inside secondary orders.</li>
                      <li>Payment must clear on/before the invoice due date cycle limit.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* SIGNATURE STAMP AREA */}
            <div className="mt-8 border-t border-slate-200 pt-5 flex justify-between items-end text-xs">
              <div className="text-slate-400 space-y-1 text-[10px]">
                <p className="font-medium text-slate-500">Client Signature Approval</p>
                <div className="h-9 w-24 border-b border-dashed border-slate-300 mt-1"></div>
                <p>Authorized Representative</p>
              </div>

              {/* High density certified genuine hand seal */}
              <div className="text-right space-y-1 text-[10px]">
                <p className="font-semibold text-slate-500">Executive For {settings.businessName}</p>
                <div className="relative inline-block my-1 px-3 py-1.5 border-2 border-emerald-500 text-emerald-600 rounded font-black text-[9px] font-mono tracking-wider rotate-[-2deg] uppercase">
                  <div className="absolute inset-0 bg-emerald-50 opacity-10 rounded"></div>
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600 align-middle" />
                  SAVI OFFICE SECURED
                  <br />
                  <span className="text-[7.5px] font-normal italic">Authentic Document Stamp</span>
                </div>
                <p className="text-slate-400">Chief Estimator Signature</p>
              </div>
            </div>

          </div>
          
        </div>

      </div>
    </div>
  );
};
