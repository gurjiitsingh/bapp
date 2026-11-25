
import { getExpenseMasterAll } from "@/app/(universal)/action/otherExpenses/getExpenseMasterAll";
import ExpenseMasterManager from "./ExpenseMasterManager";

export default async function Page() {
  const result = await getExpenseMasterAll();

  return (
    <div className="w-full">
      <ExpenseMasterManager
        initialExpenses={result.success ? result.data : []}
      />
    </div>
  );
}
