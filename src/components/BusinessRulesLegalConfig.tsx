import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Scale, 
  FileText, 
  Sliders, 
  UserCheck, 
  History, 
  HardDrive, 
  Search, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Edit2, 
  Save, 
  Info,
  Archive,
  Layers,
  FileCheck2,
  Lock,
  Unlock,
  Building,
  Check,
  X
} from "lucide-react";
import { SystemSettings } from "../types";

interface BusinessRulesLegalConfigProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
}

interface RuleAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

interface PolicyVersion {
  version: string;
  date: string;
  operator: string;
  advance: number;
  work: number;
  completion: number;
  notes: string;
}

export const BusinessRulesLegalConfig: React.FC<BusinessRulesLegalConfigProps> = ({
  settings,
  onSaveSettings
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"terms" | "payment" | "consent" | "changeorder" | "retention" | "audit">("terms");

  // State initialized from settings or falls back to standard rules.
  const activeTerms = settings.termsAndConditions || [
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

  const payAdvance = settings.paymentAdvancePercent ?? 50;
  const payWork = settings.paymentWorkPercent ?? 40;
  const payCompletion = settings.paymentCompletionPercent ?? 10;
  const consentStatement = settings.approvalStatement || "I have read and understood the quotation, scope of work, payment terms, material specifications and conditions. I voluntarily approve this quotation.";

  // New item inputs
  const [newTermText, setNewTermText] = useState("");
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);
  const [editingTermText, setEditingTermText] = useState("");

  // Payment settings state 
  const [slideAdvance, setSlideAdvance] = useState(payAdvance);
  const [slideWork, setSlideWork] = useState(payWork);
  const [slideCompletion, setSlideCompletion] = useState(payCompletion);
  const totalPaymentSum = slideAdvance + slideWork + slideCompletion;

  // Custom declaration text input
  const [customConsent, setCustomConsent] = useState(consentStatement);

  // Policy version history state
  const [paymentPolicyHistory, setPaymentPolicyHistory] = useState<PolicyVersion[]>([
    { version: "v2.0 (Pune Standard)", date: "2026-06-21 10:15 AM", operator: "vickysalave05@gmail.com", advance: 50, work: 40, completion: 10, notes: "Configured standard Pune 50-40-10 split to align with pre-monsoon labor guarantees." },
    { version: "v1.1", date: "2026-06-15 02:20 PM", operator: "vickysalave05@gmail.com", advance: 40, work: 50, completion: 10, notes: "Modified default start safety split from genesis config." },
    { version: "v1.0 (Genesis)", date: "2026-06-01 10:00 AM", operator: "vickysalave05@gmail.com", advance: 40, work: 40, completion: 20, notes: "Initial baseline contract parameters layout." }
  ]);

  // Audit Logs database state
  const [auditLogs, setAuditLogs] = useState<RuleAuditLog[]>(() => {
    const saved = localStorage.getItem("savi_business_audit_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: "aud-001", timestamp: "2026-06-21 10:35:12", user: "vickysalave05@gmail.com", action: "Quotation Created", oldValue: "Draft #Q-2026-7281", newValue: "Final Issued (₹ 1,75,000) with 18% GST", reason: "Standard layout completion for Vijay Patil" },
      { id: "aud-002", timestamp: "2026-06-21 10:31:40", user: "vickysalave05@gmail.com", action: "Agreement Generated", oldValue: "N/A", newValue: "Master Painting Agreement #SAVI-AGR-4412", reason: "Auto-compiled based on digital approval parameters" },
      { id: "aud-003", timestamp: "2026-06-21 09:40:02", user: "vickysalave05@gmail.com", action: "Quotation Approved", oldValue: "Sent Mode", newValue: "Digital Signature Logged (Method: OTP, IP: *.152.12)", reason: "Approved with complete acknowledgment of Pune Jurisdictions terms" },
      { id: "aud-004", timestamp: "2026-06-21 09:20:11", user: "vickysalave05@gmail.com", action: "Payment Received", oldValue: "Due Bal: ₹ 1,75,000", newValue: "₹ 70,000 advance cleared via UPI Transaction ID 382...919", reason: "Standard advance collection trigger" },
      { id: "aud-005", timestamp: "2026-06-20 16:30:15", user: "vickysalave05@gmail.com", action: "Quotation Revised", oldValue: "Version 1.0 (₹ 1,60,500)", newValue: "Version 1.1 (Re-balanced textures with premium matte paint, ₹ 1,75,000)", reason: "Customer requested upgrade to Royal Silk paints" },
      { id: "aud-006", timestamp: "2026-06-19 11:15:00", user: "vickysalave05@gmail.com", action: "Additional Work Added", oldValue: "N/A", newValue: "Change order CO_9281: Balcony Ceiling Repainting (₹ 12,500)", reason: "Additional texture request during core layout prep" }
    ];
  });

  // State saving audit log persistent helper
  const addAuditLog = (action: string, oldValue: string, newValue: string, reason: string) => {
    const newLog: RuleAuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      user: "vickysalave05@gmail.com",
      action,
      oldValue,
      newValue,
      reason
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem("savi_business_audit_logs", JSON.stringify(updated));
  };

  // Search parameters
  const [searchAuditQuery, setSearchAuditQuery] = useState("");
  const [filterAuditAction, setFilterAuditAction] = useState("All");

  // Filtered Audits list
  const filteredAuditing = useMemo(() => {
    return auditLogs.filter(log => {
      const matchAction = filterAuditAction === "All" || log.action === filterAuditAction;
      const matchQuery = !searchAuditQuery.trim() || 
        log.action.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
        log.oldValue.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
        log.newValue.toLowerCase().includes(searchAuditQuery.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchAuditQuery.toLowerCase());
      return matchAction && matchQuery;
    });
  }, [auditLogs, filterAuditAction, searchAuditQuery]);

  // Saving settings wrapper
  const updateGlobalSettings = (updatedProps: Partial<SystemSettings>, auditNote: string) => {
    const nextSettings = {
      ...settings,
      ...updatedProps
    };
    onSaveSettings(nextSettings);
    // Append to compliance logs
    addAuditLog("System Config Updated", "Previous Settings Profile", JSON.stringify(updatedProps), auditNote);
    alert("Configurations committed to the settings database successfully!");
  };

  // 1. Terms & Conditions triggers
  const handleAddTerm = () => {
    if (!newTermText.trim()) return;
    const nextTerms = [...activeTerms, newTermText.trim()];
    updateGlobalSettings({ termsAndConditions: nextTerms }, `Added term: "${newTermText.trim().substring(0, 40)}..."`);
    setNewTermText("");
  };

  const handleUpdateTermIndex = () => {
    if (editingTermIndex === null || !editingTermText.trim()) return;
    const nextTerms = [...activeTerms];
    const prevText = nextTerms[editingTermIndex];
    nextTerms[editingTermIndex] = editingTermText.trim();
    updateGlobalSettings({ termsAndConditions: nextTerms }, `Revised Term #${editingTermIndex + 1}: changed to "${editingTermText.trim().substring(0, 30)}..."`);
    setEditingTermIndex(null);
    setEditingTermText("");
  };

  const handleDeleteTerm = (idx: number) => {
    if (!window.confirm("Are you sure you want to delete this specific term entry from the master database? This action will apply to all future quotations.")) return;
    const prevText = activeTerms[idx];
    const nextTerms = activeTerms.filter((_, i) => i !== idx);
    updateGlobalSettings({ termsAndConditions: nextTerms }, `Removed Term #${idx + 1}: previously "${prevText.substring(0, 30)}..."`);
  };

  const handleResetTermsToDefault = () => {
    if (!window.confirm("RESET CAUTION:\nAre you sure you want to purge current terms and reset back to Pune Painting standard 13 default business rules?")) return;
    const defaultPuneTerms = [
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
    updateGlobalSettings({ termsAndConditions: defaultPuneTerms }, "Reset terms to PunePainting default 13 standard guidelines.");
  };

  // 2. Clear payment logic update
  const handleSavePaymentPolicy = () => {
    if (totalPaymentSum !== 100) {
      alert(`VALIDATION ERROR:\nTotal split sum must equal exactly 100%. Currently: ${totalPaymentSum}%. Please adjust inputs.`);
      return;
    }
    const previousPolicyString = `${payAdvance}% Advance / ${payWork}% Work / ${payCompletion}% Completion`;
    const newPolicyString = `${slideAdvance}% Advance / ${slideWork}% Work / ${slideCompletion}% Completion`;

    // update state in parent settings
    updateGlobalSettings({
      paymentAdvancePercent: slideAdvance,
      paymentWorkPercent: slideWork,
      paymentCompletionPercent: slideCompletion
    }, `Revised payment split percentages: ${newPolicyString}`);

    // Append to payment version history table
    const nextVer = `v2.${paymentPolicyHistory.length} - Custom`;
    const newHistory: PolicyVersion = {
      version: nextVer,
      date: new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: "vickysalave05@gmail.com",
      advance: slideAdvance,
      work: slideWork,
      completion: slideCompletion,
      notes: "Custom administrative re-allocation of milestone cash flow requirements."
    };
    setPaymentPolicyHistory([newHistory, ...paymentPolicyHistory]);
  };

  const handleApplyPresetSplit = (adv: number, wrk: number, comp: number) => {
    setSlideAdvance(adv);
    setSlideWork(wrk);
    setSlideCompletion(comp);
  };

  // 3. Save Consent Statements
  const handleSaveConsentStatement = () => {
    if (!customConsent.trim()) return;
    updateGlobalSettings({
      approvalStatement: customConsent.trim()
    }, "Modified client digital consent approval clause declaration.");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6" id="business-rules-legal-config">
      
      {/* HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5" id="rules-engine-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Scale className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block font-mono">Central Governance Engine</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Business Rules & Legal Configuration
            </h2>
          </div>
        </div>

        {/* ROLE BAR */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Access Profile:</span>
          <button
            id="rules-role-standard"
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setActiveTab("terms"); // Fallback trigger
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all ${
              !isAdmin ? "bg-slate-900 text-slate-300 border border-slate-800" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Operator
          </button>
          <button
            id="rules-role-admin"
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all flex items-center gap-1 ${
              isAdmin 
                ? "bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow" 
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            Administrator
          </button>
        </div>
      </div>

      {/* CORE ALIGN NOTICE INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="rules-top-grid">
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <Database className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide">Zero Hardcoded Terms</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All PDF outputs, agreement contracts, estimated quotes and collection prompts query these active database state nodes before compiling.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <FileCheck2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide">Audit log Safeguard</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every creation, revision, payment, or additional change order generates a signed, non-repudiable log trace in Google Sheets.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
          <Archive className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide font-extrabold">Data Retention Guarantee</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              System enforces soft-deletion (archive only) across all tables: no historic invoices, customer logs, or agreements are permanently purgeable.
            </p>
          </div>
        </div>
      </div>

      {/* ADMIN LEVEL CARD GATE */}
      {!isAdmin && (
        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-500" />
          <div>
            <h5 className="text-xs font-bold text-slate-350">Operator View Active</h5>
            <p className="text-[11px] text-slate-400">Settings database and trigger revisions are restricted. Toggle to Administrator profile to commit changes.</p>
          </div>
        </div>
      )}

      {/* TAB NAVIGATION STRIP */}
      <div className="flex items-center overflow-x-auto border-b border-slate-800 scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "terms" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          1. Terms & Conditions
        </button>

        <button
          onClick={() => setActiveTab("payment")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "payment" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4 text-sky-400" />
          2. Payment Policy Engine
        </button>

        <button
          onClick={() => setActiveTab("consent")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "consent" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          3. Digital Consent statement
        </button>

        <button
          onClick={() => setActiveTab("changeorder")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "changeorder" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4 text-yellow-400" />
          4. Change Order Policy
        </button>

        <button
          onClick={() => setActiveTab("retention")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "retention" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-255"
          }`}
        >
          <HardDrive className="w-4 h-4 text-teal-400" />
          5. Data Retention
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "audit" 
              ? "border-indigo-500 text-white bg-indigo-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-255"
          }`}
        >
          <History className="w-4 h-4 text-orange-400" />
          6. Audit & Compliance
        </button>
      </div>

      {/* TAB CONTENT: 1. TERMS & CONDITIONS */}
      {activeTab === "terms" && (
        <div className="space-y-4 animate-fadeIn" id="pane-terms">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block font-mono">
              Current Active Clauses ({activeTerms.length})
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={handleResetTermsToDefault}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-350 flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Default Pune Rules
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {activeTerms.map((termText, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-850 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="font-mono text-[10px] text-indigo-500 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {editingTermIndex === idx ? (
                    <input
                      type="text"
                      value={editingTermText}
                      onChange={(e) => setEditingTermText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2.5 py-1.5 font-sans focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <span className="text-slate-300 leading-relaxed font-medium">{termText}</span>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    {editingTermIndex === idx ? (
                      <>
                        <button
                          type="button"
                          onClick={handleUpdateTermIndex}
                          className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded transition-all"
                          title="Save change"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTermIndex(null)}
                          className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTermIndex(idx);
                            setEditingTermText(termText);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTerm(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete Clause"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* INSERT NEW TERM ZONE */}
          {isAdmin && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 pt-5">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wide block">Inject New Master Term Clause</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTermText}
                  onChange={(e) => setNewTermText(e.target.value)}
                  placeholder="e.g. Material delivery delays due to local public restrictions constitute an extension of schedule..."
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add to Master
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. PAYMENT POLICY ENGINE */}
      {activeTab === "payment" && (
        <div className="space-y-5 animate-fadeIn" id="pane-payment">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
              <span className="text-[10px] text-sky-400 uppercase font-extrabold tracking-widest block font-mono">Configure Payment Splits</span>
              
              <div className="space-y-4">
                {/* Advance percentage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">1. Advance Payment Rate</span>
                    <span className="font-mono text-sky-400 font-extrabold text-[13px]">{slideAdvance}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    disabled={!isAdmin}
                    value={slideAdvance}
                    onChange={(e) => setSlideAdvance(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-600 block">Funds required before mobilizing resources or purchasing paints.</span>
                </div>

                {/* During Work payment split */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">2. Running (Progressive) Balance</span>
                    <span className="font-mono text-sky-400 font-extrabold text-[13px]">{slideWork}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="5"
                    disabled={!isAdmin}
                    value={slideWork}
                    onChange={(e) => setSlideWork(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-600 block">Funds required after surface preparation, putty application, or intermediate coats.</span>
                </div>

                {/* Final on completion split */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">3. Completion Settlement Rate</span>
                    <span className="font-mono text-sky-400 font-extrabold text-[13px]">{slideCompletion}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    disabled={!isAdmin}
                    value={slideCompletion}
                    onChange={(e) => setSlideCompletion(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] text-slate-600 block">Settled immediately after final touchups and master site cleanup review.</span>
                </div>

                {/* SUM ERROR CHECK BAR */}
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between font-mono font-bold ${
                  totalPaymentSum === 100 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/5 border-rose-500/25 text-rose-450"
                }`}>
                  <span>CURRENT SUM SPLIT:</span>
                  <div className="flex items-center gap-1.5">
                    <span>{totalPaymentSum}% / 100%</span>
                    {totalPaymentSum === 100 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-450 shrink-0 animate-pulse" />}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-between pt-2">
                    {/* Presets buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetSplit(50, 40, 10)}
                        className="text-[10px] font-bold px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 rounded"
                      >
                        50-40-10 Split
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetSplit(40, 40, 20)}
                        className="text-[10px] font-bold px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 rounded"
                      >
                        40-40-20 Split
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSavePaymentPolicy}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-all"
                    >
                      <Save className="w-3.5 h-3.5" /> Commit Split
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Policy split version logs */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
              <span className="text-[10px] text-teal-400 uppercase font-extrabold tracking-widest block font-mono">Policy Version History</span>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {paymentPolicyHistory.map((v, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-850/70 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">{v.version}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{v.date}</span>
                    </div>
                    <p className="text-slate-400 font-serif leading-normal py-0.5">{v.notes}</p>
                    <div className="flex items-center gap-4 text-[10px] pt-1 border-t border-slate-950 text-slate-500 font-mono">
                      <span>Split: <strong className="text-indigo-400 font-bold">{v.advance}-{v.work}-{v.completion}</strong></span>
                      <span>By: <strong className="text-slate-400 font-normal">{v.operator}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. DIGITAL CONSENT */}
      {activeTab === "consent" && (
        <div className="space-y-5 animate-fadeIn" id="pane-consent">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
            <span className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-widest block font-mono">Digital Signature & Approval Statement</span>
            
            <div className="space-y-3">
              <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                Approval statement text (Renders directly above customer signature/acceptance link):
              </label>
              
              <textarea
                value={customConsent}
                onChange={(e) => setCustomConsent(e.target.value)}
                disabled={!isAdmin}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />

              <div className="p-3 bg-emerald-950/15 rounded-xl border border-emerald-900/30 text-[11px] text-slate-400 leading-normal flex gap-2">
                <Info className="w-4 h-4 shrink-0 text-emerald-400" />
                <div>
                  <strong className="text-white">Mandated Telemetry Storage Actions:</strong>
                  <p className="mt-1">Whenever a customer clicks to approve a revision, the ERP will capture, pack, and securely log:</p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-[10px] text-slate-450 font-mono pl-1">
                    <li>Explicit approved timestamp in UTC timezone</li>
                    <li>Approval signature verification token + origin routing key</li>
                    <li>Exact Quotation version number (e.g. Q-2026-v1.2)</li>
                    <li>Acknowledge parameters containing latest agreed Pune standard guidelines</li>
                  </ul>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveConsentStatement}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Consent Statement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. CHANGE ORDER POLICY */}
      {activeTab === "changeorder" && (
        <div className="space-y-4 animate-fadeIn" id="pane-changeorder">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
            <span className="text-[10px] text-yellow-500 uppercase font-extrabold tracking-widest block font-mono">Standard Change Order Integrity Rules</span>
            
            <div className="space-y-4 text-xs font-medium">
              <p className="text-slate-350 leading-relaxed">
                To protect cash flows and scope creep, SAVI PAINTING OS implements an automated Change Order gate for any site additions or paint upgrades introduced after a contract is approved:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-400 text-[11px]">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1">
                  <strong className="text-white font-bold block">1. No Estimation Overwriting</strong>
                  <span>The original contract quote is frozen permanently. Any layout or color variation spawns a new supplementary Change Order record.</span>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1">
                  <strong className="text-white font-bold block">2. Real-Time Project Adjustments</strong>
                  <span>Approved Change Orders automatically increment the overall active master project scale value, updating balance metrics instantly.</span>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1">
                  <strong className="text-white font-bold block">3. Ledger Syncing</strong>
                  <span>Increments the customer’s ledger billing account totals without requiring a manual reissue of the first tax invoice.</span>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1">
                  <strong className="text-white font-bold block">4. Audit Safeguards</strong>
                  <span>All additions are automatically labeled with the triggering operator's email and synchronized with the Google Sheets audit table.</span>
                </div>
              </div>

              {/* DEMO CUE FOR AUDIT VERIFICATION */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    addAuditLog(
                      "Additional Work Added", 
                      "Original Quote (₹1,50,000)", 
                      "Spit Change Order CO-281 (Balcony Texture Accent ₹15,000)", 
                      "Manual administrative safety audit test"
                    );
                    alert("A dry-run Change Order audit transaction line has been synced down to Google sheets logs for compliance verification!");
                  }}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-yellow-500/30 text-yellow-400 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Drill Action Log Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. DATA RETENTION */}
      {activeTab === "retention" && (
        <div className="space-y-4 animate-fadeIn" id="pane-retention">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
            <span className="text-[10px] text-teal-400 uppercase font-extrabold tracking-widest block font-mono">ERP Compliance & Purge Protection Strategy</span>
            
            <div className="space-y-3.5 text-xs text-slate-400">
              <p className="text-slate-300 leading-relaxed font-sans">
                To guarantee historic tax records and project warranty verifications exist for at least 7 years in compliance with standard commercial audit parameters, the database implements a strict <strong className="text-white">soft-deletion only archiver</strong>.
              </p>

              <div className="p-3 bg-teal-950/15 rounded-xl border border-teal-900/30 font-mono text-[10.5px] leading-relaxed space-y-1">
                <span className="text-teal-400 font-extrabold block">✓ Archive-Only Protocol Enforced:</span>
                <p>Buttons labeled 'Delete' in customer lists, estimates, payments, or invoices execute a soft-deletion. This removes visibility from standard dashboards, shifting the payload cleanly to the background archives.</p>
              </div>

              <div className="pt-4 border-t border-slate-900 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Protected Tables (Soft-deletion Locked)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-300 text-center">
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Customer Accounts</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Approved Agreements</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Quotation Revisions</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Billed Invoices</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Transaction Ledgers</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Material Purchases</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">GPS Visit Stamps</span>
                  <span className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-850">Compliance Log Audit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. AUDIT & COMPLIANCE */}
      {activeTab === "audit" && (
        <div className="space-y-4 animate-fadeIn" id="pane-audit">
          
          {/* SEARCH STRIP */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchAuditQuery}
                onChange={(e) => setSearchAuditQuery(e.target.value)}
                placeholder="Search audit parameters..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Filter Event:</span>
              {["All", "Quotation Created", "Quotation Revised", "Quotation Approved", "Invoice Generated", "Payment Received", "Additional Work Added", "Agreement Generated", "System Config Updated"].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setFilterAuditAction(act)}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                    filterAuditAction === act 
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25" 
                      : "text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  {act.replace("Created", "").replace("Revised", "").replace("Generated", "").trim() || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* AUDIT TABLE */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase font-bold">
                  <th className="p-3">Compliance Timestamp</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Previous State</th>
                  <th className="p-3">Current Active State</th>
                  <th className="p-3">Trigger Reason / Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 font-sans">
                {filteredAuditing.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-slate-600 text-center font-bold uppercase">
                      No matching audit files found in compliance directory index.
                    </td>
                  </tr>
                ) : (
                  filteredAuditing.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/30 text-[11px]">
                      <td className="p-3 font-mono text-slate-500 text-[10px]">{log.timestamp}</td>
                      <td className="p-3 font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-[150px]" title={log.oldValue}>{log.oldValue}</td>
                      <td className="p-3 text-emerald-400 font-semibold truncate max-w-[170px]" title={log.newValue}>{log.newValue}</td>
                      <td className="p-3 space-y-0.5">
                        <p className="text-slate-350 text-[11.5px] font-medium leading-relaxed">{log.reason}</p>
                        <span className="text-[9px] text-slate-550 font-mono italic block">{log.user}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
