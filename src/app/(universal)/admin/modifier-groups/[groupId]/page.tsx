import { getModifierItemsByGroup } from "@/app/(universal)/action/modifiers/dbOperation";
import ListView from "../components/ListViewByGroup";

export default async function Page({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params; // ✅ FIX

  const items = await getModifierItemsByGroup(groupId);

  console.log("items----------",items)

  return (
    <div className="h-screen flex flex-col">
      <h1 className="text-xl font-semibold p-2">Modifier Items</h1>

      {/* pass items */}
      <ListView initialItems={items} />
    </div>
  );
}