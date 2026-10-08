import { ParsedSource } from "../types";
const num = (v: unknown) => { if (v === null || v === undefined || v === "") return 0; const n = Number(String(v).replace(/[,₹$]/g, "").replace(/INR/gi, "").trim()); return Number.isFinite(n) ? n : 0; };
function rows(source: ParsedSource | undefined, sheetName?: string) { if (!source) return []; const s = sheetName ? source.sheets.find(x => x.name.toLowerCase() === sheetName.toLowerCase()) : source.sheets.find(x => x.rows.length); return s?.rows ?? []; }
export function computeMetrics(sources: ParsedSource[]) {
  const byKey = (k: string) => sources.find(s => s.key === k);
  const po = rows(byKey("purchase_orders")); const bills = rows(byKey("bills")); const vendors = rows(byKey("vendors")); const receipts = rows(byKey("purchase_receives")); const valuation = rows(byKey("inventory_valuation"), "Inventory Valuation Summary"); const ageing = rows(byKey("inventory_ageing"), "Dump");
  const opsVendors = new Set(vendors.filter(r => /ops[\s-]*vendor/i.test(String(r["Notes"] ?? ""))).map(r => String(r["Display Name"] ?? r["Contact Name"] ?? "").trim()).filter(Boolean));
  const payables = bills.filter(r => opsVendors.has(String(r["Vendor Name"] ?? "").trim()) && !/void/i.test(String(r["Bill Status"] ?? "")));
  const payableOutstanding = payables.reduce((s,r) => s + (String(r["Bill Status"] ?? "").toLowerCase() === "paid" ? 0 : num(r["Total"])), 0);
  const overdue = payables.filter(r => /overdue/i.test(String(r["Bill Status"] ?? ""))).length;
  const poQty = po.reduce((s,r)=>s+num(r["QuantityOrdered"]),0); const receivedQty = po.reduce((s,r)=>s+num(r["QuantityReceived"]),0); const billedQty = po.reduce((s,r)=>s+num(r["QuantityBilled"]),0);
  const valuationValue = valuation.reduce((s,r)=>s+num(r["Inventory Asset Value"]),0); const ageingValue = ageing.reduce((s,r)=>s+num(r["Value"]),0); const receiptQty = receipts.reduce((s,r)=>s+num(r["Quantity Received"]),0);
  return {poLines:po.length,poQty,receivedQty,billedQty,receiptQty,receivingGap:Math.max(0,poQty-receivedQty),billingGap:Math.max(0,poQty-billedQty),opsVendorCount:opsVendors.size,payableBills:payables.length,overdueBills:overdue,payableOutstanding,valuationValue,ageingValue,sourceCount:sources.length};
}