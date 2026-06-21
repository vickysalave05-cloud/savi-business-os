import React, { useState } from "react";
import { Customer, RoughEstimate } from "../types";
import { Calculator, Share2, Clipboard, ShieldAlert, CheckCircle2, DollarSign } from "lucide-react";

interface RoughQuotationCalculatorProps {
  customer: Customer;
  onSaveEstimate: (customerId: string, estimate: RoughEstimate) => void;
}

export const RoughQuotationCalculator: React.FC<RoughQuotationCalculatorProps> = ({
  customer,
  onSaveEstimate,
}) => {
  const [approxArea, setApproxArea] = useState<number>(customer.roughEstimate?.approxArea || 1200);
  const [workType, setWorkType] = useState<string>(customer.roughEstimate?.workType || "Interior Paint");
  const [approxRate, setApproxRate] = useState<number>(customer.roughEstimate?.approxRate || 35);
  const [customerBudget, setCustomerBudget] = useState<number>(customer.roughEstimate?.customerBudget || 50000);
  const [copied, setCopied] = useState<boolean>(false);

  // Instant calculation logic
  const totalEstimate = approxArea * approxRate;
  const minRange = Math.round(totalEstimate * 0.92);
  const maxRange = Math.round(totalEstimate * 1.08);
  
  let budgetComparison: "Under Budget" | "Within Budget" | "Over Budget" = "Within Budget";
  if (customerBudget > 0) {
    if (totalEstimate < customerBudget * 0.9) {
      budgetComparison = "Under Budget";
    } else if (totalEstimate > customerBudget) {
      budgetComparison = "Over Budget";
    } else {
      budgetComparison = "Within Budget";
    }
  }

  // Pre-filled WhatsApp template generator
  const getWhatsAppMessage = () => {
    const formattedRange = `₹${minRange.toLocaleString("en-IN")} to ₹${maxRange.toLocaleString("en-IN")}`;
    const formattedAverage = `₹${totalEstimate.toLocaleString("en-IN")}`;
    const cleanMobile = customer.mobile.replace(/[-+ \s]/g, "");
    
    const text = `Savi Painting Estimator Portal\n` +
      `-----------------------------------------\n` +
      `Dear *${customer.name}*,\n\n` +
      `Thank you for scheduling a GPS Site Visit with Savi Painting. Based on our site inspection at Kothrud/Pune region, here is your rough budget estimate:\n\n` +
      `• *Service Type:* ${workType}\n` +
      `• *Approx Area:* ${approxArea} sq ft\n` +
      `• *Approx Rate:* ₹${approxRate}/sq ft\n` +
      `• *Estimated Cost Range:* ${formattedRange}\n` +
      `• *Average Budget:* ${formattedAverage}\n` +
      `• *Your Defined Budget:* ₹${customerBudget.toLocaleString("en-IN")} (${budgetComparison})\n\n` +
      `This is a rough evaluation. We will share a detailed final itemized quotation soon.\n\n` +
      `Click below to chat with our engineer or request a customized layout!`;
    
    return {
      text,
      link: `https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`,
    };
  };

  const handleShareWhatsApp = () => {
    const info = getWhatsAppMessage();
    // Log as a timeline activity and save to global state
    const estimateObj: RoughEstimate = {
      approxArea,
      workType,
      approxRate,
      totalEstimate,
      minRange,
      maxRange,
      customerBudget,
      budgetComparison,
      sharedAt: new Date().toISOString(),
    };
    onSaveEstimate(customer.id, estimateObj);
    window.open(info.link, "_blank");
  };

  const handleCopyToClipboard = () => {
    const info = getWhatsAppMessage();
    navigator.clipboard.writeText(info.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm" id="rough-calculator-card">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl" id="rough-calculator-icon">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800" id="rough-calculator-title">Instant Rough Estimator</h3>
          <p className="text-xs text-slate-500">Fast ballpark range creator for on-site client interactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="rough-calculator-body">
        {/* Left Side: Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Approximate Area (Sq Ft)
            </label>
            <div className="relative">
              <input
                id="input-rough-area"
                type="number"
                value={approxArea}
                onChange={(e) => setApproxArea(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-teal-500 text-sm font-medium transition-colors"
                placeholder="e.g. 1500"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">SqFt</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Work Category
            </label>
            <select
              id="select-rough-work-type"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-teal-500 text-sm font-medium transition-colors"
            >
              <option value="Interior Paint">Interior Luxury Painting</option>
              <option value="Exterior Paint">Exterior Weathercoat Shield</option>
              <option value="Waterproofing">Full Parapet & Roof Waterproofing</option>
              <option value="Texture Premium">Designer Decorative Texture</option>
              <option value="Complete Overhaul">Raw Drywall + Scraping + Primer + Paint</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Approx Rate (₹/SqFt)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">₹</span>
                <input
                  id="input-rough-rate"
                  type="number"
                  value={approxRate}
                  onChange={(e) => setApproxRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-slate-800 focus:outline-none focus:border-teal-500 text-sm font-medium transition-colors"
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Client Budget (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">₹</span>
                <input
                  id="input-rough-budget"
                  type="number"
                  value={customerBudget}
                  onChange={(e) => setCustomerBudget(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-slate-800 focus:outline-none focus:border-teal-500 text-sm font-medium transition-colors"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Metrics Output */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-slate-500">Calculated Average Estimate</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                budgetComparison === "Under Budget" ? "bg-green-50 text-green-700" :
                budgetComparison === "Within Budget" ? "bg-teal-50 text-teal-700" :
                "bg-amber-50 text-amber-700"
              }`} id="budget-comparison-badge">
                {budgetComparison === "Over Budget" ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {budgetComparison}
              </span>
            </div>

            <div className="text-3xl font-bold text-slate-800 mb-4" id="rough-calc-average-metric">
              ₹{totalEstimate.toLocaleString("en-IN")}
            </div>

            <div className="space-y-2 text-sm border-t border-slate-200/60 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Estimated Cost Range:</span>
                <span className="font-semibold text-slate-700 text-xs font-mono">
                  ₹{minRange.toLocaleString("en-IN")} - ₹{maxRange.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Estimated Safety Margin (8%):</span>
                <span className="font-semibold text-slate-700 text-xs font-mono">
                  ± ₹{Math.round(totalEstimate * 0.08).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Client Budget Gap:</span>
                <span className={`font-semibold text-xs font-mono ${
                  totalEstimate <= customerBudget ? "text-green-600" : "text-rose-500"
                }`}>
                  {totalEstimate <= customerBudget 
                    ? `₹${(customerBudget - totalEstimate).toLocaleString("en-IN")} Surplus`
                    : `₹${(totalEstimate - customerBudget).toLocaleString("en-IN")} Over Budget`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60 flex gap-2">
            <button
              id="btn-rough-share-whatsapp"
              onClick={handleShareWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-green-600/10"
            >
              <Share2 className="w-4 h-4" /> Share WhatsApp
            </button>
            <button
              id="btn-rough-copy-clipboard"
              onClick={handleCopyToClipboard}
              className="bg-white hover:bg-slate-100 border border-slate-200 active:scale-[0.98] text-slate-600 text-xs font-semibold p-2.5 rounded-xl flex items-center justify-center transition-all"
              title="Copy Message Text to Clipboard"
            >
              {copied ? (
                <span className="text-teal-600 text-xs font-medium px-1">Copied!</span>
              ) : (
                <Clipboard className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
