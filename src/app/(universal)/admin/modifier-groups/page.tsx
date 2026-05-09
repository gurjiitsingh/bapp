import { Suspense } from "react";
import ListView from "./components/ListView";
import Link from "next/link";
import { getModifierGroupsAdmin } from "../../action/modifierGroups/dbOperation";

export const dynamic = "force-dynamic";
export default async function Page() {
  // ✅ Fetch on server
  const groups = await getModifierGroupsAdmin();

  return (
    <Suspense>
      <div className="h-screen flex flex-col">

        {/* Header */}
        <div className="flex justify-between p-2">
          <h1 className="text-xl font-semibold">Modifier Groups</h1>

          <Link href="/admin/modifier-groups/create">
            <button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">
              Create
            </button>
          </Link>
        </div>

        {/* ✅ PASS DATA */}
        <ListView initialGroups={groups} />
      </div>
    </Suspense>
  );
}