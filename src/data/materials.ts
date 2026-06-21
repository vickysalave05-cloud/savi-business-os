import { Material } from "../types";

export const INITIAL_MATERIALS: Material[] = [
  // Asian Paints
  {
    id: "ap-royale-luxury",
    brand: "Asian Paints",
    name: "Royale Luxury Emulsion",
    category: "Paint",
    coverage: 140, // sq ft per liter, 2 coats
    consumptionRate: 0.0071, // liters per sq ft
    rate: 450, // INR per L
    packing: "20L",
    application: "Apply 2 coats of Royale Emulsion over 1 coat of acrylic primer with 3-4 hours interval.",
    materialType: "Interior Emulsion"
  },
  {
    id: "ap-apex-ultima",
    brand: "Asian Paints",
    name: "Apex Ultima Protek",
    category: "Paint",
    coverage: 65, // sq ft per liter, 2 coats
    consumptionRate: 0.0154,
    rate: 520,
    packing: "20L",
    application: "Exterior application. Direct application or over exterior primer. Highly weather resistant.",
    materialType: "Exterior Emulsion"
  },
  {
    id: "ap-acrylic-wall-putty",
    brand: "Asian Paints",
    name: "Acrylic Wall Putty",
    category: "Putty",
    coverage: 15, // sq ft per kg for 2 coats
    consumptionRate: 0.0667,
    rate: 45,
    packing: "20kg",
    application: "Apply 2 coats of putty with putty knife. Allow drying for 4-6 hours, sand with emery paper 180.",
    materialType: "Wall Putty"
  },
  
  // Berger
  {
    id: "berger-silk-glamour",
    brand: "Berger",
    name: "Silk Glamour High Sheen",
    category: "Paint",
    coverage: 130,
    consumptionRate: 0.0077,
    rate: 420,
    packing: "20L",
    application: "Ultra premium interior finish. Stir well. Apply 2 coats using standard roller.",
    materialType: "Interior Emulsion"
  },
  {
    id: "berger-weathercoat",
    brand: "Berger",
    name: "Weathercoat Long Life",
    category: "Paint",
    coverage: 70,
    consumptionRate: 0.0143,
    rate: 480,
    packing: "20L",
    application: "Silicone-grade luxury exterior paint with nanotech protection. 2 coats recommended.",
    materialType: "Exterior Emulsion"
  },

  // Nerolac
  {
    id: "nerolac-impressions",
    brand: "Nerolac",
    name: "Impressions Ultra HD",
    category: "Paint",
    coverage: 135,
    consumptionRate: 0.0074,
    rate: 410,
    packing: "20L",
    application: "High definition interior paint. Apply 2 coats over primer.",
    materialType: "Interior Emulsion"
  },
  
  // Indigo
  {
    id: "indigo-metallic-paint",
    brand: "Indigo",
    name: "Metallic Paint Series",
    category: "Texture",
    coverage: 80,
    consumptionRate: 0.0125,
    rate: 650,
    packing: "1L",
    application: "Premium textured metallic paint. Apply with decorative patterns using texture rollers.",
    materialType: "Texture Paint"
  },

  // Dr Fixit
  {
    id: "drfixit-lw-plus",
    brand: "Dr Fixit",
    name: "LW+ Waterproofing Liquid",
    category: "Waterproofing",
    coverage: 200, // as concrete additive
    consumptionRate: 0.005,
    rate: 180,
    packing: "5L",
    application: "Mix 200ml for every 50kg bag of cement. Impermeable waterproofing additive.",
    materialType: "Waterproofing Liquid"
  },
  {
    id: "drfixit-raincoat",
    brand: "Dr Fixit",
    name: "Raincoat Classic Coating",
    category: "Waterproofing",
    coverage: 35, // sqft per L for high protective build
    consumptionRate: 0.0286,
    rate: 410,
    packing: "20L",
    application: "Heavy-duty exterior waterproofing elastomeric coating. 2 thick coats directly on cured walls.",
    materialType: "Elastomeric Waterproofing Coating"
  },

  // Pidilite
  {
    id: "pidilite-fevicol-sh",
    brand: "Pidilite",
    name: "Fevicol SH Wood Adhesive",
    category: "Other",
    coverage: 100,
    consumptionRate: 0.01,
    rate: 260,
    packing: "5kg",
    application: "High strength bonding agent. Use for carpentry, lining, joint reinforcement during wood panels installation.",
    materialType: "Adhesive"
  },

  // Sika
  {
    id: "sika-latex-power",
    brand: "Sika",
    name: "Sika Latex Power Modifier",
    category: "Waterproofing",
    coverage: 80,
    consumptionRate: 0.0125,
    rate: 320,
    packing: "10L",
    application: "SBR latex synthethic modifier for waterproofing slurries and concrete bonding.",
    materialType: "Waterproofing latex"
  },

  // Fosroc
  {
    id: "fosroc-nitobond",
    brand: "Fosroc",
    name: "Nitobond AR Bonding Agent",
    category: "Waterproofing",
    coverage: 90,
    consumptionRate: 0.0111,
    rate: 340,
    packing: "20L",
    application: "Acrylic emulsion primer and modifier to bond cementitious screeds or mortars.",
    materialType: "Acrylic Bonding Agent"
  },

  // JK Cement
  {
    id: "jk-white-putty",
    brand: "JK Cement",
    name: "JK WallMaxX White Putty",
    category: "Putty",
    coverage: 16,
    consumptionRate: 0.0625,
    rate: 38,
    packing: "40kg",
    application: "White cement-based putty. Dampen surface first. Apply 2 coats, sanding afterward.",
    materialType: "Cement Base Putty"
  },

  // Birla White
  {
    id: "birla-white-cement",
    brand: "Birla White",
    name: "Birla White Universal Primer",
    category: "Primer",
    coverage: 95,
    consumptionRate: 0.0105,
    rate: 140,
    packing: "20kg",
    application: "White cement based primer providing high adhesion for premium topcoats.",
    materialType: "Cement Primer"
  },
  {
    id: "birla-classic-putty",
    brand: "Birla White",
    name: "Birla White Excel Putty",
    category: "Putty",
    coverage: 17,
    consumptionRate: 0.0588,
    rate: 42,
    packing: "40kg",
    application: "Pre-coat whitewashing surface enhancer. High-tech water-resistant putty layers.",
    materialType: "Acrylic Putty"
  }
];
