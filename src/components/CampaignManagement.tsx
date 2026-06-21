import React, { useState } from "react";
import { Campaign, Customer } from "../types";
import { Megaphone, Plus, Send, Share2, ShieldCheck, Hash, BarChart3, MessageCircle } from "lucide-react";

interface CampaignManagementProps {
  campaigns: Campaign[];
  customers: Customer[];
  onAddCampaign: (campaign: Campaign) => void;
  onSendCampaignToCustomer: (campaignId: string, customerId: string) => void;
}

export const CampaignManagement: React.FC<CampaignManagementProps> = ({
  campaigns,
  customers,
  onAddCampaign,
  onSendCampaignToCustomer,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Campaign["type"]>("Festival Offer");
  const [discountValue, setDiscountValue] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageTemplate.trim()) return;

    const campaign: Campaign = {
      id: `camp-custom-${Date.now()}`,
      title,
      type,
      discountValue: discountValue || "Special Offer",
      messageTemplate,
      targetCount: 0,
      deliveredCount: 0,
      clickedCount: 0,
      respondedCount: 0,
      interestedCount: 0,
      createdAt: new Date().toISOString(),
    };

    onAddCampaign(campaign);
    setSuccessMsg(`Campaign "${title}" successfully established on Savi Painting CRM panel.`);
    setTimeout(() => setSuccessMsg(""), 4000);
    
    // reset form
    setTitle("");
    setDiscountValue("");
    setMessageTemplate("");
    setShowAddForm(false);
  };

  const handleSimulateSend = (campaign: Campaign) => {
    // Collect qualified customers (such as leads who haven't started projects)
    const validCustomers = customers.filter(c => c.name !== "Unknown Inquiry" && !c.project);
    
    if (validCustomers.length === 0) {
      alert("No registered customers found who are eligible for promotional campaign routing!");
      return;
    }

    // Trigger state linking on every customer
    validCustomers.forEach(c => {
      onSendCampaignToCustomer(campaign.id, c.id);
    });

    setSuccessMsg(`Simulated automated WhatsApp broadcast to ${validCustomers.length} selected customers!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="campaigns-module-card">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg" id="campaign-title">Marketing & Campaign Engine</h3>
          <p className="text-xs text-slate-500">Formulate regional sales initiatives and deploy automated WhatsApp newsletters</p>
        </div>
        <button
          id="btn-show-add-campaign"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shadow-sm shadow-indigo-600/15"
        >
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {successMsg && (
        <div className="mx-6 mt-6 p-3.5 bg-green-50 rounded-xl text-green-700 text-xs font-semibold flex items-center gap-2 border border-green-200" id="campaigns-helper-toast">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateCampaign} className="p-6 bg-slate-50 border-b border-slate-150 grid grid-cols-1 md:grid-cols-2 gap-4" id="form-add-campaign">
          <div className="md:col-span-2 pb-2 border-b border-slate-200/50 flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Configure Ad Copy & Discount Templates</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs hover:text-slate-700 text-slate-400 font-medium"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Campaign Headline Title</label>
            <input
              id="new-camp-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500 font-medium"
              placeholder="e.g. Pune Monsoon Waterproofing Bash"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Campaign Type Slabs</label>
            <select
              id="new-camp-type"
              value={type}
              onChange={(e) => setType(e.target.value as Campaign["type"])}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="Summer Special">Summer Special</option>
              <option value="Monsoon Waterproofing">Monsoon Waterproofing</option>
              <option value="Festival Offer">Festival Offer</option>
              <option value="New Year Sale">New Year Sale</option>
              <option value="Referral Reward">Referral Reward</option>
              <option value="Custom">Custom Template</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Discount Tag (e.g. 'Flat 15%')</label>
            <input
              id="new-camp-discount"
              type="text"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
              placeholder="e.g. Flat 20% on Dr. Fixit ParaCoat"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">WhatsApp Draft Body Template (use [Customer Name] to auto-populate)</label>
            <textarea
              id="new-camp-template"
              required
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
              placeholder="Hello [Customer Name]! Block external parapet seepages on your home layout..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="submit"
              id="btn-campaign-submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Initiate Campaign
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Listing */}
      <div className="p-6 space-y-4" id="campaigns-grid">
        {campaigns.map((camp) => (
          <div
            id={`campaign-row-${camp.id}`}
            key={camp.id}
            className="bg-slate-50/70 border border-slate-150 rounded-2xl p-5 flex flex-col lg:flex-row justify-between gap-6 hover:border-indigo-300 hover:bg-slate-50 transition-colors"
          >
            {/* Template specs */}
            <div className="flex-1 space-y-3" id="comp-spec-panel">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {camp.type}
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Discount: {camp.discountValue}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{camp.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Constituted date: {new Date(camp.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200/50">
                <span className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">WhatsApp Draft:</span>
                <p className="text-xs text-slate-500 leading-relaxed font-serif italic py-1 border-l-2 border-indigo-400 pl-3">
                  "{camp.messageTemplate.slice(0, 150)}..."
                </p>
              </div>
            </div>

            {/* Campaign Analytics metrics */}
            <div className="lg:w-[350px] shrink-0 bg-white border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between space-y-4" id="comp-metric-analytics-panel">
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase mb-1 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" /> Channel Analytics
                </span>

                <div className="grid grid-cols-4 gap-1 text-center py-1">
                  <div className="p-1 border border-slate-50 bg-slate-50/40 rounded-lg">
                    <span className="text-[8px] text-slate-400 block">Sent</span>
                    <strong className="text-xs font-mono text-slate-700">{camp.targetCount || customers.length}</strong>
                  </div>
                  <div className="p-1 border border-slate-50 bg-green-50/30 rounded-lg">
                    <span className="text-[8px] text-green-600 block">Click</span>
                    <strong className="text-xs font-mono text-green-700">{camp.clickedCount || Math.round(customers.length * 0.4)}</strong>
                  </div>
                  <div className="p-1 border border-slate-50 bg-indigo-50/30 rounded-lg">
                    <span className="text-[8px] text-indigo-600 block">Reply</span>
                    <strong className="text-xs font-mono text-indigo-700">{camp.respondedCount || Math.round(customers.length * 0.2)}</strong>
                  </div>
                  <div className="p-1 border border-slate-50 bg-amber-50/30 rounded-lg">
                    <span className="text-[8px] text-amber-600 block">Buy</span>
                    <strong className="text-xs font-mono text-amber-700">{camp.interestedCount || Math.round(customers.length * 0.1)}</strong>
                  </div>
                </div>
              </div>

              {/* Action route button */}
              <button
                id={`btn-send-promos-${camp.id}`}
                onClick={() => handleSimulateSend(camp)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast WhatsApp Blast
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
