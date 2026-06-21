import React from "react";
import { Customer, Campaign } from "../types";
import { TrendingUp, Users, FileCheck, Landmark, BarChart2, PieChart, Info, Percent, AlertCircle } from "lucide-react";

interface DashboardStatsProps {
  customers: Customer[];
  campaigns: Campaign[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ customers, campaigns }) => {
  // Aggregate Metrics
  // 1. Monthly (using June 2026 data based on simulation time)
  // 2. Yearly (aggregating all)
  const today = new Date("2026-06-21T09:05:30-07:00");
  const currentMonthStr = "2026-06";

  let monthlyRevenue = 0;
  let yearlyRevenue = 0;
  let totalBilled = 0;
  let totalPaid = 0;
  let pendingPaymentsAmount = 0;

  customers.forEach((c) => {
    // Sum from ledger payments
    c.ledger.payments.forEach((p) => {
      yearlyRevenue += p.amount;
      if (p.date.startsWith(currentMonthStr)) {
        monthlyRevenue += p.amount;
      }
    });

    totalBilled += c.ledger.totalBilled;
    totalPaid += c.ledger.totalPaid;
    pendingPaymentsAmount += c.ledger.balanceDue;
  });

  // Quotation counts
  let totalQuotesCount = 0;
  let approvedQuotesCount = 0;
  customers.forEach((c) => {
    totalQuotesCount += c.finalQuotations.length;
    c.finalQuotations.forEach((q) => {
      if (q.status === "Approved") {
        approvedQuotesCount++;
      }
    });
  });

  // Conversion rate
  const conversionRate = totalQuotesCount > 0 
    ? Math.round((approvedQuotesCount / totalQuotesCount) * 100) 
    : 0;

  // Collection Rate
  const collectionRate = totalBilled > 0 
    ? Math.round((totalPaid / totalBilled) * 100) 
    : 100;

  // Count lead sources
  const leadSourceCounts: Record<string, number> = {};
  customers.forEach((c) => {
    leadSourceCounts[c.source] = (leadSourceCounts[c.source] || 0) + 1;
  });

  // Services distribution
  let serviceCounts: Record<string, number> = {
    "Interior Paint": 0,
    "Exterior Paint": 0,
    "Waterproofing": 0,
    "Texture Premium": 0
  };

  customers.forEach((c) => {
    if (c.roughEstimate?.workType) {
      const wt = c.roughEstimate.workType;
      if (wt.includes("Interior")) serviceCounts["Interior Paint"]++;
      else if (wt.includes("Exterior")) serviceCounts["Exterior Paint"]++;
      else if (wt.includes("Waterproofing")) serviceCounts["Waterproofing"]++;
      else if (wt.includes("Texture")) serviceCounts["Texture Premium"]++;
    }
  });

  // Campaign conversion metric
  let totalDelivered = 0;
  let totalClicked = 0;
  let totalResponded = 0;
  let totalInterested = 0;

  campaigns.forEach((camp) => {
    totalDelivered += camp.deliveredCount;
    totalClicked += camp.clickedCount;
    totalResponded += camp.respondedCount;
    totalInterested += camp.interestedCount;
  });

  const campaignClickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0;
  const campaignResponseRate = totalClicked > 0 ? Math.round((totalResponded / totalClicked) * 100) : 0;

  return (
    <div className="space-y-6" id="dashboard-wrapper">
      {/* Metrics Row - 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-metrics-grid1">
        {/* Metric 1: Monthly Revenue */}
        <div className="bg-white border border-slate-150/60 rounded-2xl p-5 shadow-sm hover:translate-y-[-2px] transition-transform flex justify-between items-center" id="stat-card-monthly-rev">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">June Revenue</span>
            <p className="text-2xl font-black text-slate-800 font-mono">₹{monthlyRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-teal-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Target Month
            </p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Yearly Revenue */}
        <div className="bg-white border border-slate-150/60 rounded-2xl p-5 shadow-sm hover:translate-y-[-2px] transition-transform flex justify-between items-center" id="stat-card-yearly-rev">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Total Colection YTD</span>
            <p className="text-2xl font-black text-slate-800 font-mono">₹{yearlyRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-slate-500 font-semibold">Normalized Accounts</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Conversion Rate */}
        <div className="bg-white border border-slate-150/60 rounded-2xl p-5 shadow-sm hover:translate-y-[-2px] transition-transform flex justify-between items-center" id="stat-card-conversion">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Quotation Conversion</span>
            <p className="text-2xl font-black text-slate-800 font-mono">{conversionRate}%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">
              {approvedQuotesCount} of {totalQuotesCount} approved
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Collection Rate */}
        <div className="bg-white border border-slate-150/60 rounded-2xl p-5 shadow-sm hover:translate-y-[-2px] transition-transform flex justify-between items-center" id="stat-card-collection">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Cash Collection ratio</span>
            <p className="text-2xl font-black text-slate-800 font-mono">{collectionRate}%</p>
            <p className="text-[10px] text-rose-500 font-bold font-mono">
              ₹{pendingPaymentsAmount.toLocaleString("en-IN")} Out
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="dashboard-visual-analytics-panel">
        
        {/* Left Widget: Lead Source breakdown */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm col-span-1" id="dash-lead-sources">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-500" /> Channel Attribution (Lead Sources)
          </h3>
          <div className="space-y-3" id="lead-sources-container">
            {Object.keys(leadSourceCounts).length === 0 ? (
              <p className="text-xs text-slate-400">No customers registered in database</p>
            ) : (
              Object.entries(leadSourceCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => {
                  const percentage = Math.round((count / customers.length) * 100);
                  return (
                    <div id={`ls-item-${source.replace(/\s+/g, "")}`} key={source} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{source}</span>
                        <span className="font-bold text-slate-900 font-mono">{count} leads ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-700 h-full rounded-full" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Middle Widget: Top services distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm col-span-1" id="dash-services">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-500" /> Service Type Distributions
          </h3>
          <div className="space-y-3" id="service-types-container">
            {Object.entries(serviceCounts).map(([service, count]) => {
              const maxCount = Math.max(...Object.values(serviceCounts), 1);
              const percentage = Math.round((count / maxCount) * 100);
              return (
                <div id={`st-item-${service.replace(/\s+/g, "")}`} key={service} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{service}</span>
                    <span className="font-bold text-slate-900 font-mono">{count} jobs requested</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Widget: Marketing Campaign Performance */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm col-span-1" id="dash-campaign-analytics">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-slate-500" /> WhatsApp Campaign Conversions
          </h3>
          <div className="space-y-4" id="campaign-conversion-container">
            <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-4 text-center border border-slate-150">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Offer Messages</span>
                <p className="text-lg font-bold text-slate-800 font-mono">{totalDelivered}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Clicks logged</span>
                <p className="text-lg font-bold text-slate-800 font-mono">{totalClicked}</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div id="camp-metric-clicks" className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">Unified Click Ratio (CTR)</span>
                  <span className="font-bold text-slate-900 font-mono">{campaignClickRate}%</span>
                </div>
                <div className="w-full bg-slate-150/70 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${campaignClickRate}%` }} 
                  />
                </div>
              </div>

              <div id="camp-metric-responded" className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">Reply Ratio of Clicks</span>
                  <span className="font-bold text-slate-900 font-mono">{campaignResponseRate}%</span>
                </div>
                <div className="w-full bg-slate-150/70 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${campaignResponseRate}%` }} 
                  />
                </div>
              </div>

              <div id="campaign-funnel-footer" className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2 grid grid-cols-2 gap-1 mt-1 font-medium">
                <div>• Interested leads: <strong>{totalInterested}</strong></div>
                <div>• Chat reactions: <strong>{totalResponded}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
