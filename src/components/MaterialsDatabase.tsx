import React, { useState } from "react";
import { Material } from "../types";
import { Search, Plus, Filter, ArrowUpRight, ShieldCheck, HeartPulse, Edit3 } from "lucide-react";

interface MaterialsDatabaseProps {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onUpdateMaterialRate: (id: string, newRate: number) => void;
}

export const MaterialsDatabase: React.FC<MaterialsDatabaseProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterialRate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // States for adding a new material form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState("Asian Paints");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Material["category"]>("Paint");
  const [newCoverage, setNewCoverage] = useState(120);
  const [newRate, setNewRate] = useState(350);
  const [newPacking, setNewPacking] = useState("20L");
  const [newApplication, setNewApplication] = useState("");
  const [newMaterialType, setNewMaterialType] = useState("");

  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState<number>(0);

  // Filter distinct list of brands & categories for filter chips
  const brands: string[] = ["All", ...(Array.from(new Set(materials.map((m) => m.brand))) as string[])];
  const categories: string[] = ["All", ...(Array.from(new Set(materials.map((m) => m.category))) as string[])];

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.materialType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === "All" || material.brand === selectedBrand;
    const matchesCategory = selectedCategory === "All" || material.category === selectedCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedId = `custom-${Date.now()}`;
    const rateVal = Number(newRate);
    const coverageVal = Number(newCoverage);
    const consumptionRate = Number((1 / coverageVal).toFixed(5));

    const material: Material = {
      id: generatedId,
      brand: newBrand,
      name: newName,
      category: newCategory,
      coverage: coverageVal,
      consumptionRate,
      rate: rateVal,
      packing: newPacking,
      application: newApplication || "Apply with paintbrush or roller as directed.",
      materialType: newMaterialType || "Coating",
    };

    onAddMaterial(material);
    
    // Reset form states
    setNewName("");
    setNewApplication("");
    setNewMaterialType("");
    setShowAddForm(false);
  };

  const startEditingRate = (material: Material) => {
    setEditingRateId(material.id);
    setEditingRateValue(material.rate);
  };

  const saveEditedRate = (id: string) => {
    onUpdateMaterialRate(id, editingRateValue);
    setEditingRateId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="materials-database-card">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg" id="materials-db-title">Products & Material Engine</h3>
          <p className="text-xs text-slate-500">Auto-calculated coverage coefficients, raw packaging constraints, and real-time dealer price sheets</p>
        </div>
        <button
          id="btn-show-add-material"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shadow-sm shadow-teal-700/15"
        >
          <Plus className="w-4 h-4" /> Add New Material
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateMaterial} className="p-6 bg-slate-50 border-b border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4" id="form-add-material">
          <div className="md:col-span-3 pb-2 border-b border-slate-200/50 flex justify-between items-center">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Register Premium Product Specs</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs hover:text-slate-700 text-slate-400 font-medium"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Manufacturer Brand</label>
            <select
              id="new-material-brand"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="Asian Paints">Asian Paints</option>
              <option value="Berger">Berger</option>
              <option value="Nerolac">Nerolac</option>
              <option value="Indigo">Indigo</option>
              <option value="Dr Fixit">Dr Fixit</option>
              <option value="Pidilite">Pidilite</option>
              <option value="Sika">Sika</option>
              <option value="Fosroc">Fosroc</option>
              <option value="JK Cement">JK Cement</option>
              <option value="Birla White">Birla White</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Product Name</label>
            <input
              id="new-material-name"
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
              placeholder="e.g. Royale Shyne Extreme"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <select
              id="new-material-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as Material["category"])}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="Paint">Paint</option>
              <option value="Primer">Primer</option>
              <option value="Putty">Putty</option>
              <option value="Texture">Texture</option>
              <option value="Waterproofing">Waterproofing</option>
              <option value="Cement">Cement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Coverage Rate (Sq Ft / L or Kg)</label>
            <input
              id="new-material-coverage"
              type="number"
              required
              min="1"
              value={newCoverage}
              onChange={(e) => setNewCoverage(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Dealer Price (₹ Unit Rate)</label>
            <input
              id="new-material-rate"
              type="number"
              required
              min="1"
              value={newRate}
              onChange={(e) => setNewRate(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Packaging Specs</label>
            <input
              id="new-material-packing"
              type="text"
              value={newPacking}
              onChange={(e) => setNewPacking(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
              placeholder="e.g. 20 Liters"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Application Standard Checklist</label>
            <input
              id="new-material-app"
              type="text"
              value={newApplication}
              onChange={(e) => setNewApplication(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
              placeholder="Recommended coats count, curing time list, intervals..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Chemical Material Type</label>
            <input
              id="new-material-chem-type"
              type="text"
              value={newMaterialType}
              onChange={(e) => setNewMaterialType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-teal-500"
              placeholder="e.g. Elastomeric Polymer"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 pt-2">
            <button
              type="submit"
              id="btn-material-submit"
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Register Material Specs
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="search-materials-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-teal-500"
            placeholder="Search material database by product name, chemical type, categories..."
          />
        </div>

        {/* Brand Selector */}
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Filter className="w-3 h-3" /> Manufacture:
          </span>
          <div className="flex gap-1 overflow-x-auto py-1 max-w-[280px] sm:max-w-none">
            {brands.slice(0, 7).map((brand) => (
              <button
                id={`btn-brand-${brand.replace(/\s+/g, "-")}`}
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  selectedBrand === brand ? "bg-teal-700 text-white" : "bg-white hover:bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 overflow-x-auto min-w-[120px]">
          <select
            id="select-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 text-xs rounded-xl py-2 px-3 font-medium text-slate-600 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.filter(c => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="materials-grid-container">
        {filteredMaterials.map((material) => (
          <div
            id={`material-card-${material.id}`}
            key={material.id}
            className="bg-white border border-slate-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-md hover:shadow-teal-900/[0.02] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {material.category}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {material.packing} Pack
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-sm leading-snug mb-1">{material.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium mb-3">{material.brand} • {material.materialType}</p>

              <div className="bg-slate-50/70 rounded-lg p-2.5 space-y-1.5 text-[11px] mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Coverage capacity:</span>
                  <span className="font-semibold text-slate-700 font-mono">{material.coverage} SqFt/Unit</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Consumption multiplier:</span>
                  <span className="font-semibold text-slate-700 font-mono">{material.consumptionRate} Unit/SqFt</span>
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-200/50 pt-1.5 mt-1 leading-relaxed">
                  <span className="font-bold uppercase text-[9px] text-teal-700">Guide: </span>
                  {material.application}
                </div>
              </div>
            </div>

            {/* Price Edit section */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-slate-400 text-xs">Contractor Rate:</span>
              <div className="flex items-center gap-1.5">
                {editingRateId === material.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-800">₹</span>
                    <input
                      id={`edit-rate-input-${material.id}`}
                      type="number"
                      value={editingRateValue}
                      onChange={(e) => setEditingRateValue(Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                    />
                    <button
                      id={`btn-save-rate-${material.id}`}
                      onClick={() => saveEditedRate(material.id)}
                      className="bg-teal-700 hover:bg-teal-800 text-white rounded text-[10px] font-bold px-2 py-1"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-800 font-mono">₹{material.rate}</span>
                    <button
                      id={`btn-edit-rate-${material.id}`}
                      onClick={() => startEditingRate(material)}
                      className="text-slate-400 hover:text-teal-700 p-1 transition-colors"
                      title="Edit Dealer Price"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs font-medium" id="materials-no-results">
            No matching materials found inside your Product Engine database.
          </div>
        )}
      </div>
    </div>
  );
};
