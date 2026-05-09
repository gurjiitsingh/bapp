import { getModifierGroupById } from "@/app/(universal)/action/modifierGroups/dbOperation";
import EditForm from "../components/EditForm";

export default async function Page(props: any) {
  const searchParams = await props.searchParams; // ✅ FIX

  const id = searchParams?.id;

  console.log("ID:", id);

  if (!id) {
    return <div className="p-5 text-red-500">Invalid ID</div>;
  }

  const group = await getModifierGroupById(id);

  if (!group) {
    return <div className="p-5">Group not found</div>;
  }

  return <EditForm group={group} />;
}