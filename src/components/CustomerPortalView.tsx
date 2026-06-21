import React, { useState } from "react";
import { Customer, FinalQuotation, CustomerApproval, SystemSettings } from "../types";
import { Check, X, RotateCcw, ShieldCheck, QrCode, ExternalLink, MessageSquare, Landmark, Info, Download } from "lucide-react";
import { exportQuotationToPDF } from "../utils/pdfExport";

interface CustomerPortalViewProps {
  customer: Customer;
  quotation: FinalQuotation;
  settings?: SystemSettings;
  onApprove: (customerId: string, approval: CustomerApproval) => void;
  onRejectOrRevision: (customerId: string, status: "Rejected" | "Revision Requested", remarks: string) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  customer,
  quotation,
  settings,
  onApprove,
  onRejectOrRevision,
}) => {
  const [remarks, setRemarks] = useState("");
  const [clientSignature, setClientSignature] = useState(customer.name !== "Unknown Inquiry" ? customer.name : "");
  const [completed, setCompleted] = useState(false);
  const [statusVal, setStatusVal] = useState<string>("");

  // Create WhatsApp prefilled confirmation text
  const generateWhatsAppConfirmation = () => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
    const statement = settings?.approvalStatement || "I have read and understood the quotation, scope of work, payment terms, material specifications and conditions. I voluntarily approve this quotation.";
    
    return `I, ${clientSignature || customer.name}, approve quotation ${quotation.quotationNumber} for ₹${quotation.finalAmount.toLocaleString("en-IN")}. ${statement}\n\nDate: ${dateStr}\nTime: ${timeStr}\nApproval Method: Savi Digital Sign Portal\nQuotation Version: ${quotation.quotationNumber}`;
  };

  const getWhatsAppLaunchLink = () => {
    const confirmationText = generateWhatsAppConfirmation();
    const cleanMobile = customer.mobile.replace(/[-+ \s]/g, "");
    return `https://wa.me/${cleanMobile}?text=${encodeURIComponent(confirmationText)}`;
  };

  const handleApproveAction = () => {
    if (!clientSignature.trim()) {
      alert("Please designate your full legal name to execute the digital contract signature.");
      return;
    }

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().split("T")[0];

    const approval: CustomerApproval = {
      customerName: clientSignature,
      mobile: customer.mobile,
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      amount: quotation.finalAmount,
      date: dateStr,
      time: timeStr,
      source: "Savi Digital Sign Web Portal",
      method: "Click to Approve",
      whatsappConfirmation: generateWhatsAppConfirmation(),
      remarks: remarks || "Approved via secure client portal.",
    };

    onApprove(customer.id, approval);
    setCompleted(true);
    setStatusVal("Approved");
  };

  const handleRejectOrRevisionAction = (actionType: "Rejected" | "Revision Requested") => {
    if (!remarks.trim()) {
      alert("Please provide feedback remarks so our estimators can adjust the pricing or scope of work.");
      return;
    }
    onRejectOrRevision(customer.id, actionType, remarks);
    setCompleted(true);
    setStatusVal(actionType);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto shadow-md" id="client-portal-main">
      {/* Simulation Header */}
      <div className="bg-teal-950 text-white p-3 px-5 rounded-2xl flex flex-wrap items-center justify-between gap-2 mb-6" id="portal-sim-banner">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          <span className="text-[10px] tracking-widest uppercase font-bold text-teal-300">Live Client Simulation Mode</span>
        </div>
        <p className="text-[11px] text-teal-100 font-medium select-none">
          This panel simulates what the Customer sees on their phone when opening the shared link.
        </p>
      </div>

      {completed ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center shadow-sm space-y-5" id="portal-completed-card">
          <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800" id="portal-success-title">Contract Securely Recorded!</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
              You chose <strong className="text-teal-700">{statusVal}</strong>. The system has automatically generated the Project log, created the Customer Ledger account, drafted the Invoice invoice, and updated all metrics.
            </p>
          </div>

          {statusVal === "Approved" && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 max-w-lg mx-auto text-left relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Prefilled Legal WhatsApp Confirmation</span>
              <p className="text-xs text-slate-600 font-mono leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {generateWhatsAppConfirmation()}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <a
                  id="btn-customer-send-whatsapp"
                  href={getWhatsAppLaunchLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp Confirmation
                </a>
                
                <button
                  id="btn-customer-download-signed-pdf"
                  type="button"
                  onClick={() => exportQuotationToPDF(customer, quotation)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  title="Download the updated quotation with verification stamp"
                >
                  <Download className="w-4 h-4" /> Download Signed PDF
                </button>
              </div>
            </div>
          )}

          <div className="pt-3">
            <button
              id="btn-reset-portal"
              onClick={() => {
                setCompleted(false);
                setStatusVal("");
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Portal Sim
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="client-portal-form">
          {/* Main Quotation summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">SAVI PAINTING CONTRACTORS</h3>
                <p className="text-[11px] text-slate-400 font-medium">Pune Jurisdiction • Licence #95180-293</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="bg-teal-50 px-3 py-1 bg-[#1e293b] rounded-xl text-right border border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-teal-400 block">Quotation No.</span>
                  <span className="text-xs font-mono font-bold text-teal-300" id="portal-q-num">{quotation.quotationNumber}</span>
                </div>
                <button
                  id="btn-portal-download-pdf"
                  type="button"
                  onClick={() => exportQuotationToPDF(customer, quotation)}
                  className="bg-[#0f172a] hover:bg-slate-800 text-slate-300 font-semibold text-[10px] uppercase py-1 px-2.5 rounded border border-slate-700 flex items-center gap-1 transition-all"
                  title="Download offline legal PDF representation"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" /> PDF Contract
                </button>
              </div>
            </div>

            {/* Scope Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Itemized Scope & Pricing</h4>
              <div className="space-y-3 divide-y divide-slate-100/60 max-h-[220px] overflow-y-auto pr-2">
                {quotation.items.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-700">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Category: {item.category} • qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-800 font-mono">₹{item.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50">
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-700" /> Standard Contracting Legal Terms
              </h5>
              <ol className="list-decimal list-inside text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
                {quotation.terms.map((term, idx) => (
                  <li key={idx}>
                    <span className="text-slate-600 font-medium">{term}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sider panel for QR code, Approval signature and Actions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="border-b border-slate-100 pb-4 mb-4 text-center">
                <span className="text-xs text-slate-400 font-bold block mb-1">COMPREHENSIVE FINAL COST</span>
                <span className="text-2xl font-black text-teal-950 font-mono">₹{quotation.finalAmount.toLocaleString("en-IN")}</span>
                <p className="text-[10px] text-slate-400 mt-1">Inclusive of GST, discounts, & paint supplies</p>
              </div>

              {/* QR Code and Quick Share Sim */}
              <div className="bg-slate-50 rounded-xl p-3 flex flex-col items-center border border-slate-100 mb-4 text-center">
                <QrCode className="w-14 h-14 text-slate-800 mb-1.5" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure Approval QR Code</span>
                <p className="text-[9px] text-slate-400">Estimators show this QR on site for instant digital approval</p>
              </div>

              {/* Central Approval Statement Box */}
              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 text-xs space-y-2 mb-4 text-left" id="portal-legal-approval-statement-box">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Dynamic Legal Declaration
                </span>
                <p className="text-slate-700 italic leading-relaxed font-serif">
                  "{settings?.approvalStatement || "I have read and understood the quotation, scope of work, payment terms, material specifications and conditions. I voluntarily approve this quotation."}"
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-100 text-[10px] text-slate-450 font-mono">
                  <span>Signatory: <strong className="text-slate-600 font-bold">{clientSignature || "Pending"}</strong></span>
                  <span>Version: <strong className="text-indigo-600 font-bold">{quotation.quotationNumber}</strong></span>
                  <span>IP Trace: <strong className="text-slate-650">*.12.182.25</strong></span>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Signature (Write Legal Name)
                  </label>
                  <input
                    id="input-portal-signature"
                    type="text"
                    required
                    value={clientSignature}
                    onChange={(e) => setClientSignature(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-bold focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Rajesh Kulkarni"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Add Remarks / Request Changes (Optional)
                  </label>
                  <textarea
                    id="input-portal-remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-600 focus:outline-none focus:border-teal-500 resize-none"
                    placeholder="Enter change request details or any physical conditions..."
                  />
                </div>
              </div>
            </div>

            {/* Digital Contract Action Executions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <button
                id="btn-customer-approve"
                onClick={handleApproveAction}
                className="w-full bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-teal-700/10"
              >
                <Check className="w-4 h-4" /> Sign & Accept Proposal
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-customer-revision"
                  onClick={() => handleRejectOrRevisionAction("Revision Requested")}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold py-2 rounded-lg text-center"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Revision
                </button>
                <button
                  id="btn-customer-reject"
                  onClick={() => handleRejectOrRevisionAction("Rejected")}
                  className="bg-white hover:bg-rose-50 border border-rose-100 hover:border-rose-200 text-rose-600 text-[10px] font-bold py-2 rounded-lg text-center"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
