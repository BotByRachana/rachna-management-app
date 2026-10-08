# Rachna Web App — actual input contract

The supplied `DASHBOARD-MAKING.zip` was profiled on 2026-10-07.

## Recognized files

| File | Main sheet | Approx. rows | Role |
|---|---|---:|---|
| 09.24.2026_INVENTORY_AGEING_REPORT.xlsx | Dump | 1,229 | Reference ageing |
| 09.24.2026_INVENTORY_VALUATION_REPORT.xlsx | Inventory Valuation Summary | 1,082 | Reference valuation |
| Assemblies (20).xlsx | Bundles | 15,922 | Assembly transactions |
| Bill (7).xlsx | Bills | 22,670 | Vendor bills/payables |
| Composite_Item.xlsx | CompositeItem | 1,707 | Composite item mapping |
| Item (2).xlsx | Item | 2,894 | Item master |
| Purchase_Order.xlsx | PurchaseOrder | 5,218 | PO lines |
| Purchase_Receive.xlsx | PurchaseReceive | 4,166 | Receipts |
| Transfer_Order (2).xlsx | Transfer Order | 8,785 | Transfers |
| Vendors (6).xlsx | Vendors | 1,552 | Vendor master |

The `DropdownData` and pivot/helper sheets are retained for diagnostics but are not treated as transactional source tables.

## Important source observations

- Vendor classification is in `Vendors.Notes`; the supplied data contains `OPS-VENDOR` and one casing variant `OPS-Vendor`.
- Bills contain `Bill Status` values including Paid, Overdue, Open and Void.
- PO status values include Billed, Draft, Partially Billed, Issued and Cancelled.
- PO lines contain ordered, received, billed and cancelled quantities.
- Purchase receipts have PO Number, Bill Number, SKU and Quantity Received.
- Inventory ageing and valuation are supplied reports and should remain reference sources unless the business confirms the transaction-level reconstruction rules.
- No B2B Sales Order or B2B Invoice export was present in this ZIP. The application therefore does not fabricate those fields.

## Header detection

The app detects the first strong header row instead of assuming row 1. This is necessary for the supplied ageing and valuation workbooks, whose first worksheet row contains report-title text rather than clean field names.

## Security

The browser prototype parses ZIP contents locally. Production mode should upload validated staging rows to Supabase using authenticated calls and RLS. Never put a service-role key in frontend code.
