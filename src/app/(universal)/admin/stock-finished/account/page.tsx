import { getCustomerBusinessSummary } from "@/app/(universal)/action/businessData/getCustomerBusinessSummary";
import { getSupplierBusinessSummary } from "@/app/(universal)/action/businessData/getSupplierBusinessSummary";
import { fetchBusinessSummary } from "../../../action/businessData/fetchBusinessSummary";
import Dashboard from "./Dashboard";
import { getBusinessFinancialSummary } from "@/app/(universal)/action/businessData/getBusinessFinancialSummary";

export default async function Page() {

const [
  businessResult,
  customerResult,
  supplierResult,
  financialResult,
] = await Promise.all([
  fetchBusinessSummary(),
  getCustomerBusinessSummary(),
  getSupplierBusinessSummary(),
  getBusinessFinancialSummary(),
]);

// ✅ Check business summary first
if (!businessResult.success || !businessResult.data) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {businessResult.message || "Failed to load business summary."}
      </div>
    </div>
  );
}

// Then check financials
if (!financialResult.success || !financialResult.data) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {financialResult.message || "Failed to load business financials."}
      </div>
    </div>
  );
}

// Then customer
if (!customerResult.success || !customerResult.data) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {customerResult.message || "Failed to load customer summary."}
      </div>
    </div>
  );
}

// Then supplier
if (!supplierResult.success || !supplierResult.data) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {supplierResult.message || "Failed to load supplier summary."}
      </div>
    </div>
  );
}

  

  return (
   <Dashboard
  summary={businessResult.data}
  customerSummary={customerResult.data}
  supplierSummary={supplierResult.data}
  financialSummary={financialResult.data}
/>
  );
}