import PosTypeForm from "./components/Postype";
 
import { getOutlet } from "@/app/(universal)/action/outlet/dbOperation";
import RenewDateForm from "./components/RenewDateForm";

export default async function Page() {
  const outlet = await getOutlet();

  if (!outlet) return <div>No outlet found</div>;

  return (
    <div className="p-4 space-y-6">

      <PosTypeForm
        outletId={outlet.outletId}
        currentType={outlet.posType}
      />

    <RenewDateForm
  outletId={outlet.outletId}
  currentRenewDate={outlet.renewDate}
/>

    </div>
  );
}