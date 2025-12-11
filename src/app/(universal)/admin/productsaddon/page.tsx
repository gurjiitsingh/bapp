"use client";

import { useSearchParams } from "next/navigation";
import ListView from "./components/ListView";
import Link from "next/link";

export default function Page() {
  const searchParams = useSearchParams();
  const baseProductId = searchParams.get("id") || "";
  return (
    <div className="h-screen flex flex-col ">
      <div className="flex gap-2 w-fit my-1">
        <div className="border rounded-xl text-slate-600 px-1 py-1">
          All Variant
        </div>
        <div>
          <Link
            //href='/admin/productsaddon/form'

            href={{
              pathname: "/admin/productsaddon/form",
              query: {
                id: baseProductId,
              },
            }}
          >
            <button className="bg-red-600 rounded-xl text-white px-1 py-1">
              Create
            </button>
          </Link>
        </div>
      </div>

      <ListView />
    </div>
  );
}
