import React, { useState, useEffect } from "react";
import { Customer, FinalQuotation, FinalQuotationItem, Material, SystemSettings } from "../types";
import { Plus, Trash2, FileText, CheckCircle, Percent, ShieldCheck, CornerDownRight, Download } from "lucide-react";
import { exportQuotationToPDF } from "../utils/pdfExport";

interface FinalQuotationGeneratorProps {
  customer: Customer;
  materials: Material[];
  onSaveQuotation: (customerId: string, quotation: FinalQuotation) => void;
  settings: SystemSettings;
}

export const FinalQuotationGenerator: React.FC<FinalQuotationGeneratorProps> = ({
  customer,
  materials,
  onSaveQuotation,
  settings,
}) => {
  const [items, setItems] = useState<FinalQuotationItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(15);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Auto-init based on customer rough estimates to minimize manual entry
  useEffect(() => {
    if (customer.roughEstimate) {
      const { approxArea, workType } = customer.roughEstimate;
      
      // Seed high-probability baseline estimators based on works requested
      // For instance: Scraping, Primer, Paint, Labour
      const initialItems: FinalQuotationItem[] = [
        {
          id: `item-scraping-${Date.now()}-1`,
          name: `High-grit scraping & sanding prep over approx ${approxArea} Sq Ft`,
          category: "Scraping",
          quantity: approxArea,
          rate: 6, // default rate is ₹6 per sq ft
          amount: approxArea * 6,
        },
        {
          id: `item-labour-${Date.now()}-2`,
          name: `Expert Artisan professional application labour`,
          category: "Labour",
          quantity: approxArea,
          rate: 12,
          amount: approxArea * 12,
        },
      ];

      // Auto-select a best-fit paint/waterproofing material to trigger AUTO MATERIAL ESTIMATION!
      let matchedMaterial: Material | undefined;
      if (workType.includes("Waterproofing")) {
        matchedMaterial = materials.find((m) => m.id === "drfixit-raincoat");
      } else {
        matchedMaterial = materials.find((m) => m.id === "ap-royale-luxury");
      }

      if (matchedMaterial) {
        // Auto material quantities derived from coverage: area * consumption
        // E.g., needed quantities = approxArea / coverage
        const neededUnits = Math.ceil(approxArea / matchedMaterial.coverage);
        initialItems.push({
          id: `item-material-${Date.now()}-3`,
          name: `${matchedMaterial.name} packing (${matchedMaterial.brand})`,
          category: matchedMaterial.category === "Waterproofing" ? "Waterproofing" : "Paint",
          materialId: matchedMaterial.id,
          materialBrand: matchedMaterial.brand,
          quantity: neededUnits,
          rate: matchedMaterial.rate,
          amount: Math.round(neededUnits * matchedMaterial.rate),
        });
      }

      // Add a scaffolding / setup rate placeholder
      initialItems.push({
        id: `item-scaffolding-${Date.now()}-4`,
        name: `Scaffolding & safe ladders setup`,
        category: "Scaffolding",
        quantity: 1,
        rate: 2500,
        amount: 2500,
      });

      setItems(initialItems);
    } else {
      // Empty default
      setItems([
        {
          id: `qi-default-1`,
          name: "Standard Wall Surface Preparations",
          category: "Putty",
          quantity: 1000,
          rate: 12,
          amount: 12000,
        },
      ]);
    }
  }, [customer.roughEstimate, materials]);

  const handleAddItem = (category: FinalQuotationItem["category"], materialId?: string) => {
    let defaultRate = 12;
    let name = `Custom ${category} work line item`;
    let brand: string | undefined;
    let qty = customer.roughEstimate?.approxArea || 1000;

    if (materialId) {
      const mat = materials.find((m) => m.id === materialId);
      if (mat) {
        defaultRate = mat.rate;
        brand = mat.brand;
        name = `${mat.name} (${mat.brand})`;
        
        // Auto quantity calculation based on coverage ratio: area / coverage
        const areaToPaint = customer.roughEstimate?.approxArea || 1000;
        qty = Math.ceil(areaToPaint / mat.coverage);
      }
    } else {
      if (category === "Scraping") { defaultRate = 5; name = "Heavy Sanding & paint peeling scraping"; }
      else if (category === "Labour") { defaultRate = 12; name = "Artisan professional labour charges"; }
      else if (category === "Scaffolding") { defaultRate = 3000; qty = 1; name = "Telescopic scaffolding & ladder bundle"; }
      else if (category === "Transport") { defaultRate = 1500; qty = 1; name = "Safety equipment transit & vehicle loading"; }
    }

    const newItem: FinalQuotationItem = {
      id: `qi-custom-${Date.now()}-${Math.random()}`,
      name,
      category,
      materialId,
      materialBrand: brand,
      quantity: qty,
      rate: defaultRate,
      amount: Math.round(qty * defaultRate),
    };

    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: "name" | "quantity" | "rate", value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const partial = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          const q = field === "quantity" ? Number(value) : item.quantity;
          const r = field === "rate" ? Number(value) : item.rate;
          partial.amount = Math.round(q * r);
        }
        return partial;
      }
      return item;
    });
    setItems(updated);
  };

  // Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = Math.round(rawSubtotal * (discountPercent / 100));
  const afterDiscount = rawSubtotal - discountAmount;
  
  // profit margin can be calculated over materials/subtotal as requested
  const profitMarginAmount = Math.round(afterDiscount * (profitMarginPercent / 100));
  const finalPreTaxAmount = afterDiscount + profitMarginAmount;
  const effectiveGstPercent = settings.gstEnabled ? gstPercent : 0;
  const gstAmount = settings.gstEnabled ? Math.round(finalPreTaxAmount * (effectiveGstPercent / 100)) : 0;
  const finalBilledAmount = Math.round(finalPreTaxAmount + gstAmount);

  const handleGenerateFinalQuote = () => {
    const quoteNumber = `SAVI-Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const quotation: FinalQuotation = {
      id: `q-final-${Date.now()}`,
      quotationNumber: quoteNumber,
      createdAt: new Date().toISOString(),
      items,
      subtotal: rawSubtotal,
      discountPercent,
      discountAmount,
      gstPercent: effectiveGstPercent,
      gstAmount,
      profitMarginPercent,
      profitMarginAmount,
      finalAmount: finalBilledAmount,
      status: "Sent",
      invoiceType: settings.gstEnabled ? "GST" : "Non-GST",
      gstEnabled: settings.gstEnabled,
      terms: settings.termsAndConditions && settings.termsAndConditions.length > 0
        ? settings.termsAndConditions
        : [
            "Work starts after agreed advance payment (40% advance).",
            "Additional work outside approved quotation is chargeable.",
            "Material changes requested later may affect final cost.",
            "Delays caused by weather, site readiness or third-party issues are not contractor responsibility.",
            "Customer must inspect work before final settlement.",
            "Final payment signifies acceptance of completed work.",
            "Warranty applies only to products and services specifically mentioned.",
            "Natural wear, seepage, dampness, structural defects and third-party damage are excluded unless specifically contracted.",
            "Disputes subject to Pune jurisdiction."
          ]
    };

    onSaveQuotation(customer.id, quotation);
    setSuccessMsg(`Quotation ${quoteNumber} successfully compiled and logged! Pre-filled WhatsApp and approval links are active.`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm" id="final-quotes-generator-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800" id="final-quotes-generator-title">Final Estimation Engine</h3>
            <p className="text-xs text-slate-500">Construct itemized billing rows linked directly to materials spec metrics</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Target Lead</span>
          <p className="text-xs font-bold text-slate-700" id="final-quotes-target-customer">{customer.name} ({customer.roughEstimate ? `${customer.roughEstimate.approxArea} SqFt` : "Custom"})</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3.5 bg-green-50 rounded-xl text-green-700 text-xs font-semibold flex items-center gap-2 border border-green-200" id="quota-generator-toast">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Item Actions Bar */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200/50">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Auto Materials Estimates & Service Injections</span>
        <div className="flex flex-wrap gap-2">
          {/* Quick Service Buttons */}
          <button
            id="btn-add-scraping"
            onClick={() => handleAddItem("Scraping")}
            className="bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
          >
            + Scraping Layer
          </button>
          <button
            id="btn-add-putty"
            onClick={() => handleAddItem("Putty")}
            className="bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
          >
            + Putty Compound
          </button>
          <button
            id="btn-add-primer"
            onClick={() => handleAddItem("Primer")}
            className="bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
          >
            + Primer Base
          </button>
          <button
            id="btn-add-labor"
            onClick={() => handleAddItem("Labour")}
            className="bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
          >
            + Labour Charge
          </button>
          <button
            id="btn-add-transport"
            onClick={() => handleAddItem("Transport")}
            className="bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
          >
            + Transit Multiplier
          </button>
          <button
            id="btn-add-scaffold"
            onClick={() => handleAddItem("Scaffolding")}
            className="bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition-all"
          >
            + Scaffolding Scaffold
          </button>
        </div>

        {/* Dropdown to link and auto-estimate premium product coverage on area */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap label-mat-auto">Auto-Estimate from Material DB:</label>
          <select
            id="select-autofill-material"
            onChange={(e) => {
              if (e.target.value) {
                handleAddItem("Paint", e.target.value);
                e.target.value = ""; // reset
              }
            }}
            className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-600 focus:outline-none focus:border-teal-500 font-medium w-full sm:w-auto flex-1 max-w-sm"
          >
            <option value="">-- Choose Brand Product --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} - {m.name} [Coverage: {m.coverage} SqFt]
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 italic">Auto-calculates precise client packing requirement based on Sq.Ft.</p>
        </div>
      </div>

      {/* Estimates Datatable rows */}
      <div className="overflow-x-auto mb-6" id="final-quotation-table-wrapper">
        <table className="w-full text-left" id="final-quotation-table">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <th className="py-2.5">Category</th>
              <th className="py-2.5 pl-2">Line Item Specification</th>
              <th className="py-2.5 px-3 text-center">Qty / Area</th>
              <th className="py-2.5 px-3 text-right">Rate (₹)</th>
              <th className="py-2.5 px-3 text-right">Sum (₹)</th>
              <th className="py-2.5 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors" id={`tbl-row-${item.id}`}>
                <td className="py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    item.category === "Labour" ? "bg-amber-50 text-amber-600" :
                    item.category === "Paint" ? "bg-blue-50 text-blue-600" :
                    item.category === "Waterproofing" ? "bg-cyan-50 text-cyan-600" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 pl-2">
                  <input
                    id={`input-item-name-${item.id}`}
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 font-medium text-slate-700 py-0.5 focus:outline-none"
                    placeholder="Enter details"
                  />
                  {item.materialBrand && (
                    <span className="text-[9px] text-slate-400 flex items-center mt-0.5">
                      <CornerDownRight className="w-2.5 h-2.5 text-slate-300 mr-1" /> Bound to manufacturer brand: {item.materialBrand}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <input
                    id={`input-item-qty-${item.id}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, "quantity", Number(e.target.value))}
                    className="w-16 mx-auto bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-center font-semibold font-mono text-slate-700 focus:outline-none focus:border-teal-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <div className="flex justify-end items-center gap-0.5 font-mono">
                    <span>₹</span>
                    <input
                      id={`input-item-rate-${item.id}`}
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleUpdateItem(item.id, "rate", Number(e.target.value))}
                      className="w-14 bg-slate-50 border border-slate-200 rounded px-1 text-right font-medium text-slate-700 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-800 font-mono">
                  ₹{item.amount.toLocaleString("en-IN")}
                </td>
                <td className="py-3 text-center">
                  <button
                    id={`btn-remove-item-${item.id}`}
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-rose-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  Add line item layers to compute comprehensive pricing breakdown
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bill summary margins, discounts & tax */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100" id="final-quotation-summary-panel">
        {/* Left Side: Parameters sliders */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Special Direct Discount
            </span>
            <div className="flex items-center gap-1.5 font-semibold font-mono text-slate-800">
              <input
                id="input-discount-percent"
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-xs text-slate-700"
              />
              <span>%</span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-amber-500" /> Margin markup (Profit)
            </span>
            <div className="flex items-center gap-1.5 font-semibold font-mono text-slate-800">
              <input
                id="input-margin-percent"
                type="number"
                value={profitMarginPercent}
                onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-xs text-slate-700"
              />
              <span>%</span>
            </div>
          </div>

          {settings.gstEnabled && (
            <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-rose-500" /> GST Tax Slabs
              </span>
              <div className="flex items-center gap-1.5 font-semibold font-mono text-slate-800">
                <input
                  id="input-gst-percent"
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center text-xs text-slate-700"
                />
                <span>%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Total Cost Summary Card */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 shadow-inner flex flex-col justify-between">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Gross Material & Labor Subtotal:</span>
              <span className="font-semibold text-white font-mono">₹{rawSubtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Discount ({discountPercent}%):</span>
              <span className="font-semibold font-mono">- ₹{discountAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Contractor Office Profit Margin ({profitMarginPercent}%):</span>
              <span className="font-semibold font-mono">+ ₹{profitMarginAmount.toLocaleString("en-IN")}</span>
            </div>
            {settings.gstEnabled ? (
              <div className="flex justify-between text-rose-400">
                <span>GST Goods & Services Tax ({gstPercent}%):</span>
                <span className="font-semibold font-mono">+ ₹{gstAmount.toLocaleString("en-IN")}</span>
              </div>
            ) : (
              <div className="bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-[10.5px] text-amber-400 italic">
                * GST Not Applicable (Non-GST Mode). {settings.nonGstText}
              </div>
            )}
            <div className="border-t border-slate-800 pt-3 mt-1.5 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Final Quotation Total:</span>
              <span className="text-2xl font-black text-rose-400 font-mono" id="final-quotation-summary-amount">
                ₹{finalBilledAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            id="btn-compile-final-quote"
            disabled={items.length === 0}
            onClick={handleGenerateFinalQuote}
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-900/40 flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Save & Log Final Quotation
          </button>

          {customer.finalQuotations.length > 0 && (
            <button
              id="btn-download-pdf-generator"
              type="button"
              onClick={() => exportQuotationToPDF(customer, customer.finalQuotations[0], settings)}
              className="mt-2.5 w-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
              title="Download high density print-ready PDF proposal"
            >
              <Download className="w-4 h-4" /> Export Active Proposal PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
