import React, { useState } from "react";
import { SystemSettings } from "../types";
import { 
  Settings, 
  Building, 
  FileText, 
  Percent, 
  Save, 
  HelpCircle, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Cloud,
  Database,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Check
} from "lucide-react";
import { 
  getSyncSettings, 
  saveSyncSettings, 
  checkGoogleConnection, 
  triggerGoogleBackupArchive,
  SyncSettings 
} from "../utils/googleSync";
import { AppsScriptControlCenter } from "./AppsScriptControlCenter";
import { BusinessRulesLegalConfig } from "./BusinessRulesLegalConfig";

interface SettingsModuleProps {
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  settings,
  onSaveSettings
}) => {
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [gstEnabled, setGstEnabled] = useState(settings.gstEnabled);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [gstStatus, setGstStatus] = useState(settings.gstStatus);
  const [nonGstText, setNonGstText] = useState(settings.nonGstText);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Google Sync States
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(getSyncSettings());
  const [webAppUrl, setWebAppUrl] = useState(syncSettings.webAppUrl);
  const [isTestingSync, setIsTestingSync] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [backupStatus, setBackupStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      alert("Please enter a valid Google Apps Script Web App URL first.");
      return;
    }
    setIsTestingSync(true);
    setTestSuccess(null);
    try {
      const ok = await checkGoogleConnection(webAppUrl.trim());
      setTestSuccess(ok);
      const updated = {
        ...syncSettings,
        webAppUrl: webAppUrl.trim(),
        isConnected: ok
      };
      saveSyncSettings(updated);
      setSyncSettings(updated);
    } catch (e) {
      setTestSuccess(false);
    } finally {
      setIsTestingSync(false);
    }
  };

  const handleTriggerBackup = async () => {
    setIsBackupRunning(true);
    setBackupStatus("idle");
    try {
      const ok = await triggerGoogleBackupArchive();
      setBackupStatus(ok ? "success" : "error");
    } catch (e) {
      setBackupStatus("error");
    } finally {
      setIsBackupRunning(false);
      setTimeout(() => setBackupStatus("idle"), 5000);
    }
  };

  const handleSave = () => {
    setErrorMsg("");
    setSuccess(false);

    if (!businessName.trim()) {
      setErrorMsg("Business name cannot be empty.");
      return;
    }

    if (gstEnabled && !gstNumber.trim()) {
      setErrorMsg("Please enter the GSTIN registration number, or disable GST Mode.");
      return;
    }

    onSaveSettings({
      businessName: businessName.trim(),
      gstEnabled,
      gstNumber: gstEnabled ? gstNumber.trim().toUpperCase() : "",
      gstStatus: gstEnabled ? "GST Registered" : gstStatus,
      nonGstText: nonGstText.trim()
    });

    const updatedSync = {
      ...syncSettings,
      webAppUrl: webAppUrl.trim(),
      // Keep connection state if URL did not change, otherwise set to false (until tested)
      isConnected: webAppUrl.trim() === syncSettings.webAppUrl ? syncSettings.isConnected : false
    };
    saveSyncSettings(updatedSync);
    setSyncSettings(updatedSync);

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleResetToDefaults = () => {
    setBusinessName("SAVI PAINTING & DECOR SERVICES");
    setGstEnabled(false);
    setGstNumber("");
    setGstStatus("GST Not Registered");
    setNonGstText("Supplier Not Registered Under GST");
    setWebAppUrl("");
    const defaultSync = {
      webAppUrl: "",
      isConnected: false,
      lastSyncedAt: null,
      totalSyncedCount: 0
    };
    saveSyncSettings(defaultSync);
    setSyncSettings(defaultSync);
    setErrorMsg("");
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6" id="settings-module">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5" id="settings-header">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">System Preferences</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">GST & Tax Config Module</h2>
          </div>
        </div>
        <button
          id="btn-settings-reset"
          onClick={handleResetToDefaults}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium border border-slate-800 hover:border-rose-400/20 px-3 py-1.5 rounded-xl bg-slate-950"
        >
          Reset to Factory Defaults
        </button>
      </div>

      {/* BODY CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT TWO COLUMNS: EDITABLE SETTINGS */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Section 1: Business Identity */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400" />
              Corporate Business Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Registered Business Name</label>
                <input
                  id="settings-business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
                  placeholder="e.g., SAVI PAINTING & DECOR SERVICES"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Company Status Statement</label>
                <select
                  id="settings-gst-status"
                  value={gstStatus}
                  onChange={(e) => setGstStatus(e.target.value)}
                  disabled={gstEnabled}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-medium disabled:opacity-55"
                >
                  <option value="GST Not Registered">GST Not Registered</option>
                  <option value="GST Registered">GST Registered</option>
                  <option value="Composition Scheme">Composition Scheme (Non-GST)</option>
                  <option value="Exempt Operator">Exempt Operator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: GST Calculations Config */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-teal-400" />
                GST Regulatory System
              </h3>
              
              <button
                id="toggle-gst-mode"
                onClick={() => setGstEnabled(!gstEnabled)}
                className="flex items-center gap-2 group focus:outline-none"
              >
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 group-hover:text-white transition-colors">
                  {gstEnabled ? "GST Mode Enabled" : "GST Mode Disabled (NON-GST)"}
                </span>
                {gstEnabled ? (
                  <ToggleRight className="w-8 h-8 text-teal-400 transition-all scale-110" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-500 transition-all" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When <strong className="text-white">GST Mode is disabled</strong>, the system generates clean <strong className="text-white">Non-GST Invoices and Proposals</strong>. No tax breakdown is computed, and no GSTIN is stamped on files. All estimates and billing flows comply with non-registered small enterprise regulations.
            </p>

            {gstEnabled ? (
              <div className="pt-3 border-t border-slate-800 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-teal-400 uppercase mb-1">Company GSTIN Number *</label>
                    <input
                      id="settings-gst-number"
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-teal-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono font-bold tracking-wide placeholder-slate-600"
                      placeholder="e.g. 27AAAAA1111A1Z1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Implicit GST Fraction Included</label>
                    <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono font-medium">
                      18% Slab (CGST 9% + SGST 9%)
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 text-[10px] text-teal-300 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>In GST Mode, "TAX INVOICE" header details, GSTIN stamp, CGST, SGST, IGST and complete tax breakdown summaries will be rendered in PDF exports and screens instantly.</p>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                <label className="block text-[11px] font-bold text-amber-500 uppercase">Non-GST Compliance Statement (Admin Editable)</label>
                <div className="relative">
                  <input
                    id="settings-nongst-text"
                    type="text"
                    value={nonGstText}
                    onChange={(e) => setNonGstText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 font-medium"
                    placeholder="e.g. Supplier Not Registered Under GST or GST Not Applicable"
                  />
                  <span className="absolute right-3 top-2 text-[9px] font-bold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                    Stamps PDF Summary
                  </span>
                </div>
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-amber-300/90 flex gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>In Non-GST mode, invoice headings are renamed to a clean <strong className="text-white">INVOICE</strong>. No GST breakouts, CGST, or SGST lines will display on screen profiles or offline downloads. The statutory statement selected above is shown instead.</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Google Workspace & Drive Sync Cloud Connector */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4" id="section-google-sync">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400 animate-pulse" />
                Google Workspace & Drive Sync Center
              </h3>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                syncSettings.isConnected ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}>
                {syncSettings.isConnected ? "Cloud Online" : "Disconnected"}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your Savi Painting OS with Google Sheets to unlock full-stack cloud backups, double-entry ledgers, and automated PDF archives in Google Drive folders dynamically.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Google Apps Script Web App URL</label>
                <div className="flex gap-2">
                  <input
                    id="settings-sync-url"
                    type="text"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-sky-500 font-mono font-medium placeholder-slate-700"
                    placeholder="https://script.google.com/macros/s/.../exec"
                  />
                  <button
                    id="btn-test-sync-connection"
                    type="button"
                    disabled={isTestingSync || !webAppUrl.trim()}
                    onClick={handleTestConnection}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 font-extrabold text-xs px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    {isTestingSync ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCw className="w-3.5 h-3.5" />
                    )}
                    Test Key
                  </button>
                </div>
              </div>

              {testSuccess !== null && (
                <div className={`p-2.5 rounded-xl border text-[10px] flex items-center gap-2 font-medium ${
                  testSuccess 
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300" 
                    : "bg-rose-500/5 border-rose-500/10 text-rose-300"
                }`}>
                  {testSuccess ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Connection validated successfully! The master database sheets are bound.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-450 shrink-0" />
                      <span>Verification failed. Please confirm permissions & Apps Script "Anyone" access settings.</span>
                    </>
                  )}
                </div>
              )}

              {/* Deployment Hub Helpers */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 space-y-2.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block">Synchronization Stats</span>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-slate-950/60 border border-slate-800/40 rounded-lg p-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Total Synced Items</span>
                    <strong className="text-sky-400 font-mono font-extrabold">{syncSettings.totalSyncedCount}</strong>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/40 rounded-lg p-2 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Last Sync Time</span>
                    <strong className="text-slate-300 font-mono font-medium">{syncSettings.lastSyncedAt || "N/A"}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-slate-500 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" /> Master sheets synced automatically
                  </span>
                  
                  <button
                    id="btn-trigger-backup"
                    type="button"
                    disabled={isBackupRunning || !syncSettings.isConnected}
                    onClick={handleTriggerBackup}
                    className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-905 text-slate-400 hover:text-white transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {isBackupRunning ? (
                      <RotateCw className="w-3 h-3 animate-spin text-sky-400" />
                    ) : (
                      <Database className="w-3 h-3 text-sky-400" />
                    )}
                    Snapshot Backup
                  </button>
                </div>

                {backupStatus !== "idle" && (
                  <p className={`text-[9px] font-bold text-right pt-0.5 ${
                    backupStatus === "success" ? "text-emerald-400" : "text-rose-450"
                  }`}>
                    {backupStatus === "success" ? "✓ Backup copied inside Google Drive 'System Backups Archive'" : "✕ Backup triggered API error."}
                  </p>
                )}
              </div>

              {/* Quick instructions drawer link */}
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-400 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-teal-400 font-bold">
                  <span>How to deploy your Apps Script Code:</span>
                  <a 
                    href="https://docs.google.com/spreadsheets/d/17NEY7WAN1uYx2GIcsyPuX-MMBoXHJpUbanJ-FHq9EsM/edit" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[9px] uppercase hover:underline text-teal-400/90"
                  >
                    Open Master Spreadsheet <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal pl-3.5 space-y-0.5 text-[9px] leading-relaxed">
                  <li>Copy the code in <code className="text-white bg-slate-950 px-1 py-0.5 rounded font-mono">google-apps-script.gs</code> from the workspace root.</li>
                  <li>In your Google Sheet, click <strong className="text-slate-300">Extensions &gt; Apps Script</strong>.</li>
                  <li>Paste the code, Save as <strong className="text-slate-300">Savi OS Sync Controller</strong>, then click <strong className="text-slate-300">Deploy &gt; New Deployment</strong>.</li>
                  <li>Set type as <strong className="text-slate-300">Web App</strong>, Execute as <strong className="text-slate-300">Me</strong>, and Who has access as <strong className="text-slate-300">Anyone</strong>.</li>
                  <li>Copy Web App URL (ending in <code className="text-teal-400">/exec</code>) and paste above, then click <strong className="text-slate-300">Test Key</strong>!</li>
                </ol>
              </div>
            </div>
          </div>


          {/* Action Row */}
          <div className="flex gap-3 justify-end items-center">
            {errorMsg && (
              <span className="text-[11px] text-rose-450 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
              </span>
            )}
            {success && (
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> System configured successfully!
              </span>
            )}
            <button
              id="btn-settings-save"
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs py-2 px-5 rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Save className="w-4 h-4" /> Save Configuration Settings
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: TAX SLAB PREVIEW CARD */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Dynamic Live Invoice Preview
            </h3>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3 font-mono text-[10px] text-slate-400 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-extrabold text-white text-xs">
                  {gstEnabled ? "TAX INVOICE" : "INVOICE"}
                </span>
                <span className="text-slate-500">SAVI/2026/001</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>To: APEX RETAIL PUNE</span>
                  <span>Date: 21-Jun-2026</span>
                </div>
                <div className="text-slate-500">
                  Provider: {businessName || "Savi Painting Services Ltd."}
                </div>
                {gstEnabled ? (
                  <div className="text-teal-400 uppercase font-bold text-[9px] tracking-wide">
                    GSTIN: {gstNumber || "ENTER GST REGISTRATION NO."}
                  </div>
                ) : (
                  <div className="text-amber-500 uppercase font-bold text-[9px] tracking-wide">
                    STATUS: {gstStatus}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-2 space-y-1">
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Item / Scope</span>
                  <span>Amount (₹)</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>1. Premium Royal Silk Polish (1,500 Sq.Ft)</span>
                  <span>₹1,20,000</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2 space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Gross Subtotal:</span>
                  <span className="text-slate-200">₹1,20,000</span>
                </div>

                {gstEnabled ? (
                  <>
                    <div className="flex justify-between text-teal-500">
                      <span>CGST (9.0%):</span>
                      <span>₹10,800</span>
                    </div>
                    <div className="flex justify-between text-teal-500">
                      <span>SGST (9.0%):</span>
                      <span>₹10,800</span>
                    </div>
                    <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1">
                      <span>Consolidated Total:</span>
                      <span>₹141,600</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-500 italic">
                      <span>GST Component:</span>
                      <span>₹0 (Nil)</span>
                    </div>
                    <div className="text-left text-amber-500 italic font-sans text-[8px] py-0.5 tracking-normal">
                      *{nonGstText || "Supplier Not Registered Under GST"}
                    </div>
                    <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1">
                      <span>Billed Amount:</span>
                      <span>₹1,20,000</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/30 text-[9px] text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">💡 Pro-Tip for Operators:</p>
            You can toggle back and forth between GST and Non-GST invoice systems. Existing proposals are preserved, and future ones adapt automatically to the compliant header format inside PDF and digital screen portals.
          </div>
        </div>
      </div>

      {/* BUSINESS RULES & LEGAL CONFIGURATION PANEL */}
      <div className="border-t border-slate-800 pt-6 mt-6" id="business-rules-legal-config-panel">
        <BusinessRulesLegalConfig settings={settings} onSaveSettings={onSaveSettings} />
      </div>

      {/* APPS SCRIPT CONTROL CENTER HUB */}
      <div className="border-t border-slate-800 pt-6 mt-6" id="apps-script-control-center-panel">
        <AppsScriptControlCenter />
      </div>
    </div>
  );
};
