 
 
import { fetchSaleMan } from "@/app/(universal)/action/distribution/saleman/fetchSaleMan";
import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";

 
import { getRouteById } from "@/app/(universal)/action/distribution/sale-route/getRouteById";
import RouteEditForm from "./RouteEditForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const route = await getRouteById(id);

  const salesman = await fetchSaleMan();

  const vehicles = await getVehicles();

  if (!route) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-6 text-red-600">
          Route not found.
        </div>
      </div>
    );
  }

  return (
    <RouteEditForm
      route={route}
      salesman={salesman}
      vehicles={vehicles}
    />
  );
}
 
