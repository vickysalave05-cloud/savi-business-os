import { Customer, Campaign, FollowUpTask, TimelineEntry } from "../types";

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-summer-classic",
    title: "Savi Summer Care Offer - 15% Off",
    type: "Summer Special",
    messageTemplate: "Hello [Customer Name]! Is your home summer-ready? Save 15% on premium interior painting services with Savi Painting. Our expert crew will give your home a luxurious makeover with Asian Paints Royale Luxury Emulsion. Direct Link: [Link] - Savi Painting Pune.",
    discountValue: "15%",
    targetCount: 45,
    deliveredCount: 45,
    clickedCount: 22,
    respondedCount: 14,
    interestedCount: 8,
    createdAt: "2026-05-10T10:00:00Z"
  },
  {
    id: "camp-monsoon-waterproofing",
    title: "Monsoon Anti-Damp Shield 20% Off",
    type: "Monsoon Waterproofing",
    messageTemplate: "Urgent Monsoon Alert, [Customer Name]! Block moisture and wall seepage in Pune before heavy rains. Savi Painting is offering 20% off heavy-duty outer waterproofing using Dr. Fixit Raincoat systems. Call +91 9158000000 or click: [Link] for a FREE GPS site visit.",
    discountValue: "20%",
    targetCount: 110,
    deliveredCount: 108,
    clickedCount: 64,
    respondedCount: 41,
    interestedCount: 28,
    createdAt: "2026-06-01T09:30:00Z"
  },
  {
    id: "camp-festival-diwali",
    title: "Diwali Shubh Ghar Transformation",
    type: "Festival Offer",
    messageTemplate: "Happy Diwali prep, [Customer Name]! Invite prosperity with shiny new walls. Get pre-Diwali flat 10% discount on entire textured walls or luxury paints from Berger Silk Glamour. Book visual preview slot now: [Link].",
    discountValue: "10% + Free Texture Wall",
    targetCount: 0,
    deliveredCount: 0,
    clickedCount: 0,
    respondedCount: 0,
    interestedCount: 0,
    createdAt: "2026-06-15T15:45:00Z"
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-pratik",
    name: "Pratik Deshmukh",
    mobile: "+91 9876543210",
    email: "pratik.desh@gmail.com",
    dateCreated: "2026-06-21T08:00:00Z", // Today morning
    source: "Facebook",
    remarks: "Saw our Facebook Ad on Summer Makeover. Thinks his living room has cracks and wants standard scraping + wallpaper or high sheen paint.",
    locationAddress: "Flat 402, Shivneri Society, Kothrud, Pune",
    isRegisteredCustomer: true,
    ledger: {
      totalBilled: 0,
      totalPaid: 0,
      balanceDue: 0,
      payments: []
    },
    finalQuotations: [],
    invoices: [],
    timeline: [
      {
        id: "t-1",
        timestamp: "2026-06-21T08:00:00Z",
        action: "Lead Created",
        description: "Lead captured automatically via Meta Facebook Ads API for Kothrud area.",
        icon: "UserPlus",
        user: "System"
      }
    ],
    whatsAppLogs: [
      {
        id: "w-1",
        timestamp: "2026-06-21T08:05:00Z",
        messageType: "Welcome Intro",
        messageText: "Hello Pratik Deshmukh, thank you for inquiring with Savi Painting. Our expert estimator will contact you shortly to schedule a GPS site visit.",
        status: "Delivered"
      }
    ],
    campaigns: []
  },
  {
    id: "cust-unknown-1",
    name: "Unknown Inquiry",
    mobile: "+91 9988776655",
    dateCreated: "2026-06-20T11:22:00Z", // Yesterday
    source: "Instagram",
    remarks: "Sent a DM containing a screenshot of premium metallic paint. Just asked 'price per sq ft?' but hasn't responded with name yet.",
    locationAddress: "Bavdhan, Pune",
    isRegisteredCustomer: false,
    ledger: {
      totalBilled: 0,
      totalPaid: 0,
      balanceDue: 0,
      payments: []
    },
    finalQuotations: [],
    invoices: [],
    timeline: [
      {
        id: "t-2",
        timestamp: "2026-06-20T11:22:00Z",
        action: "Inquiry Captured",
        description: "WhatsApp/Instagram Direct Inquiry with unknown name. Stored temporarily to keep historical trail.",
        icon: "HelpCircle",
        user: "System"
      }
    ],
    whatsAppLogs: [],
    campaigns: []
  },
  {
    id: "cust-ramesh",
    name: "Ramesh Shinde",
    mobile: "+91 7766554433",
    email: "ramesh.shinde@outlook.com",
    dateCreated: "2026-06-19T14:30:00Z",
    source: "WhatsApp",
    remarks: "Requires urgent waterproofing for external walls on multi-floor home. Seepage visible in bedroom ceiling.",
    locationAddress: "Survey 42, Sinhagad Road, Wadgaon Budruk, Pune",
    isRegisteredCustomer: true,
    siteVisit: {
      location: {
        latitude: 18.4612,
        longitude: 73.8189,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=18.4612,73.8189",
        capturedAt: "2026-06-20T11:30:00Z"
      },
      media: [
        {
          id: "m-1",
          type: "photo",
          name: "living_room_ceiling_seepage.jpg",
          url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
          timestamp: "2026-06-20T11:32:00Z"
        },
        {
          id: "m-2",
          type: "voice",
          name: "voice_note_sinhagad_site_structural.wav",
          url: "#",
          timestamp: "2026-06-20T11:34:00Z"
        }
      ],
      notes: "Heavy dampness originating from building external parapet. Standard Dr Fixit classic elastomeric coating is highly recommended to bridge hair cracks. Structure requires scraping of loose plaster first.",
      visitDate: "2026-06-20T11:30:00Z"
    },
    roughEstimate: {
      approxArea: 1800,
      workType: "Waterproofing",
      approxRate: 50,
      totalEstimate: 90000,
      minRange: 82000,
      maxRange: 98000,
      customerBudget: 100000,
      budgetComparison: "Under Budget",
      sharedAt: "2026-06-20T11:45:00Z"
    },
    ledger: {
      totalBilled: 0,
      totalPaid: 0,
      balanceDue: 0,
      payments: []
    },
    finalQuotations: [],
    invoices: [],
    timeline: [
      {
        id: "t-3",
        timestamp: "2026-06-19T14:30:00Z",
        action: "Lead Created",
        description: "Inquiry captured from WhatsApp message string.",
        icon: "UserPlus",
        user: "System"
      },
      {
        id: "t-4",
        timestamp: "2026-06-20T11:30:00Z",
        action: "Site Visit Captured",
        description: "Site visits completed. Recorded GPS Coordinates, 1 photos, and 1 voice record.",
        icon: "MapPin",
        user: "Estimator"
      },
      {
        id: "t-5",
        timestamp: "2026-06-20T11:45:00Z",
        action: "Rough Estimate Shared",
        description: "Sent instant rough estimate of ₹90,000 via WhatsApp. Budget verified.",
        icon: "FileSpreadsheet",
        user: "Estimator"
      }
    ],
    whatsAppLogs: [
      {
        id: "w-2",
        timestamp: "2026-06-20T11:45:00Z",
        messageType: "Rough Estimate",
        messageText: "Savi Painting Rough Quotation Range for Ramesh Shinde: WaterProofing work for ~1800 sq ft is estimated between ₹82,000 to ₹98,000 (Avg: ₹90,000). Your budget is ₹1,00,000 (Within Limits). Approved? Click [Link] to schedule final estimation.",
        status: "Delivered"
      }
    ],
    campaigns: []
  },
  {
    id: "cust-sneha",
    name: "Dr. Sneha Patil",
    mobile: "+91 9123456789",
    email: "sneha.patil@rediffmail.com",
    dateCreated: "2026-06-18T10:15:00Z",
    source: "Google Ads",
    remarks: "Premium dental clinic renovation. High sheen paint, minimal Odor, premium materials required. Work has to be finished over a weekend.",
    locationAddress: "Opposite Orchid School, Baner, Pune",
    isRegisteredCustomer: true,
    siteVisit: {
      location: {
        latitude: 18.5583,
        longitude: 73.7915,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=18.5583,73.7915",
        capturedAt: "2026-06-18T16:00:00Z"
      },
      media: [],
      notes: "Clinic interior measuring 1200 sq ft. Needs premium odor-free Royale paint. Surfaces are flat and in good shape - minimal putty needed, light sanding and premium primer is sufficient.",
      visitDate: "2026-06-18T16:00:00Z"
    },
    roughEstimate: {
      approxArea: 1200,
      workType: "Interior Paint",
      approxRate: 40,
      totalEstimate: 48000,
      minRange: 45000,
      maxRange: 52000,
      customerBudget: 50000,
      budgetComparison: "Within Budget",
      sharedAt: "2026-06-18T16:15:00Z"
    },
    finalQuotations: [
      {
        id: "q-sneha-101",
        quotationNumber: "SAVI-Q-2026-1002",
        createdAt: "2026-06-19T11:00:00Z",
        items: [
          {
            id: "qi-1",
            name: "Premium Scraping (Clean clinical layout)",
            category: "Scraping",
            quantity: 1200,
            rate: 6,
            amount: 7200
          },
          {
            id: "qi-2",
            name: "Wall Primer (Internal acrylic Base)",
            category: "Primer",
            materialId: "birla-white-cement",
            materialBrand: "Birla White",
            quantity: 1200,
            rate: 11,
            amount: 13200
          },
          {
            id: "qi-3",
            name: "Asian Paints Royale Luxury Emulsion (Liters)",
            category: "Paint",
            materialId: "ap-royale-luxury",
            materialBrand: "Asian Paints",
            quantity: 1200,
            rate: 18,
            amount: 21600
          },
          {
            id: "qi-4",
            name: "Contractor Labour (Eco-safety standards)",
            category: "Labour",
            quantity: 1200,
            rate: 12,
            amount: 14400
          },
          {
            id: "qi-5",
            name: "Transportation & Scaffolding bundle",
            category: "Transport",
            quantity: 1,
            rate: 3000,
            amount: 3000
          }
        ],
        subtotal: 59400,
        discountPercent: 10,
        discountAmount: 5940,
        gstPercent: 18,
        gstAmount: 9622.8,
        profitMarginPercent: 15,
        profitMarginAmount: 8910,
        finalAmount: 63082.8,
        status: "Sent",
        terms: [
          "Work starts after agreed advance payment (40% advance).",
          "Additional work outside approved quotation is chargeable.",
          "Disputes subject to Pune jurisdiction."
        ]
      }
    ],
    ledger: {
      totalBilled: 0,
      totalPaid: 0,
      balanceDue: 0,
      payments: []
    },
    invoices: [],
    timeline: [
      {
        id: "t-6",
        timestamp: "2026-06-18T10:15:00Z",
        action: "Lead Created",
        description: "Google Ads web click converted to automated lead form.",
        icon: "UserPlus",
        user: "System"
      },
      {
        id: "t-7",
        timestamp: "2026-06-18T16:00:00Z",
        action: "Site Visit Captured",
        description: "Estimation completed on Baner dental clinic site.",
        icon: "MapPin",
        user: "Estimator"
      },
      {
        id: "t-8",
        timestamp: "2026-06-19T11:00:00Z",
        action: "Quotation Generated",
        description: "Final comprehensive quotation SAVI-Q-2026-1002 generated for ₹63,082.",
        icon: "FileText",
        user: "Office Clerk"
      }
    ],
    whatsAppLogs: [
      {
        id: "w-3",
        timestamp: "2026-06-19T11:05:00Z",
        messageType: "Quotation Sent",
        messageText: "Savi Painting Quotation SAVI-Q-2026-1002 for ₹63,082 has been prepared. Review details and approve instantly here: [Link]. Contact us layout inquiries.",
        status: "Delivered"
      }
    ],
    campaigns: []
  },
  {
    id: "cust-rajesh",
    name: "Rajesh Kulkarni",
    mobile: "+91 9345678901",
    email: "rajesh.kulkarni@hotmail.com",
    dateCreated: "2026-06-15T09:00:00Z",
    source: "Reference",
    remarks: "Owner of a beautiful villa in Bavdhan. Needs 3 rooms painted with designer textures in the master bedroom, simple luxury colors elsewhere. Referred by previous client Anil Gaikwad.",
    locationAddress: "Rowhouse No. 5, Silver Oak Villas, Bavdhan, Pune",
    isRegisteredCustomer: true,
    siteVisit: {
      location: {
        latitude: 18.5089,
        longitude: 73.7745,
        googleMapsLink: "https://www.google.com/maps/search/?api=1&query=18.5089,73.7745",
        capturedAt: "2026-06-15T15:00:00Z"
      },
      media: [],
      notes: "Villa in clean state. Requires premium Berger Silk Glamour on walls + 1 designer texture wall using Indigo Metallic highlights.",
      visitDate: "2026-06-15T15:00:00Z"
    },
    roughEstimate: {
      approxArea: 2400,
      workType: "Interior Paint",
      approxRate: 45,
      totalEstimate: 108000,
      minRange: 99000,
      maxRange: 115000,
      customerBudget: 120000,
      budgetComparison: "Under Budget",
      sharedAt: "2026-06-15T15:30:00Z"
    },
    finalQuotations: [
      {
        id: "q-rajesh-401",
        quotationNumber: "SAVI-Q-2026-1001",
        createdAt: "2026-06-16T10:00:00Z",
        items: [
          {
            id: "qi-11",
            name: "Sanding & Putty layers (Birla classic Excel)",
            category: "Putty",
            materialId: "birla-classic-putty",
            materialBrand: "Birla White",
            quantity: 2400,
            rate: 10,
            amount: 24000
          },
          {
            id: "qi-12",
            name: "Berger Silk Glamour Interior High Sheen",
            category: "Paint",
            materialId: "berger-silk-glamour",
            materialBrand: "Berger",
            quantity: 2400,
            rate: 16,
            amount: 38400
          },
          {
            id: "qi-13",
            name: "Indigo Metallic Texture (Feature designer wall)",
            category: "Texture",
            materialId: "indigo-metallic-paint",
            materialBrand: "Indigo",
            quantity: 350,
            rate: 45,
            amount: 15750
          },
          {
            id: "qi-14",
            name: "Experienced Artisan Labour Team",
            category: "Labour",
            quantity: 2400,
            rate: 11,
            amount: 26400
          }
        ],
        subtotal: 104550,
        discountPercent: 5,
        discountAmount: 5227.5,
        gstPercent: 18,
        gstAmount: 17878.05,
        profitMarginPercent: 20,
        profitMarginAmount: 20910,
        finalAmount: 117200.55,
        status: "Approved",
        terms: [
          "Work starts after agreed advance payment (40% advance).",
          "Additional work outside approved quotation is chargeable.",
          "Customer must inspect work before final settlement.",
          "Disputes subject to Pune jurisdiction."
        ]
      }
    ],
    approval: {
      customerName: "Rajesh Kulkarni",
      mobile: "+91 9345678901",
      quotationId: "q-rajesh-401",
      quotationNumber: "SAVI-Q-2026-1001",
      amount: 117200.55,
      date: "2026-06-17",
      time: "14:35",
      source: "WhatsApp Approval Portal",
      method: "Click to Approve",
      whatsappConfirmation: "I, Rajesh Kulkarni, approve quotation SAVI-Q-2026-1001 for ₹117,200.55. I agree to the quotation scope, pricing, payment schedule and terms & conditions. Date: 17 June 2026.",
      remarks: "Agreed on starting project on 20th June 2026. Custom texture selection is final."
    },
    // Auto-Converted fields!
    project: {
      id: "proj-rajesh-001",
      startDate: "2026-06-20T08:00:00Z",
      status: "In Progress",
      notes: "Scraping completed. Putty coating in progress. Texture layout designer scheduled for Monday morning."
    },
    ledger: {
      totalBilled: 117200.55,
      totalPaid: 45000, // Paid 40% advance
      balanceDue: 72200.55,
      payments: [
        {
          id: "p-rajesh-1",
          amount: 45000,
          date: "2026-06-18T11:00:00Z",
          mode: "UPI",
          referenceNo: "UPI95180029318",
          remarks: "40% Project Start Advance Payment"
        }
      ]
    },
    invoices: [
      {
        id: "inv-rajesh-001",
        invoiceNumber: "SAVI-INV-2026-1001",
        quotationId: "q-rajesh-401",
        createdAt: "2026-06-17T15:00:00Z",
        dueDate: "2026-06-25T18:00:00Z",
        status: "Issued",
        items: [
          {
            id: "ivi-1",
            description: "Contracting cost as per approved SAVI-Q-2026-1001 (Advance + milestone-1)",
            amount: 117200.55
          }
        ],
        subtotal: 104550,
        gstAmount: 17878.05,
        finalAmount: 117200.55,
        terms: [
          "Work starts after agreed advance payment.",
          "Additional work outside approved quotation is chargeable.",
          "Final payment signifies acceptance of completed work.",
          "Disputes subject to Pune jurisdiction."
        ],
        payments: [
          {
            id: "p-rajesh-1",
            amount: 45000,
            date: "2026-06-18T11:00:00Z",
            mode: "UPI",
            referenceNo: "UPI95180029318",
            remarks: "40% Project Start Advance Payment"
          }
        ]
      }
    ],
    timeline: [
      {
        id: "t-11",
        timestamp: "2026-06-15T09:00:00Z",
        action: "Lead Created",
        description: "Reference client created by system under referral system.",
        icon: "UserPlus",
        user: "Office Clerk"
      },
      {
        id: "t-12",
        timestamp: "2026-06-15T15:00:00Z",
        action: "Site Visit Captured",
        description: "GPS Coordinates and texture design preferences saved permanently.",
        icon: "MapPin",
        user: "Estimator"
      },
      {
        id: "t-13",
        timestamp: "2026-06-16T10:00:00Z",
        action: "Quotation Sent",
        description: "Final Quotation SAVI-Q-2026-1001 (₹ 1,17,200.55) generated & compiled.",
        icon: "FileText",
        user: "System"
      },
      {
        id: "t-14",
        timestamp: "2026-06-17T14:35:00Z",
        action: "Quotation Approved",
        description: "Customer Rajesh Kulkarni approved quotation via digital portal. Generated audit footprint.",
        icon: "ShieldCheck",
        user: "Customer"
      },
      {
        id: "t-15",
        timestamp: "2026-06-17T15:00:00Z",
        action: "Agreement & Invoice Generated",
        description: "Integrated invoice SAVI-INV-2026-1001 automatically drafted and timeline updated.",
        icon: "Receipt",
        user: "System"
      },
      {
        id: "t-16",
        timestamp: "2026-06-18T11:00:00Z",
        action: "Payment Received",
        description: "Advanced money of ₹45,000 received via UPI ref UPI95180029318. Ledger credited.",
        icon: "CreditCard",
        user: "Office Clerk"
      },
      {
        id: "t-17",
        timestamp: "2026-06-20T08:00:00Z",
        action: "Project Started",
        description: "Artisan team deployed. Scaffold established on-site. Scraping in progress.",
        icon: "Briefcase",
        user: "Project Head"
      }
    ],
    whatsAppLogs: [
      {
        id: "w-11",
        timestamp: "2026-06-16T10:02:00Z",
        messageType: "Quotation Sent",
        messageText: "Hello Rajesh Kulkarni, review quotation SAVI-Q-2026-1001 here...",
        status: "Delivered"
      },
      {
        id: "w-12",
        timestamp: "2026-06-18T11:15:00Z",
        messageType: "Payment Acknowledgment",
        messageText: "Savi Painting thanks you! We have received your advance payment of ₹45,000 for quotation SAVI-Q-2026-1001.",
        status: "Delivered"
      }
    ],
    campaigns: []
  }
];

