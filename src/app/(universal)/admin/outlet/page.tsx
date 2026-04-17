import Link from "next/link";
import OutletListView from '@/components/admin/outlet/ListView'
export default function Page() {
  return (
    <div className="p-5 space-y-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Outlets</h1>

        <Link
          href="/admin/outlet/form"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + New Outlet
        </Link>
      </div>

      {/* LIST */}
       <OutletListView />
    </div>
  );
}