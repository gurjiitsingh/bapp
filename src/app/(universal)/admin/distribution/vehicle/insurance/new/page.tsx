import { adminDb } from "@/lib/firebaseAdmin";
import VehicleInsuranceForm from "./VehicleInsuranceForm";
 
 

export default async function NewVehicleInsurancePage() {
 
      const vehiclesSnap = await adminDb
    .collection("stockLocations")
    .where("active", "==", true)
    .get();

  const vehicles = vehiclesSnap.docs.map(
    (doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        locationCode:
          data.locationCode || "",

        vehicleNumber:
          data.vehicleNumber || "",

        name:
          data.name || "",
      };
    }
  );
 
    const snapshot = await adminDb
    .collection("stockLocations")
    .where("type", "==", "VEHICLE")
    .where("active", "==", true)
    .get();

 

  vehicles.sort((a, b) =>
    (a.vehicleNumber || a.locationCode).localeCompare(
      b.vehicleNumber || b.locationCode
    )
  );

  return (
    <div className="p-6">
      <div className="max-w-3xl ">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            Add Vehicle Insurance
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Add insurance details for a vehicle.
          </p>
        </div>

        <VehicleInsuranceForm vehicles={vehicles} />
      </div>
    </div>
  );
}