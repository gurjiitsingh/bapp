
import { getModifierGroups } from "@/app/(universal)/action/modifierGroups/dbOperation";
import { getModifierItemById } from "@/app/(universal)/action/modifiers/dbOperation";
import EditForm from "../components/Edit";


export default async function Page(props: any) {
  // ✅ FIX: await searchParams
  const searchParams = await props.searchParams;
  const id = searchParams?.id;

  if (!id) {
    return <div className="p-5 text-red-500">Invalid ID</div>;
  }

  // ✅ Fetch item + groups
  const item = await getModifierItemById(id);
  const groups = await getModifierGroups();

  if (!item) {
    return <div className="p-5">Modifier item not found</div>;
  }

  return <EditForm item={item} groups={groups || []} />;
}