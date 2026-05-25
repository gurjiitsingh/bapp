// base/page.tsx

import PosTypeForm from "./components/Postype";
import { getOutlet } from "@/app/(universal)/action/outlet/dbOperation";

export default async function Page() {
  const outlet = await getOutlet();

  if (!outlet) return <div>No outlet found</div>;

  return (
    <div className="p-4">
      <PosTypeForm
        outletId={outlet.outletId}
        currentType={outlet.posType}
      />
    </div>
  );
}