import React from "react";
import { FollowUpTask, Customer } from "../types";
import { Bell, Clock, AlertTriangle, CheckSquare, MessageSquare, ExternalLink } from "lucide-react";

interface FollowUpAutomationPanelProps {
  tasks: FollowUpTask[];
  onCompleteTask: (id: string) => void;
  onLaunchWhatsAppReminder: (task: FollowUpTask) => void;
}

export const FollowUpAutomationPanel: React.FC<FollowUpAutomationPanelProps> = ({
  tasks,
  onCompleteTask,
  onLaunchWhatsAppReminder,
}) => {
  // Categorize follow-ups based on due dates
  const todayStr = "2026-06-21"; // context date

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== "Completed");
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== "Completed");
  const pendingTasks = tasks.filter((t) => t.dueDate > todayStr && t.status !== "Completed");

  const renderTaskRow = (task: FollowUpTask) => (
    <div
      id={`task-item-${task.id}`}
      key={task.id}
      className="bg-white rounded-xl border border-slate-150 p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-teal-300 transition-colors"
    >
      <div className="flex items-start gap-3 w-full md:w-auto">
        <div className={`p-2 rounded-lg ${
          task.type === "Payment Reminder" ? "bg-rose-50 text-rose-600" :
          task.type === "Quotation Feed" || task.type === "Quotation Reminder" ? "bg-amber-50 text-amber-600" :
          "bg-indigo-50 text-indigo-600"
        }`}>
          <Bell className="w-4 h-4" />
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <span className="font-bold text-slate-800 text-sm">{task.customerName}</span>
            <span className="text-[10px] text-slate-400 font-mono font-medium">{task.customerMobile}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{task.description}</p>
          <div className="flex gap-2 items-center mt-2.5">
            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
              Rule: {task.type}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-300" /> Due: {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end" id="task-actions">
        <button
          id={`btn-complete-task-${task.id}`}
          onClick={() => onCompleteTask(task.id)}
          className="bg-teal-50 hover:bg-teal-100 border border-teal-200/55 text-teal-700 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 transition-all"
        >
          <CheckSquare className="w-4 h-4" /> Resolve
        </button>
        <button
          id={`btn-whatsapp-remind-${task.id}`}
          onClick={() => onLaunchWhatsAppReminder(task)}
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1 transition-all shadow-sm"
        >
          <MessageSquare className="w-4 h-4" /> Pin WhatsApp
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="follow-up-automation-main">
      {/* Left Column: Rules & Logic */}
      <div className="lg:col-span-1 bg-gradient-to-br from-teal-900 to-teal-950 text-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-md" id="follow-up-rules-panel">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-black text-teal-300 tracking-widest block mb-2">CRM State Intelligence</span>
            <h3 className="text-lg font-bold text-white">Automative Follow-Up Trigger Matrix</h3>
            <p className="text-teal-100 text-xs mt-1 leading-relaxed">
              Savi CRM monitors customer lifecycle milestones and computes touchpoint alerts automatically.
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-teal-100">
            <div className="flex items-center justify-between border-b border-teal-800/40 pb-2">
              <span className="font-medium">Lead Created</span>
              <span className="font-bold text-teal-300 font-mono">→ Day 1 Alert</span>
            </div>
            <div className="flex items-center justify-between border-b border-teal-800/40 pb-2">
              <span className="font-medium">Quotation Sent</span>
              <span className="font-bold text-teal-300 font-mono">→ Day 2 Alert</span>
            </div>
            <div className="flex items-center justify-between border-b border-teal-800/40 pb-2">
              <span className="font-medium">Quotation Viewed</span>
              <span className="font-bold text-teal-300 font-mono">→ Day 3 Alert</span>
            </div>
            <div className="flex items-center justify-between border-b border-teal-800/40 pb-2">
              <span className="font-medium">No Customer Response</span>
              <span className="font-bold text-teal-300 font-mono">→ Day 5 Alert</span>
            </div>
            <div className="flex items-center justify-between border-b border-teal-800/40 pb-2">
              <span className="font-medium">Invoice Issued (Pending)</span>
              <span className="font-bold text-teal-300 font-mono">→ Overdue Reminder</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Project Completed</span>
              <span className="font-bold text-teal-300 font-mono">→ Feedback Loop</span>
            </div>
          </div>
        </div>

        <div className="bg-teal-950/60 rounded-xl p-3 border border-teal-800/40 text-[10px] text-teal-200 leading-relaxed font-medium">
          Estimators click "Pin WhatsApp" to launch immediate WhatsApp redirection with template layouts mapped instantly to clients.
        </div>
      </div>

      {/* Right Column: Listing Tabs */}
      <div className="lg:col-span-2 space-y-6" id="follow-up-tasks-panel">
        {/* Row 1: Overdue Alerts (High Priority) */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-xs font-extrabold text-red-600 uppercase tracking-widest pl-1">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> Overdue Follow-ups ({overdueTasks.length})
          </h4>
          <div className="space-y-2.5" id="overdue-tasks-container">
            {overdueTasks.map(renderTaskRow)}
            {overdueTasks.length === 0 && (
              <p className="text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl p-4 text-center">
                Outstanding! No overdue sales follow-ups logged.
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Today Tasks */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-xs font-extrabold text-teal-700 uppercase tracking-widest pl-1 font-sans">
            <Clock className="w-4 h-4 text-teal-600" /> Today's Action Items ({todayTasks.length})
          </h4>
          <div className="space-y-2.5" id="today-tasks-container">
            {todayTasks.map(renderTaskRow)}
            {todayTasks.length === 0 && (
              <p className="text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl p-4 text-center">
                All of today's customer follow-up actions have been successfully resolved.
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Pending Task Lists */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">
            Scheduled Pipeline ({pendingTasks.length})
          </h4>
          <div className="space-y-2.5" id="pending-tasks-container">
            {pendingTasks.map(renderTaskRow)}
            {pendingTasks.length === 0 && (
              <p className="text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl p-4 text-center">
                No future follow-ups lined up in queue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
