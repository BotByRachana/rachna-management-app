# Rachna Management Web App

This version is adapted to the real `DASHBOARD-MAKING.zip` sample supplied for the application.

## What is implemented

- ZIP upload in the browser
- Excel/CSV discovery
- Exact source recognition for the supplied filenames/sheets
- Header-row detection for report-style workbooks
- Source confidence and data-health warnings
- Browser-side metric preview for PO, receipt, bill, OPS-VENDOR payable and valuation data
- Optional B2B source definitions without inventing an absent schema
- Supabase staging foundation with RLS
- Relative Vite base so the static build is suitable for GitHub Pages

## Run

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
```

## Next production step

Connect the upload preview to `staging_row`, add the business-rule validation gate, then normalize into transactional tables and materialized reporting views. The supplied sample is sufficient to implement the purchase/inventory/payables side, but B2B source mappings require the actual B2B export files.

> Note: this repository is the current v2 input-contract foundation, not yet the complete production specification implementation.
