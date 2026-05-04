import { getModifierGroups } from "@/app/(universal)/action/modifierGroups/dbOperation";
import ClientForm from "./ClientForm";

export default async function Page() {
  const groups = await getModifierGroups();

  return <ClientForm groups={groups} />;
}