export const INITIAL_FOLLOWUPS = (customers: Customer[]): FollowUpTask[] => {
  // Let's generate dynamic followups based on customer scenarios
  // Inquiry: 1 day old needs followup
  // Sent quotation: 2 days old needs followup
  return [
    {
      id: "f-1",
      customerId: "cust-pratik",
      customerName: "Pratik Deshmukh",
      customerMobile: "+91 9876543210",
      type: "Lead Response",
      dueDate: "2026-06-22", // Tomorrow
      status: "Today",
      description: "Call Pratik to schedule physical site visit. Interested in premium interior high sheen."
    },
    {
      id: "f-2",
      customerId: "cust-unknown-1",
      customerName: "Unknown Inquiry",
      customerMobile: "+91 9988776655",
      type: "Lead Response",
      dueDate: "2026-06-21", // Today
      status: "Today",
      description: "Reply on Instagram/WhatsApp to request physical location and name."
    },
    {
      id: "f-3",
      customerId: "cust-sneha",
      customerName: "Dr. Sneha Patil",
      customerMobile: "+91 9123456789",
      type: "Quotation Reminder",
      dueDate: "2026-06-21", // Today
      status: "Pending",
      description: "Quotation SAVI-Q-2026-1002 sent on June 19th. Needs reminder review. Clinic opens tomorrow."
    }
  ];
};
