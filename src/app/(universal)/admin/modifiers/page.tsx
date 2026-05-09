
import Link from "next/link";
import ListView from "./components/ListView";
import { getModifierItemsAdmin } from "../../action/modifiers/dbOperation";

export default async function Page() {
  const items = await getModifierItemsAdmin();

  return (
    <div className="h-screen flex flex-col">

      <div className="flex justify-between p-2">
        <h1 className="text-xl font-semibold">Modifier Items</h1>

        <Link href="/admin/modifiers/create">
          <button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">
            Create
          </button>
        </Link>
      </div>

      <ListView initialItems={items} />
    </div>
  );
}