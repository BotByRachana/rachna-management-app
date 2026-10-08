import { useMemo, useState } from "react";
import { parseZip } from "./lib/parser";
import { computeMetrics } from "./lib/metrics";
import { ParsedSource } from "./types";

const money = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const qty = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export default function App() {
  const [sources, setSources] = useState<ParsedSource[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"dashboard"|"sources">("dashboard");
  const metrics = useMemo(() => computeMetrics(sources), [sources]);

  async function handleZip(file?: File) {
    if (!file) return;
    setBusy(true); setWarnings([]);
    try { const result = await parseZip(file); setSources(result.sources); setWarnings(result.warnings); }
    catch (e) { setWarnings([e instanceof Error ? e.message : "Upload failed."]); }
    finally { setBusy(false); }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div><div className="brand">Rachna Management</div><div className="subtitle">Purchase · Inventory · Payables · B2B</div></div>
        <label className="uploadButton">{busy ? "Reading ZIP…" : "Upload input ZIP"}<input type="file" accept=".zip" onChange={e => handleZip(e.target.files?.[0])} disabled={busy}/></label>
      </header>
      <nav className="nav">
        <button className={tab==="dashboard"?"active":""} onClick={()=>setTab("dashboard")}>Executive Dashboard</button>
        <button className={tab==="sources"?"active":""} onClick={()=>setTab("sources")}>Upload & Data Health</button>
      </nav>
      <main className="content">
        {warnings.length > 0 && <section className="notice warning"><strong>Data checks</strong><ul>{warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></section>}
        {tab === "dashboard" ? <>
          <div className="pageTitle"><div><h1>Executive Dashboard</h1><p>Metrics are calculated from the uploaded ZIP in the browser. No data is uploaded by this demo.</p></div><span className="pill">{metrics.sourceCount} source files recognized</span></div>
          <div className="cards">
            <Card label="PO lines" value={qty(metrics.poLines)} detail={qty(metrics.poQty) + " units ordered"} />
            <Card label="Receiving gap" value={qty(metrics.receivingGap)} detail={qty(metrics.receivedQty) + " units received"} tone={metrics.receivingGap>0?"warn":""}/>
            <Card label="Billing gap" value={qty(metrics.billingGap)} detail={qty(metrics.billedQty) + " units billed"} tone={metrics.billingGap>0?"warn":""}/>
            <Card label="OPS vendor payables" value={money(metrics.payableOutstanding)} detail={qty(metrics.payableBills) + " non-void bills"} tone={metrics.payableOutstanding>0?"warn":""}/>
            <Card label="Overdue bills" value={qty(metrics.overdueBills)} detail={qty(metrics.opsVendorCount) + " OPS-VENDOR vendors"} tone={metrics.overdueBills>0?"danger":""}/>
            <Card label="Inventory valuation" value={money(metrics.valuationValue)} detail="From valuation summary"/>
          </div>
          <section className="panel"><h2>Operational interpretation</h2><div className="grid2">
            <div><b>Purchase-to-receipt:</b> {metrics.receivingGap > 0 ? qty(metrics.receivingGap) + " ordered units are not marked received in the PO extract." : "No PO receiving gap in the supplied extract."}</div>
            <div><b>Purchase-to-bill:</b> {metrics.billingGap > 0 ? qty(metrics.billingGap) + " ordered units are not marked billed in the PO extract." : "No PO billing gap in the supplied extract."}</div>
            <div><b>Payables:</b> OPS-VENDOR is matched case-insensitively from the Vendors Notes field, including the supplied "OPS-Vendor" variation.</div>
            <div><b>Inventory:</b> Valuation and ageing are treated as supplied reports/reference sources, not silently rebuilt from transactions.</div>
          </div></section>
        </> : <>
          <div className="pageTitle"><div><h1>Upload & Data Health</h1><p>Filename + sheet recognition, header detection, row counts and warnings.</p></div></div>
          {sources.length === 0 ? <div className="empty">Upload <b>DASHBOARD-MAKING.zip</b> or another ZIP with the same source format.</div> :
            <div className="tableWrap"><table><thead><tr><th>Source</th><th>File</th><th>Confidence</th><th>Sheets</th><th>Rows</th><th>Warnings</th></tr></thead>
            <tbody>{sources.map(s=><tr key={s.key}><td><b>{s.key}</b></td><td>{s.fileName}</td><td>{Math.round(s.confidence*100)}%</td><td>{s.sheets.map(x=>x.name).join(", ")}</td><td>{s.sheets.reduce((n,x)=>n+x.rows.length,0).toLocaleString("en-IN")}</td><td>{s.warnings.length ? s.warnings.join(" ") : "OK"}</td></tr>)}</tbody></table></div>}
          <section className="panel"><h2>Sources not supplied in this sample</h2><p>B2B Sales Orders and B2B Invoices are intentionally optional until their actual export formats are provided. The application will not invent their schema.</p></section>
        </>}
      </main>
      <footer>Rachna Management App · v2 input-contract prototype</footer>
    </div>
  );
}
function Card({label,value,detail,tone=""}:{label:string,value:string,detail:string,tone?:string}) {
  return <div className={"card " + tone}><div className="cardLabel">{label}</div><div className="cardValue">{value}</div><div className="cardDetail">{detail}</div></div>
}