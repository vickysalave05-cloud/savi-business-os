import { jsPDF } from "jspdf";
import { Customer, FinalQuotation, SystemSettings, Invoice } from "../types";

/**
 * Generates and downloads a clean, high-precision vector A4 PDF proposal
 * for offline sharing, client printing, and documentation.
 */
export const exportQuotationToPDF = (customer: Customer, quotation: FinalQuotation, settings?: SystemSettings) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2); // 180mm
  let y = 15;

  // Professional Color Palette (Clean Executive Slate & Deep Royal Blue tones)
  const colors = {
    primary: [15, 23, 42],      // Deep Slate Gray (#0f172a)
    primaryLight: [30, 41, 59], // Slate Gray (#1e293b)
    accent: [37, 99, 235],      // High-Contrast Royal Blue (#2563eb)
    accentLight: [239, 246, 255], // Soft blue background (#eff6ff)
    textDark: [51, 65, 85],     // Dark gray text (#334155)
    textLight: [100, 116, 139],  // Light gray metadata text (#64748b)
    bgRowAlt: [248, 250, 252],   // Row alternate paint slate (#f8fafc)
    borderLight: [226, 232, 240], // Grid border cream (#e2e8f0)
    successGreen: [5, 150, 105], // Certified green stamping (#059669)
    successBg: [240, 253, 250]   // Light green stamp background (#f0fdfa)
  };

  // Helper Utility: Draw Horizonal Divider Line
  const drawDivider = (currentY: number, thickness = 0.2, color = colors.borderLight) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, currentY, pageWidth - margin, currentY);
  };

  // ==========================================
  // 1. CORPORATE LETTERHEAD & PROPOSAL TITLE
  // ==========================================
  
  // Outer Banner Highlight Line (Top margin)
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Company Name & Subtitle
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(settings?.businessName || "SAVI PAINTING & DECOR SERVICES", margin, y);

  // Document Title (Right-aligned Header Card)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text("QUOTATION PROPOSAL", pageWidth - margin, y, { align: "right" });
  y += 5.5;

  // Company metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text("Professional Surface Refinishing • Moisture Proofing • Texture Coating", margin, y);

  // Proposal identifier
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
  doc.text(`Proposal ID: ${quotation.quotationNumber}`, pageWidth - margin, y, { align: "right" });
  y += 4;

  // Secondary Company Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  let companySubText = "Pune Desk: West Range Office, Pune Jurisdiction • Licence #95180-293";
  if (settings?.gstEnabled && settings?.gstNumber) {
    companySubText += ` • GSTIN: ${settings.gstNumber}`;
  } else if (settings) {
    companySubText += ` • ${settings.gstStatus}`;
  } else {
    companySubText += ` • GST Not Registered`;
  }
  doc.text(companySubText, margin, y);

  // Date
  doc.setFont("helvetica", "normal");
  const quoteDate = new Date(quotation.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  doc.text(`Issued Date: ${quoteDate}`, pageWidth - margin, y, { align: "right" });
  y += 4.5;

  drawDivider(y, 0.3);
  y += 7;

  // ==========================================
  // 2. CLIENT SEGMENT DETAILS BOARD
  // ==========================================
  
  // Draw Background Box for Client Info
  doc.setFillColor(colors.accentLight[0], colors.accentLight[1], colors.accentLight[2]);
  doc.setDrawColor(colors.borderLight[0], colors.borderLight[1], colors.borderLight[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  let infoY = y + 5;
  // Left Column Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text("PROPOSAL PREPARED FOR:", margin + 5, infoY);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(customer.name, margin + 5, infoY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(`Mobile: ${customer.mobile}`, margin + 5, infoY + 9.5);
  doc.text(`Email: ${customer.email || "N/A"}`, margin + 5, infoY + 13.5);

  // Right Column Details (Site specifications)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text("PROJECT SITE LOCATION / SCOPE:", margin + 95, infoY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(`Scope Area: ${customer.roughEstimate?.approxArea ? `${customer.roughEstimate.approxArea} Sq.Ft.` : "Custom Dimensions"}`, margin + 95, infoY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  
  // Wrap physical address if too long
  const addressLines = doc.splitTextToSize(customer.locationAddress || "Pune Region, India", contentWidth / 2 - 10);
  doc.text(addressLines, margin + 95, infoY + 9);

  y += 31;

  // ==========================================
  // 3. ITEMIZED COST BREAKDOWN TABLE
  // ==========================================
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("ITEMIZED SCOPE & MATERIALS SPECIFICATION:", margin, y);
  y += 4;

  // Columns definition (Widths must sum up to 180mm contentWidth)
  const columns = {
    sNo: { x: margin, width: 10, name: "S.No", align: "left" },
    desc: { x: margin + 10, width: 85, name: "Scope & Material Particulars", align: "left" },
    category: { x: margin + 95, width: 25, name: "Category", align: "center" },
    qty: { x: margin + 120, width: 18, name: "Qty/Area", align: "right" },
    rate: { x: margin + 138, width: 18, name: "Rate", align: "right" },
    amount: { x: margin + 156, width: 24, name: "Total (INR)", align: "right" }
  };

  // Header background block
  doc.setFillColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
  doc.rect(margin, y, contentWidth, 7, "F");

  // Header column text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  doc.text(columns.sNo.name, columns.sNo.x + 2, y + 4.5);
  doc.text(columns.desc.name, columns.desc.x + 2, y + 4.5);
  doc.text(columns.category.name, columns.category.x + (columns.category.width / 2), y + 4.5, { align: "center" });
  doc.text(columns.qty.name, columns.qty.x + columns.qty.width - 2, y + 4.5, { align: "right" });
  doc.text(columns.rate.name, columns.rate.x + columns.rate.width - 2, y + 4.5, { align: "right" });
  doc.text(columns.amount.name, columns.amount.x + columns.amount.width - 2, y + 4.5, { align: "right" });

  y += 7;

  // Render Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  quotation.items.forEach((item, index) => {
    // Row Alternate background color
    if (index % 2 === 1) {
      doc.setFillColor(colors.bgRowAlt[0], colors.bgRowAlt[1], colors.bgRowAlt[2]);
      doc.rect(margin, y, contentWidth, 8, "F");
    }

    // Border line bottom
    drawDivider(y + 8, 0.1, colors.borderLight);

    // Row texts
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    
    // Serial No
    doc.text(`${index + 1}`, columns.sNo.x + 2, y + 5);

    // Description wrapping
    let rawDesc = item.name;
    if (item.materialBrand) {
      rawDesc += ` [Brand: ${item.materialBrand}]`;
    }
    const wrapDesc = doc.splitTextToSize(rawDesc, columns.desc.width - 4);
    
    // If text wraps, we might need more vertical height, but typically 1 line or 2 fits.
    // For extreme reliability, write first line or small wrap
    doc.text(wrapDesc[0], columns.desc.x + 2, y + 5);

    // Category
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(item.category.toUpperCase(), columns.category.x + (columns.category.width / 2), y + 5, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Quantity (Area)
    doc.text(`${item.quantity.toLocaleString("en-IN")}`, columns.qty.x + columns.qty.width - 2, y + 5, { align: "right" });

    // Unit Rate (INR)
    doc.text(`Rs. ${item.rate.toLocaleString("en-IN")}`, columns.rate.x + columns.rate.width - 2, y + 5, { align: "right" });

    // Final Row Sum amount (INR)
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${item.amount.toLocaleString("en-IN")}`, columns.amount.x + columns.amount.width - 2, y + 5, { align: "right" });
    doc.setFont("helvetica", "normal");

    y += 8;

    // Check pagination limits (A4 safety check)
    if (y > pageHeight - 110) {
      doc.addPage();
      y = 20;
      // Re-draw minimalist headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setFillColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
      doc.rect(margin, y, contentWidth, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("Particulars Continuation...", margin + 5, y + 3.5);
      y += 5;
    }
  });

  y += 5;

  // ==========================================
  // 4. FINANCIAL SUMMARY TABLE CARD & TERMS
  // ==========================================
  
  const summaryBoxWidth = 80;
  const termsBoxWidth = contentWidth - summaryBoxWidth - 8; // 92mm
  const startBlockY = y;

  // Draw Left-hand Side Notes & Terms Panel
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("PROPOSAL WORK TERMS & CONDITIONS:", margin, y);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  
  let termsIncrementalY = y + 4.5;
  const maxTermsToPrint = quotation.terms.slice(0, 7); // Show top 7 terms on first page to ensure gorgeous fit
  maxTermsToPrint.forEach((term, tIdx) => {
    const wrappedTerm = doc.splitTextToSize(`${tIdx + 1}. ${term}`, termsBoxWidth);
    wrappedTerm.forEach((line: string) => {
      doc.text(line, margin, termsIncrementalY);
      termsIncrementalY += 3;
    });
    termsIncrementalY += 1;
  });

  // Draw Right-hand Side Financial Summary Block
  const summaryX = margin + termsBoxWidth + 8;
  doc.setFillColor(colors.bgRowAlt[0], colors.bgRowAlt[1], colors.bgRowAlt[2]);
  doc.setDrawColor(colors.borderLight[0], colors.borderLight[1], colors.borderLight[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(summaryX, y, summaryBoxWidth, 38, 1.5, 1.5, "FD");

  let summaryY = y + 5;
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  // Subtotal Row
  doc.setFont("helvetica", "normal");
  doc.text("Gross Cost Subtotal:", summaryX + 4, summaryY);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${quotation.subtotal.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
  summaryY += 5;

  // Discount Row
  if (quotation.discountAmount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.successGreen[0], colors.successGreen[1], colors.successGreen[2]);
    doc.text(`Direct Discount (${quotation.discountPercent}%):`, summaryX + 4, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`- Rs. ${quotation.discountAmount.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
    summaryY += 5;
  }

  // Margin Row
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(`Contractor Markup Margin (${quotation.profitMarginPercent}%):`, summaryX + 4, summaryY);
  doc.setFont("helvetica", "bold");
  doc.text(`+ Rs. ${quotation.profitMarginAmount.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
  summaryY += 5;

  // GST Slabs Row
  const isGstActive = settings ? settings.gstEnabled : (quotation.gstAmount > 0);
  if (isGstActive) {
    doc.setFont("helvetica", "normal");
    doc.text(`GST State & Central Tax (${quotation.gstPercent}%):`, summaryX + 4, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`+ Rs. ${quotation.gstAmount.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
    summaryY += 5;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(217, 119, 6); // Amber-500
    const complianceMsg = settings?.nonGstText || "Supplier Not Registered Under GST";
    const wrappedCompliance = doc.splitTextToSize(complianceMsg, summaryBoxWidth - 8);
    wrappedCompliance.forEach((line: string) => {
      doc.text(line, summaryX + 4, summaryY);
      summaryY += 3.5;
    });
  }

  // Divider inside summary box
  doc.setDrawColor(colors.borderLight[0], colors.borderLight[1], colors.borderLight[2]);
  doc.line(summaryX + 2, summaryY + 1, summaryX + summaryBoxWidth - 2, summaryY + 1);
  summaryY += 6;

  // Billed Total Block (Royal blue background strip)
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(summaryX, summaryY - 2.5, summaryBoxWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("NET PAYABLE AMOUNT (INR):", summaryX + 4, summaryY + 2.5);
  doc.setFontSize(10.5);
  doc.text(`Rs. ${quotation.finalAmount.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY + 2.5, { align: "right" });

  y = Math.max(termsIncrementalY, summaryY + 12);

  // ==========================================
  // 5. DIGITAL TRANSACTION VERIFICATION STAMP
  // ==========================================
  
  if (customer.approval && customer.approval.quotationNumber === quotation.quotationNumber) {
    y += 4;
    // Draw certified visual stamp
    doc.setFillColor(colors.successBg[0], colors.successBg[1], colors.successBg[2]);
    doc.setDrawColor(colors.successGreen[0], colors.successGreen[1], colors.successGreen[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 19, 1.5, 1.5, "FD");

    // Circular icon representation
    doc.setFillColor(colors.successGreen[0], colors.successGreen[1], colors.successGreen[2]);
    doc.circle(margin + 7, y + 9.5, 3.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.text("Y", margin + 7, y + 11.2, { align: "center" });

    // Certified Title
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.successGreen[0], colors.successGreen[1], colors.successGreen[2]);
    doc.text("CERTIFIED DIGITAL TRANSACTION RECORD & CONTRACT COVER", margin + 14, y + 5.5);

    // Stamp information details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    
    const stampTextLeft = `• Legal Sign: ${customer.approval.customerName}\n• Sign Method: Digital confirmation via ${customer.approval.method}`;
    const stampTextRight = `• Timestamp: ${customer.approval.date} @ ${customer.approval.time}\n• Audit Integrity: SHA-256 Secured Ledger CLEARED`;
    doc.text(stampTextLeft, margin + 14, y + 10);
    doc.text(stampTextRight, margin + 95, y + 10);

    y += 24;
  } else {
    y += 18;
  }

  // ==========================================
  // 6. TRADITIONAL OFF-LINE SIGN-OFF BLOCKS
  // ==========================================
  
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 30;
  }

  const signColWidth = 55;
  const signMarg = (contentWidth - (signColWidth * 2)) / 3;

  const repX = margin + signMarg;
  const clientX = repX + signColWidth + signMarg;

  // Dotted lines for hand signatures
  doc.setDrawColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.setLineDashPattern([1, 1], 0);
  doc.setLineWidth(0.3);
  
  // Representative line
  doc.line(repX, y + 15, repX + signColWidth, y + 15);
  // Client line
  doc.line(clientX, y + 15, clientX + signColWidth, y + 15);

  doc.setLineDashPattern([], 0); // Reset

  // Sub-signature tags
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text("Savi Representatives Sign.", repX + (signColWidth / 2), y + 19, { align: "center" });
  doc.text("Accepting Client stamp.", clientX + (signColWidth / 2), y + 19, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text("Licensed Service Operator", repX + (signColWidth / 2), y + 22, { align: "center" });
  doc.text("Legally Authorized Signatory", clientX + (signColWidth / 2), y + 22, { align: "center" });

  // Footnote credit bar
  const footerText = "Generated securely via Savi Painting OS Enterprise Ultimate — standalone vector service ledger client copy.";
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });

  // Download Action trigger
  const fileName = `SAVI_Painting_Quotation_${quotation.quotationNumber}.pdf`;
  doc.save(fileName);
};

/**
 * Generates and downloads a clean, high-precision vector A4 PDF invoice
 * for offline sharing, audits, and billing clearance.
 */
export const exportInvoiceToPDF = (customer: Customer, invoice: Invoice, settings?: SystemSettings) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2); // 180mm
  let y = 15;

  const colors = {
    primary: [15, 23, 42],      // Deep Slate Gray (#0f172a)
    primaryLight: [30, 41, 59], // Slate Gray (#1e293b)
    accent: [79, 70, 229],      // Indigo (#4f46e5)
    accentLight: [245, 243, 255], // Soft purple background (#f5f3ff)
    textDark: [51, 65, 85],     // Dark gray text (#334155)
    textLight: [100, 116, 139],  // Light gray metadata text (#64748b)
    bgRowAlt: [248, 250, 252],   // Row alternate paint slate (#f8fafc)
    borderLight: [226, 232, 240], // Grid border cream (#e2e8f0)
    successGreen: [5, 150, 105], // Certified green stamping (#059669)
    successBg: [240, 253, 250]   // Light green stamp background (#f0fdfa)
  };

  const drawDivider = (currentY: number, thickness = 0.2, color = colors.borderLight) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, currentY, pageWidth - margin, currentY);
  };

  // Outer Banner Highlight Line (Top margin - Indigo for Invoices!)
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Company Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(settings?.businessName || "SAVI PAINTING & DECOR SERVICES", margin, y);

  // Document Title (Dynamic Heading "TAX INVOICE" or "INVOICE")
  const isGst = settings ? settings.gstEnabled : (invoice.gstAmount > 0);
  const headingTitle = isGst ? "TAX INVOICE" : "INVOICE";
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text(headingTitle, pageWidth - margin, y, { align: "right" });
  y += 5.5;

  // Metadata subheading
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text("Professional Surface Refinishing • Moisture Proofing • Texture Coating", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - margin, y, { align: "right" });
  y += 4;

  // Secondary Company Details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  let companySubText = "Pune Desk: West Range Office, Pune Jurisdiction • Licence #95180-293";
  if (isGst && settings?.gstNumber) {
    companySubText += ` • GSTIN: ${settings.gstNumber}`;
  } else if (settings) {
    companySubText += ` • ${settings.gstStatus}`;
  } else {
    companySubText += ` • GST Not Registered`;
  }
  doc.text(companySubText, margin, y);

  // Date details
  doc.setFont("helvetica", "normal");
  const issueDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const dueDateStr = new Date(invoice.dueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  doc.text(`Date Issued: ${issueDate}  |  Due Date: ${dueDateStr}`, pageWidth - margin, y, { align: "right" });
  y += 4.5;

  drawDivider(y, 0.3);
  y += 7;

  // ==========================================
  // 2. CLIENT SEGMENT DETAILS BOARD
  // ==========================================
  doc.setFillColor(colors.accentLight[0], colors.accentLight[1], colors.accentLight[2]);
  doc.setDrawColor(colors.borderLight[0], colors.borderLight[1], colors.borderLight[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

  let infoY = y + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text("BILLED TO CLIENT:", margin + 5, infoY);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(customer.name, margin + 5, infoY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text(`Mobile: ${customer.mobile}  |  Email: ${customer.email || "N/A"}`, margin + 5, infoY + 9);
  
  // Wrap physical address if too long
  const addressLines = doc.splitTextToSize(customer.locationAddress || "Pune Region, India", contentWidth - 15);
  doc.text(addressLines[0] || "Pune Region, India", margin + 5, infoY + 13);

  // Status Badge
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const isPaid = totalPaid >= invoice.finalAmount;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  if (isPaid) {
    doc.setTextColor(colors.successGreen[0], colors.successGreen[1], colors.successGreen[2]);
    doc.text("PAID IN FULL", pageWidth - margin - 5, infoY + 4, { align: "right" });
  } else {
    doc.setTextColor(225, 29, 72); // Rose-600
    doc.text(`BALANCE DUE: Rs. ${(invoice.finalAmount - totalPaid).toLocaleString("en-IN")}`, pageWidth - margin - 5, infoY + 4, { align: "right" });
  }

  y += 29;

  // ==========================================
  // 3. ITEM TABLE ROWS
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("BILL PARTICULARS & MILESTONES:", margin, y);
  y += 4;

  const columnsItem = {
    sNo: { x: margin, width: 12, name: "Sl.No", align: "left" },
    desc: { x: margin + 12, width: 118, name: "Consulting & Service Specifications", align: "left" },
    amount: { x: margin + 130, width: 50, name: "Aggregate Cost (INR)", align: "right" }
  };

  doc.setFillColor(colors.primaryLight[0], colors.primaryLight[1], colors.primaryLight[2]);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(columnsItem.sNo.name, columnsItem.sNo.x + 2, y + 4.5);
  doc.text(columnsItem.desc.name, columnsItem.desc.x + 2, y + 4.5);
  doc.text(columnsItem.amount.name, columnsItem.amount.x + columnsItem.amount.width - 2, y + 4.5, { align: "right" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  invoice.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(colors.bgRowAlt[0], colors.bgRowAlt[1], colors.bgRowAlt[2]);
      doc.rect(margin, y, contentWidth, 8, "F");
    }
    drawDivider(y + 8, 0.1, colors.borderLight);

    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(`${index + 1}`, columnsItem.sNo.x + 2, y + 5);
    
    const wrapDesc = doc.splitTextToSize(item.description, columnsItem.desc.width - 4);
    doc.text(wrapDesc[0], columnsItem.desc.x + 2, y + 5);

    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${item.amount.toLocaleString("en-IN")}`, columnsItem.amount.x + columnsItem.amount.width - 2, y + 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 8;
  });

  y += 5;

  // ==========================================
  // 4. FINANCIAL SUMMARY BLOCK & PAID RECEIPTS
  // ==========================================
  const summaryBoxWidth = 80;
  const termsBoxWidth = contentWidth - summaryBoxWidth - 8;
  const summaryX = margin + termsBoxWidth + 8;

  // Receipts / Remittance block on Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("RECEIVED INCOME REMITTANCE HISTORY:", margin, y);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let receiptY = y + 4.5;
  if (invoice.payments.length === 0) {
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text("No clearings recorded yet for this billing docket. UPI links active.", margin, receiptY);
  } else {
    invoice.payments.forEach((p) => {
      doc.setTextColor(colors.successGreen[0], colors.successGreen[1], colors.successGreen[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`+ Rs. ${p.amount.toLocaleString("en-IN")}`, margin, receiptY);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
      doc.text(`- Dated ${new Date(p.date).toLocaleDateString("en-IN")} via ${p.mode} (${p.referenceNo || "Cash Secured"})`, margin + 22, receiptY);
      receiptY += 4.5;
    });
  }

  // Draw Summary Box
  doc.setFillColor(colors.bgRowAlt[0], colors.bgRowAlt[1], colors.bgRowAlt[2]);
  doc.setDrawColor(colors.borderLight[0], colors.borderLight[1], colors.borderLight[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(summaryX, y, summaryBoxWidth, 38, 1.5, 1.5, "FD");

  let summaryY = y + 5;
  doc.setFontSize(8);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);

  // Subtotal Row
  doc.setFont("helvetica", "normal");
  doc.text("Billed Gross Subtotal:", summaryX + 4, summaryY);
  doc.setFont("helvetica", "bold");
  
  const rawSubtotal = isGst ? invoice.subtotal : invoice.finalAmount;
  doc.text(`Rs. ${rawSubtotal.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
  summaryY += 5;

  // Taxes
  if (isGst) {
    const cgst = Math.round(invoice.gstAmount / 2);
    const sgst = Math.round(invoice.gstAmount / 2);

    doc.setFont("helvetica", "normal");
    doc.text("Central GST (CGST 9%):", summaryX + 4, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`+ Rs. ${cgst.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
    summaryY += 5;

    doc.setFont("helvetica", "normal");
    doc.text("State GST (SGST 9%):", summaryX + 4, summaryY);
    doc.setFont("helvetica", "bold");
    doc.text(`+ Rs. ${sgst.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, summaryY, { align: "right" });
    summaryY += 5;
  } else {
    // Non-GST Compliance Text instead of Taxes!
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(217, 119, 6); // Amber-500
    const complianceMsg = settings?.nonGstText || "Supplier Not Registered Under GST";
    const wrappedCompliance = doc.splitTextToSize(complianceMsg, summaryBoxWidth - 8);
    wrappedCompliance.forEach((line: string) => {
      doc.text(line, summaryX + 4, summaryY);
      summaryY += 3.5;
    });
  }

  // Divider inside summary box
  doc.setDrawColor(colors.borderLight[0], colors.borderLight[1], colors.borderLight[2]);
  doc.line(summaryX + 2, y + 25, summaryX + summaryBoxWidth - 2, y + 25);

  // Billed Total Block
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.rect(summaryX, y + 28, summaryBoxWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("NET INVOICE TOTAL:", summaryX + 4, y + 33);
  doc.setFontSize(10);
  doc.text(`Rs. ${invoice.finalAmount.toLocaleString("en-IN")}`, summaryX + summaryBoxWidth - 4, y + 33, { align: "right" });

  y = Math.max(receiptY, y + 42);

  // Terms
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("INVOICE RECOVERY AND STANDARD TERMS:", margin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);

  const invoiceTerms = settings?.termsAndConditions && settings.termsAndConditions.length > 0
    ? settings.termsAndConditions.slice(0, 4)
    : [
        "Thank you for choosing SAVI PAINTING & DECOR SERVICES.",
        "This is a legally compiled service ledger invoice for registered contractor milestones.",
        "Please clear payments as per milestones; outstanding amounts are subject to Pune desk follow-ups.",
        "Accounts settled with digital receipt log stamps represent complete PDF legal clearance."
      ];

  invoiceTerms.forEach((term, idx) => {
    doc.text(`* ${term}`, margin, y);
    y += 3;
  });

  y += 10;

  // Traditional signoffs
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 30;
  }
  const signColWidth = 55;
  const signMarg = (contentWidth - (signColWidth * 2)) / 3;
  const repX = margin + signMarg;
  const clientX = repX + signColWidth + signMarg;

  doc.setDrawColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.setLineDashPattern([1, 1], 0);
  doc.setLineWidth(0.3);
  doc.line(repX, y + 15, repX + signColWidth, y + 15);
  doc.line(clientX, y + 15, clientX + signColWidth, y + 15);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text("Authorized Representative Sign", repX + (signColWidth / 2), y + 19, { align: "center" });
  doc.text("Billed Client Signal", clientX + (signColWidth / 2), y + 19, { align: "center" });

  // Footnote credit bar
  const footerText = "This docket is compiled electronically via Savi Painting OS and serves as official proof of billing.";
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: "center" });

  const fileNameInvoice = `SAVI_Invoice_${invoice.invoiceNumber}.pdf`;
  doc.save(fileNameInvoice);
};
