import React, { useState, useMemo } from "react";
import { 
  Server, 
  Activity, 
  FileCode, 
  Clock, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  RefreshCw, 
  History, 
  HardDrive, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Settings,
  Sliders,
  Check,
  X,
  Play,
  Cloud
} from "lucide-react";
import { getSyncSettings } from "../utils/googleSync";

interface LogEntry {
  id: string;
  timestamp: string;
  functionName: string;
  type: "success" | "warning" | "error" | "execution";
  result: string;
}

interface ScriptTrigger {
  id: string;
  name: string;
  description: string;
  status: "enabled" | "disabled";
  lastRun: string;
  nextRun: string;
  frequency: string;
}

interface DeploymentVersion {
  version: string;
  deploymentId: string;
  date: string;
  createdBy: string;
  notes: string;
  status: "active" | "archived";
}

interface ScriptBackup {
  version: string;
  backupDate: string;
  notes: string;
  driveFolder: string;
  fileSize: string;
}

export const AppsScriptControlCenter: React.FC = () => {
  // Authentication Role Simulation: Admin vs. Standard Operator
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  
  // Tab-based navigation
  const [activeTab, setActiveTab] = useState<"config" | "health" | "triggers" | "logs" | "versions" | "backups">("config");

  // Sync Settings Hook
  const syncSettings = getSyncSettings();

  // Dynamic States
  const [projectSettings, setProjectSettings] = useState({
    projectName: "Savi Painting OS Database Controller",
    projectId: "savi-painting-os-db-controller",
    deploymentId: "AKfycbx6-8F_Z_Z_4LgYg6W9sP1fA_7uB9C0dE-fGhIjK12",
    webAppUrl: syncSettings.webAppUrl || "https://script.google.com/macros/s/AKfycbx6-8F_Z_Z_4LgYg6W9sP1fA_7uB9C0dE-fGhIjK12/exec",
    version: "3.4.2",
    lastUpdated: "2026-06-21 09:30 AM",
    lastDeploymentDate: "2026-06-21 09:12 AM"
  });

  // Edit config settings in sheets simulation tracker
  const [dbChangeHistory, setDbChangeHistory] = useState([
    { timestamp: "2026-06-21 09:12:00", field: "Version Update", oldVal: "3.4.1", newVal: "3.4.2", operator: "vickysalave05@gmail.com" },
    { timestamp: "2026-06-20 18:05:22", field: "Deployment ID", oldVal: "AKfycbz1-old-test-id", newVal: "AKfycbx6-8F_Z_Z_4LgYg6W9sP1fA_7uB9C0dE-fGhIjK12", operator: "vickysalave05@gmail.com" },
    { timestamp: "2026-06-18 11:24:10", field: "Project Name", oldVal: "Savi DB Engine v3", newVal: "Savi Painting OS Database Controller", operator: "vickysalave05@gmail.com" }
  ]);

  // Script Trigger Management State
  const [triggers, setTriggers] = useState<ScriptTrigger[]>([
    {
      id: "trig-backup",
      name: "Daily Backup Trigger",
      description: "Automated snapshot backup of all tables copied to Google Drive Systems folder.",
      status: "enabled",
      lastRun: "2026-06-21 04:00 AM",
      nextRun: "2026-06-22 04:00 AM",
      frequency: "Everyday at 04:00 AM"
    },
    {
      id: "trig-followup",
      name: "Automatic Lead Follow-up Engine",
      description: "Checks pending estimates of cold prospects, creating reminders and automated message workflows.",
      status: "enabled",
      lastRun: "2026-06-21 08:30 AM",
      nextRun: "2026-06-22 08:30 AM",
      frequency: "Daily morning sequence"
    },
    {
      id: "trig-reminders",
      name: "Customer Invoice Overdue Prompter",
      description: "Runs daily checklist of invoices that are within 3 days of due date, sending prompter cues.",
      status: "disabled",
      lastRun: "2026-06-20 09:00 AM",
      nextRun: "Manual Trigger Mode Only",
      frequency: "Everyday at 09:00 AM"
    },
    {
      id: "trig-reports",
      name: "Weekly Margin Report Compiler",
      description: "Compiles weekly balance sheet sheets metrics and sends automated summary to stakeholders.",
      status: "enabled",
      lastRun: "2026-06-15 00:05 AM",
      nextRun: "2026-06-22 00:05 AM",
      frequency: "Mondays at Midnight"
    },
    {
      id: "trig-automation",
      name: "WhatsApp API Queue Dispatcher",
      description: "Checks the local WhatsApp message outgoing queue, batch syncing and triggering external gateways.",
      status: "enabled",
      lastRun: "2026-06-21 10:45 AM",
      nextRun: "2026-06-21 11:00 AM",
      frequency: "Every 15 minutes"
    }
  ]);

  // Log level filtering states
  const [logTypeFilter, setLogTypeFilter] = useState<"all" | "success" | "warning" | "error" | "execution">("all");
  const [logSearchQuery, setLogSearchQuery] = useState("");

  // Raw mock execution logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "log-001", timestamp: "22-06-21 10:45:12", functionName: "doPost:syncRecord", type: "success", result: "Successfully synced Lead L-4819 inside Google Sheet Leads tab." },
    { id: "log-002", timestamp: "22-06-21 10:45:10", functionName: "doPost:syncRecord", type: "success", result: "Appended Customer C-4819 (Vijay Patil) cleanly inside Customers tab." },
    { id: "log-003", timestamp: "22-06-21 10:40:02", functionName: "handleDocumentUploadAndTrack", type: "success", result: "Successfully generated and uploaded 'SAVI_Est_ விஜய_Patil.pdf' to Drive folder ID 1nLLHXy... Link indexed." },
    { id: "log-004", timestamp: "22-06-21 10:30:15", functionName: "doGet:getReports", type: "execution", result: "Reporting engine metrics queried. Computed Revenue: ₹14,20,500, Expenses: ₹4,15,000, margin: 71%." },
    { id: "log-005", timestamp: "22-06-21 10:00:25", functionName: "dispatchWhatsAppQueue", type: "warning", result: "API Delay on primary gateway. Retrying dispatch cue for receipt number SAVI-PAY-8219. Sent successful on Retry-1." },
    { id: "log-006", timestamp: "22-06-21 09:30:11", functionName: "doPost:syncRecord", type: "success", result: "Updated payment transaction PAY-1829. Recalculated invoice status to PAID." },
    { id: "log-007", timestamp: "22-06-21 09:24:55", functionName: "verifyDatabaseSync", type: "error", result: "Network connection timeout during Google Apps script callback endpoint initialization. Sync skipped, cached in storage." },
    { id: "log-008", timestamp: "22-06-21 09:12:05", functionName: "triggerSystemBackup", type: "success", result: "System Backup Successful. SAVI_PaintingOS_Backup_2026-06-21 copied to System Backups Archive in Google Drive." },
    { id: "log-009", timestamp: "22-06-21 08:30:00", functionName: "dailyLeadFollowupEngine", type: "execution", result: "Automation suite ran. 4 cold inquiries analyzed, WhatsApp notification payloads generated and queued." },
    { id: "log-010", timestamp: "22-06-21 04:00:10", functionName: "doPost:triggerBackup", type: "success", result: "Daily scheduled batch backup completed. Created file copy inside Drive. Total tables synced 13." }
  ]);

  // Deployment Version Database Storage
  const [deploymentVersions, setDeploymentVersions] = useState<DeploymentVersion[]>([
    {
      version: "3.4.2",
      deploymentId: "AKfycbx6-8F_Z_Z_4LgYg6W9sP1fA_7uB9C0dE-fGhIjK12",
      date: "2026-06-21 09:12 AM",
      createdBy: "vickysalave05@gmail.com",
      notes: "Bugfix in handleDocumentUpload to support spaces inside Telugu/Marathi customer names on Google Drive subfolders compilation.",
      status: "active"
    },
    {
      version: "3.4.1",
      deploymentId: "AKfycbz1-old-test-id-8yH9a1s28-D",
      date: "2026-06-18 11:24 AM",
      createdBy: "vickysalave05@gmail.com",
      notes: "First release of dynamic SiteVisit tracking with full Google Maps API coordinate indexing and GPS location reverse routing.",
      status: "archived"
    },
    {
      version: "3.3.0",
      deploymentId: "AKfycby8-old-stable-deployment-99",
      date: "2026-06-12 04:15 PM",
      createdBy: "vickysalave05@gmail.com",
      notes: "Stable update implementing double-entry audit logging triggers. Added automatic sheet table insertions if missing on setup.",
      status: "archived"
    },
    {
      version: "3.0.0",
      deploymentId: "AKfycbw0-genesis-deploy-77aB9q1",
      date: "2026-06-01 10:00 AM",
      createdBy: "vickysalave05@gmail.com",
      notes: "Initial release of Savi Painting master database engine. Configured Google Sheets master bindings & 13 major telemetry tables.",
      status: "archived"
    }
  ]);

  // Script Backups Storage Archive State 
  const [backups, setBackups] = useState<ScriptBackup[]>([
    { version: "3.4.2", backupDate: "2026-06-21 09:16 AM", notes: "Pre-deployment stable freeze. Auto-archived before live push.", driveFolder: "System Backups Archive", fileSize: "128 KB" },
    { version: "3.4.1", backupDate: "2026-06-18 11:30 AM", notes: "Regular daily automated sheet backup.", driveFolder: "System Backups Archive", fileSize: "125 KB" },
    { version: "3.3.0", backupDate: "2026-06-12 04:30 PM", notes: "Pre-deployment stable backup containing Audit logs updates.", driveFolder: "System Backups Archive", fileSize: "119 KB" },
    { version: "3.0.0", backupDate: "2026-06-01 10:15 AM", notes: "Genesis codebase freeze.", driveFolder: "System Backups Archive", fileSize: "92 KB" }
  ]);

  // Action states
  const [isLoading, setIsLoading] = useState(false);
  const [newVersionNotes, setNewVersionNotes] = useState("");
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [newDeploymentId, setNewDeploymentId] = useState("");
  const [newVersionNum, setNewVersionNum] = useState("");

  // Helper counters
  const errorsCount = useMemo(() => logs.filter(l => l.type === "error").length, [logs]);
  const warningCount = useMemo(() => logs.filter(l => l.type === "warning").length, [logs]);

  // Handle trigger toggle 
  const handleToggleTrigger = (id: string) => {
    if (!isAdmin) return;
    setTriggers(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "enabled" ? "disabled" as const : "enabled" as const;
        // Append a warning / success log trace
        const traceLog: LogEntry = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().slice(2, 19).replace("T", " "),
          functionName: "updateTriggerStatus",
          type: "warning",
          result: `System Master Trigger '${t.name}' was manually toggled to ${nextStatus.toUpperCase()} by Administrator.`
        };
        setLogs(prevLogs => [traceLog, ...prevLogs]);
        return { ...t, status: nextStatus, nextRun: nextStatus === "disabled" ? "Manual Trigger Mode Only" : "Daily automated cue" };
      }
      return t;
    }));
  };

  // Run trigger instantly
  const handleRunTriggerInstantly = (name: string) => {
    if (!isAdmin) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const traceLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().slice(2, 19).replace("T", " "),
        functionName: "manualTriggerExecute",
        type: "success",
        result: `Manually executed batch trigger '${name}' successfully. Master sheets synchronicity validated in 85ms.`
      };
      setLogs(prevLogs => [traceLog, ...prevLogs]);
      alert(`Manual override success: '${name}' executed immediately, logs recorded.`);
    }, 1200);
  };

  // Add new version deployment manually
  const handleNewDeploymentSubmit = () => {
    if (!newDeploymentId.trim() || !newVersionNum.trim()) {
      alert("Please fill in the Deployment ID and the Version Number.");
      return;
    }
    
    // De-activate old active versions
    const updatedVersions = deploymentVersions.map(v => ({ ...v, status: "archived" as const }));
    
    const newVer: DeploymentVersion = {
      version: newVersionNum.trim(),
      deploymentId: newDeploymentId.trim(),
      date: new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: "vickysalave05@gmail.com",
      notes: newVersionNotes.trim() || "Manual configuration deploy push.",
      status: "active"
    };

    setDeploymentVersions([newVer, ...updatedVersions]);
    
    // Update live configuration state
    setProjectSettings(prev => ({
      ...prev,
      version: newVersionNum.trim(),
      deploymentId: newDeploymentId.trim(),
      lastUpdated: new Date().toLocaleString(),
      lastDeploymentDate: new Date().toLocaleString()
    }));

    // Record change history database
    const historyEntry = {
      timestamp: new Date().toLocaleString(),
      field: "Version Deploy",
      oldVal: projectSettings.version,
      newVal: newVersionNum.trim(),
      operator: "vickysalave05@gmail.com"
    };

    setDbChangeHistory([historyEntry, ...dbChangeHistory]);

    // Record Success log index
    const traceLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(2, 19).replace("T", " "),
      functionName: "deployNewVersion",
      type: "success",
      result: `Successfully registered new deployment version v${newVersionNum.trim()} with Deployment ID ${newDeploymentId.trim().slice(0, 12)}...`
    };
    setLogs(prev => [traceLog, ...prev]);

    // Trigger backup copy automatically
    const autoBackup: ScriptBackup = {
      version: newVersionNum.trim(),
      backupDate: new Date().toLocaleString(),
      notes: `Automatic pre-install freeze snapshot for version ${newVersionNum.trim()}`,
      driveFolder: "System Backups Archive",
      fileSize: "131 KB"
    };
    setBackups(prev => [autoBackup, ...prev]);

    setShowDeploymentModal(false);
    setNewDeploymentId("");
    setNewVersionNum("");
    setNewVersionNotes("");
    alert("New Deployment and Version successfully bound to Savi Painting OS!");
  };

  // Rollback to specific version trigger 
  const handleRollbackVersion = (ver: DeploymentVersion) => {
    if (!isAdmin) return;
    const confirmRoll = window.confirm(`Rollback Warning:\nAre you sure you want to rollback back from active version ${projectSettings.version} to version ${ver.version}?\nThis will update API pointers.`);
    if (!confirmRoll) return;

    // Set new active status
    setDeploymentVersions(prev => prev.map(v => {
      if (v.version === ver.version) return { ...v, status: "active" as const };
      return { ...v, status: "archived" as const };
    }));

    setProjectSettings(prev => ({
      ...prev,
      version: ver.version,
      deploymentId: ver.deploymentId,
      lastUpdated: new Date().toLocaleString()
    }));

    // Record history
    const historyEntry = {
      timestamp: new Date().toLocaleString(),
      field: "Rollback",
      oldVal: projectSettings.version,
      newVal: ver.version,
      operator: "vickysalave05@gmail.com"
    };
    setDbChangeHistory([historyEntry, ...dbChangeHistory]);

    const traceLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().slice(2, 19).replace("T", " "),
      functionName: "rollbackEngine",
      type: "warning",
      result: `Admin triggered API state rollback to backup configuration: deployed active pointer: v${ver.version}.`
    };
    setLogs(prev => [traceLog, ...prev]);
    alert(`Successfully rolled back active pointer reference to v${ver.version}.`);
  };

  // Filtered Logs matching search or level
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const typeMatches = logTypeFilter === "all" || log.type === logTypeFilter;
      const textMatches = !logSearchQuery.trim() || 
        log.functionName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.result.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.timestamp.includes(logSearchQuery);
      return typeMatches && textMatches;
    });
  }, [logs, logTypeFilter, logSearchQuery]);

  // Clear logs terminal manually
  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to purge recent system logs terminal?")) {
      setLogs([]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6" id="apps-script-control-center">
      
      {/* HEADER WITH ADMINISTRATIVE SIGNATURE AND ROLE OVERRIDE GATE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5" id="control-center-headline">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">Google Cloud Integration</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Apps Script Control Center
            </h2>
          </div>
        </div>

        {/* ROLE SIMULATOR TO SATISFY "ONLY ADMIN ACCESS" */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Access Profile:</span>
          <button
            id="role-standard-opt"
            type="button"
            onClick={() => {
              setIsAdmin(false);
              setActiveTab("config"); // Safe fallback
            }}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all ${
              !isAdmin ? "bg-slate-900 text-slate-300 border border-slate-800" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            Operator
          </button>
          <button
            id="role-admin-opt"
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all flex items-center gap-1 ${
              isAdmin 
                ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow" 
                : "text-slate-500 hover:text-slate-400"
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            Administrator
          </button>
        </div>
      </div>

      {/* HEALTH CARDS GRID (SYSTEM HEALTH MONITOR) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" id="health-monitor-grid">
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 hover:text-slate-400 block uppercase font-bold tracking-wider">System Status</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <strong className="text-emerald-400 font-extrabold font-mono text-[11px]" id="status-api">ONLINE</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Sheets DB</span>
          <div className="flex items-center gap-1.5 mt-2">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <strong className="text-emerald-400 font-extrabold font-mono text-[11px]">ACTIVE</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Drive Folder</span>
          <div className="flex items-center gap-1.5 mt-2">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <strong className="text-emerald-400 font-extrabold font-mono text-[11px]">CONNECTED</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">API Sync Gateway</span>
          <div className="flex items-center gap-1.5 mt-2">
            <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <strong className="text-emerald-400 font-extrabold font-mono text-[11px]">STABLE</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">PDF Compiles</span>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <strong className="text-sky-300 font-extrabold font-mono text-[11px]">ONLINE</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">WhatsApp Dispatch</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <strong className="text-amber-400 font-extrabold font-mono text-[11px]">RATE_LIMIT</strong>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-extrabold">Total Errors</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-450 font-mono font-black text-[10px]">
              {errorsCount}
            </span>
            <span className="text-[9px] text-slate-550 font-medium">Recorded</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between text-xs min-h-[75px]">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Backup Engine</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <strong className="text-emerald-400 font-extrabold font-mono text-[11px]">IDLE_OK</strong>
          </div>
        </div>
      </div>

      {/* ADMIN-ONLY SECURITY GATE NOTICE / ACCESS CONTROL */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-fadeIn">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <div className="space-y-1 flex-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-200">System Operator Notice - Administrative Privileges Required</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              You are currently logged in as a standard workspace Operator. Script trigger controls, version rollbacks, logs terminals, and DB setting schema backups are locked out for safety. Toggle to **Administrator** role above to inspect.
            </p>
          </div>
          <button
            type="button"
            id="role-promote-opt"
            onClick={() => setIsAdmin(true)}
            className="text-[11px] font-extrabold px-4 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white rounded-xl transition-all"
          >
            Promote to Admin 
          </button>
        </div>
      )}

      {/* DASHBOARD TAB CONTROLLER BAR - LOCKED PERMISSIONS FOR NON-ADMINS */}
      <div className="flex items-center overflow-x-auto border-b border-slate-800 scrollbar-none pb-0.5">
        <button
          id="btn-tab-config"
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "config" 
              ? "border-sky-500 text-white bg-sky-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileCode className="w-4 h-4 text-sky-400" />
          Script Configuration
        </button>

        <button
          id="btn-tab-triggers"
          onClick={() => {
            if (isAdmin) {
              setActiveTab("triggers");
            } else {
              alert("Admin only access: Trigger schedules cannot be viewed under Operator Mode.");
            }
          }}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "triggers" 
              ? "border-sky-500 text-white bg-sky-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-250"
          } ${!isAdmin ? "opacity-45 pointer-events-none" : ""}`}
        >
          <Clock className="w-4 h-4 text-yellow-400" />
          Trigger Schedules
        </button>

        <button
          id="btn-tab-logs"
          onClick={() => {
            if (isAdmin) {
              setActiveTab("logs");
            } else {
              alert("Admin only access: Execution system logs contains private transaction payloads. Access Denied.");
            }
          }}
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "logs" 
              ? "border-sky-500 text-white bg-sky-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-250"
          } ${!isAdmin ? "opacity-45 pointer-events-none" : ""}`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          Execution Log Terminal
        </button>

        <button
          id="btn-tab-versions"
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "versions" 
              ? "border-sky-500 text-white bg-sky-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-250"
          } ${!isAdmin ? "opacity-45 pointer-events-none" : ""}`}
          onClick={() => isAdmin ? setActiveTab("versions") : alert("Admin privileges required for version matrix configuration.")}
        >
          <History className="w-4 h-4 text-teal-400" />
          Deployment History
        </button>

        <button
          id="btn-tab-backups"
          className={`px-4 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "backups" 
              ? "border-sky-500 text-white bg-sky-500/5" 
              : "border-transparent text-slate-400 hover:text-slate-250"
          } ${!isAdmin ? "opacity-45 pointer-events-none" : ""}`}
          onClick={() => isAdmin ? setActiveTab("backups") : alert("Admin privileges required.")}
        >
          <Sliders className="w-4 h-4 text-indigo-400" />
          Drive script Backups
        </button>
      </div>

      {/* TAB CONTENT: 1. CONFIGURATION VIEW */}
      {activeTab === "config" && (
        <div className="space-y-5 animate-fadeIn" id="pane-config">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Master Credentials (Display Only) */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-[10px] text-sky-400 uppercase font-extrabold tracking-widest block">Script Configuration Panel</span>
              <div className="space-y-3.5">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Apps Script Project Name</span>
                  <div className="bg-slate-900 px-3 py-2 rounded-xl text-xs text-slate-200 border border-slate-800 font-sans font-semibold">
                    {projectSettings.projectName}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Apps Script Project ID</span>
                  <div className="bg-slate-900 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 border border-slate-800 font-mono">
                    {projectSettings.projectId}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Deployment ID (Active Pointer Key)</span>
                  <div className="bg-slate-900 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 border border-slate-800 font-mono select-all">
                    {projectSettings.deploymentId}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Current Version</span>
                    <span className="bg-slate-900 px-3 py-1.5 rounded-xl text-slate-300 border border-slate-800 block font-mono font-bold text-center">
                      v{projectSettings.version}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Last Deployment date</span>
                    <span className="bg-slate-900 px-3 py-1.5 rounded-xl text-slate-400 border border-slate-800 block text-[10px] font-medium text-center">
                      {projectSettings.lastDeploymentDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoint & Safety parameters */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-[10px] text-emerald-400 uppercase font-extrabold tracking-widest block">Live Connections Pointer</span>
              
              <div className="space-y-3.5">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Active Web App Endpoint</span>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-emerald-300 break-all leading-relaxed select-all">
                    {projectSettings.webAppUrl}
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-900/40 text-[10px] text-slate-400 leading-relaxed flex gap-2">
                  <span className="text-indigo-400 shrink-0 select-none">🔒</span>
                  <p>
                    <strong className="text-white">Safety Restrict Enforcement</strong>: Direct source code modifiers are locked out from the client ERP to prevent script corruption and master security key loss. Any logical additions must be executed inside Google Apps Script Web editor, compiling is executed during standard releases.
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex justify-end pt-1">
                    <button
                      id="btn-register-deploy-dialog"
                      type="button"
                      onClick={() => setShowDeploymentModal(true)}
                      className="text-[11px] font-extrabold text-white bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
                    >
                      <Layers className="w-3.5 h-3.5" /> Direct Version Upgrade
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change history records (System settings table inside google sheets) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">System Settings Database Logs (Stored in Google Sheet 'AuditLogs')</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase font-bold">
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Configuration Field</th>
                    <th className="pb-2">Old Settings</th>
                    <th className="pb-2">New Settings</th>
                    <th className="pb-2">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {dbChangeHistory.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-900/30">
                      <td className="py-2.5 font-mono text-[10px] text-slate-400">{h.timestamp}</td>
                      <td className="py-2.5 font-bold text-slate-300">{h.field}</td>
                      <td className="py-2.5 font-mono text-[10px] text-slate-500 break-all max-w-[120px] truncate">{h.oldVal}</td>
                      <td className="py-2.5 font-mono text-[10px] text-teal-400 break-all max-w-[120px] truncate">{h.newVal}</td>
                      <td className="py-2.5 text-slate-400 text-[10px]">{h.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. SCRIPT TRIGGERS */}
      {activeTab === "triggers" && isAdmin && (
        <div className="space-y-4 animate-fadeIn" id="pane-triggers">
          <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 text-[11px] text-yellow-300/90 leading-relaxed flex gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <p>
              These trigger nodes are registered within Google Apps Script as Time-Driven Event handlers. Toggling a trigger here updates the database control configurations. Ensure the background script has active polling enabled to process event indicators.
            </p>
          </div>

          <div className="space-y-3">
            {triggers.map((t) => (
              <div 
                key={t.id} 
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">{t.name}</h4>
                    <span className="text-[10px] text-slate-550 font-medium font-mono">({t.frequency})</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t.description}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 pt-1.5 text-[10px]">
                    <span className="text-slate-500">Last Run: <strong className="text-slate-300 font-mono font-medium">{t.lastRun}</strong></span>
                    <span className="text-slate-500">Next Run: <strong className="text-sky-400 font-mono font-extrabold">{t.nextRun}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRunTriggerInstantly(t.name)}
                    className="text-[10px] font-extrabold px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 text-slate-300 border border-slate-800 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3 h-3 text-sky-450 fill-sky-450 shrink-0" /> Execute Call
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleTrigger(t.id)}
                    className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                      t.status === "enabled"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/80"
                    }`}
                  >
                    {t.status === "enabled" ? "✓ Trigger Active" : "✕ Suspended"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. EXECUTION LOG TERMINAL */}
      {activeTab === "logs" && isAdmin && (
        <div className="space-y-4 animate-fadeIn" id="pane-logs">
          
          {/* SEARCH & FILTER STRIP */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="logs-search"
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search function or output..."
                className="w-full bg-slate-900 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 shrink-0">Filter:</span>
              <button
                type="button"
                onClick={() => setLogTypeFilter("all")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                  logTypeFilter === "all" ? "bg-slate-900 text-white border-slate-700" : "text-slate-500 border-transparent hover:text-slate-350"
                }`}
              >
                All Events
              </button>
              <button
                type="button"
                onClick={() => setLogTypeFilter("success")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 flex items-center gap-1 ${
                  logTypeFilter === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "text-slate-550 border-transparent hover:text-slate-350"
                }`}
              >
                <Check className="w-3 h-3" /> Success
              </button>
              <button
                type="button"
                onClick={() => setLogTypeFilter("warning")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 flex items-center gap-1 ${
                  logTypeFilter === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "text-slate-550 border-transparent hover:text-slate-350"
                }`}
              >
                <AlertTriangle className="w-3 h-3" /> Warn
              </button>
              <button
                type="button"
                onClick={() => setLogTypeFilter("error")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 flex items-center gap-1 ${
                  logTypeFilter === "error" ? "bg-rose-500/10 text-rose-450 border-rose-500/20" : "text-slate-550 border-transparent hover:text-slate-350"
                }`}
              >
                <X className="w-3 h-3" /> Errors
              </button>

              <div className="w-px h-5 bg-slate-800 mx-1 shrink-0"></div>

              <button
                type="button"
                id="btn-purge-logs"
                onClick={handleClearLogs}
                className="text-[10px] font-extrabold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 px-2 py-1 rounded transition-all shrink-0"
              >
                Clear Log Terminal
              </button>
            </div>
          </div>

          {/* CODE / SHELL STYLE LOG WINDOW */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 font-mono text-[11px] leading-relaxed max-h-[350px] overflow-y-auto space-y-2 select-text shadow-inner">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-650 py-10 text-center uppercase font-bold text-xs">
                No telemetry event lines matching current workspace filter indices.
              </div>
            ) : (
              filteredLogs.map((l) => (
                <div key={l.id} className="flex gap-2.5 hover:bg-slate-900/40 p-1.5 rounded-lg border border-transparent hover:border-slate-900 transition-all">
                  <span className="text-slate-600 shrink-0 select-none">[{l.timestamp}]</span>
                  <span className={`font-bold shrink-0 select-none uppercase tracking-wider text-[9px] px-1 rounded-sm ${
                    l.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
                    l.type === "error" ? "bg-rose-500/10 text-rose-400 animate-pulse" :
                    l.type === "warning" ? "bg-amber-500/10 text-amber-400" :
                    "bg-slate-850 text-slate-400"
                  }`}>
                    {l.type}
                  </span>
                  <span className="text-indigo-400 shrink-0 font-bold font-mono">{l.functionName}()</span>
                  <span className="text-slate-300 font-mono break-all flex-1">{l.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. CURRENT DEPLOYMENT HISTORY */}
      {activeTab === "versions" && isAdmin && (
        <div className="space-y-4 animate-fadeIn" id="pane-versions">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Release Strategy</span>
              <p className="text-xs text-slate-300">Currently active compilation database is pointer: <strong className="text-teal-400 font-mono">v{projectSettings.version}</strong></p>
            </div>
            <button
              id="btn-trigger-deploy-modal"
              type="button"
              onClick={() => setShowDeploymentModal(true)}
              className="text-[11px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl flex items-center gap-1 transition-all"
            >
              Deploy New Version
            </button>
          </div>

          <div className="space-y-3.5">
            {deploymentVersions.map((v, idx) => (
              <div 
                key={v.version} 
                className={`p-4 rounded-2xl border transition-all ${
                  v.status === "active" 
                    ? "bg-slate-950 border-teal-500/30" 
                    : "bg-slate-950/60 border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg ${
                        v.status === "active" 
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}>
                        v{v.version}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">Revision Deploy Release</h4>
                      {v.status === "active" && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                          Live Active Pointer
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">{v.notes}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-6 pt-2 text-[10px] text-slate-500">
                      <span>Deployment ID: <strong className="text-slate-400 font-mono">{v.deploymentId.slice(0, 20)}...</strong></span>
                      <span>Push Date: <strong className="text-slate-400 font-medium">{v.date}</strong></span>
                      <span>Operator: <strong className="text-sky-400 font-mono">{v.createdBy}</strong></span>
                    </div>
                  </div>

                  {v.status === "archived" && (
                    <button
                      type="button"
                      onClick={() => handleRollbackVersion(v)}
                      className="text-[10px] font-extrabold px-3 py-1.5 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-all"
                    >
                      Rollback to v{v.version}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. DRIVE SCRIPT BACKUPS */}
      {activeTab === "backups" && isAdmin && (
        <div className="space-y-4 animate-fadeIn" id="pane-backups">
          <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[11px] text-indigo-300 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Google Drive automatically structures code snapshot archives under your <strong className="text-white">Master Systems Folder</strong> ID. You can roll-back to previous metadata or check change histories cleanly from this ERP log section.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase font-bold">
                    <th className="pb-2">Triggered Version</th>
                    <th className="pb-2">Backup Time/Date</th>
                    <th className="pb-2">Storage Path Location</th>
                    <th className="pb-2">Notes Summary</th>
                    <th className="pb-2">Pack Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-[11px]">
                  {backups.map((bc, i) => (
                    <tr key={i} className="hover:bg-slate-900/30">
                      <td className="py-2.5 font-mono font-bold text-sky-400">v{bc.version}</td>
                      <td className="py-2.5 text-slate-300">{bc.backupDate}</td>
                      <td className="py-2.5 font-mono text-[10px] text-slate-500">{bc.driveFolder}</td>
                      <td className="py-2.5 text-slate-400 truncate max-w-[250px]">{bc.notes}</td>
                      <td className="py-2.5 font-mono text-[10px] font-bold text-indigo-400">{bc.fileSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DEPLOY NEW VERSION MODAL */}
      {showDeploymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="deployment-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Register Production Deploy
              </h3>
              <button 
                type="button" 
                onClick={() => setShowDeploymentModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Updating deployment pointers updates API access endpoints dynamically across Savi Painting OS screens without needing workspace resets.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">New Version Code *</label>
                <input
                  id="modal-input-version"
                  type="text"
                  value={newVersionNum}
                  onChange={(e) => setNewVersionNum(e.target.value)}
                  placeholder="e.g. 3.4.3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">New Deployment ID *</label>
                <input
                  id="modal-input-deployment-id"
                  type="text"
                  value={newDeploymentId}
                  onChange={(e) => setNewDeploymentId(e.target.value)}
                  placeholder="e.g. AKfycbx8-A..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-550 uppercase font-bold mb-1">Change Logs & Release Notes</label>
                <textarea
                  id="modal-input-notes"
                  rows={3}
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  placeholder="Include upgrade notes, bugfixes, or feature indicators."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-850">
              <button
                type="button"
                onClick={() => setShowDeploymentModal(false)}
                className="text-[11px] font-bold text-slate-400 hover:text-white px-4 py-2 border border-slate-800 rounded-lg hover:bg-slate-950 transition-all font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-deploy-submit"
                onClick={handleNewDeploymentSubmit}
                className="text-[11px] font-extrabold text-white bg-indigo-650 hover:bg-indigo-500 px-5 py-2 rounded-lg transition-all font-sans"
              >
                Authorize Deploy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
