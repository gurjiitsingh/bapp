// app/admin/stock-finished/layout.tsx

import InventoryTabs from "./components/InventoryLayout";


export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* NAV */}
      <InventoryTabs />

      {/* CONTENT */}
      <div className="p-2 md:p-4">
        {children}
      </div>
    </div>
  );
}