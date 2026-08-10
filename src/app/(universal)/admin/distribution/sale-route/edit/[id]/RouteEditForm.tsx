 
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

import { userDashboardType } from "@/lib/types/userDashboardType";

 
 
import { updateRoute } from "@/app/(universal)/action/distribution/sale-route/editRoute";
import { DistributionRoute } from "@/app/(universal)/action/distribution/sale-route/getRoutes";

type VehicleType = {
  id: string;
  name: string;
  locationCode?: string;
};

type RouteFormType = {
  id: string;

  routeCode: string;
  routeName: string;

  description?: string;
  remarks?: string;

  salesmanId: string;
  salesmanName: string;

  vehicleId: string;
  vehicleName: string;

  status: "ACTIVE" | "INACTIVE";
};

type Props = {
  route: DistributionRoute;

  salesman: userDashboardType[];

  vehicles: VehicleType[];
};

export default function RouteEditForm({
  route,
  salesman,
  vehicles,
}: Props) {
  const [isSubmitting, startTransition] =
    useTransition();

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<RouteFormType>({
    defaultValues: {
      id: route.id,

      routeCode:
        route.routeCode || "",

      routeName:
        route.routeName || "",

      description:
        route.description || "",

      remarks:
        route.remarks || "",

      salesmanId:
        route.salesmanId || "",

      salesmanName:
        route.salesmanName || "",

      vehicleId:
        route.vehicleId || "",

      vehicleName:
        route.vehicleName || "",

      status:
        route.status || "ACTIVE",
    },
  });

  const onSubmit = (
    data: RouteFormType
  ) => {
    startTransition(async () => {
      const result =
        await updateRoute(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <div>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Edit Route
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Update route, salesman and vehicle assignment.
        </p>

      </div>


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col xl:flex-row gap-3 w-full"
      >

        {/* ID */}

        <input
          type="hidden"
          {...register("id")}
        />

        <input
          type="hidden"
          {...register("salesmanName")}
        />

        <input
          type="hidden"
          {...register("vehicleName")}
        />


        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="bg-white flex-[0.6] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-2xl border border-gray-200 p-5 space-y-5">

            <h3 className="font-semibold text-lg">
              Route Details
            </h3>


            <div className="grid md:grid-cols-2 gap-5">

              {/* ROUTE CODE */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Route Code
                </label>

                <input
                  {...register("routeCode")}
                  className="input-style-4"
                  placeholder="RT-001"
                />

              </div>


              {/* ROUTE NAME */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Route Name
                </label>

                <input
                  {...register("routeName")}
                  className="input-style-4"
                  placeholder="Karimpur Market"
                />

              </div>


              {/* SALESMAN */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Salesman
                </label>

                <select
                  {...register("salesmanId")}
                  className="input-style-4"
                  onChange={(e) => {
                    const id =
                      e.target.value;

                    const selected =
                      salesman.find(
                        (item) =>
                          item.id === id
                      );

                    setValue(
                      "salesmanId",
                      id
                    );

                    setValue(
                      "salesmanName",
                      selected?.fullName ||
                        ""
                    );
                  }}
                >

                  <option value="">
                    Select Salesman
                  </option>

                  {salesman.map(
                    (person) => (
                      <option
                        key={person.id}
                        value={person.id}
                      >
                        {person.fullName}

                        {person.employeeId
                          ? ` (${person.employeeId})`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* VEHICLE */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Vehicle
                </label>

                <select
                  {...register("vehicleId")}
                  className="input-style-4"
                  onChange={(e) => {
                    const id =
                      e.target.value;

                    const selected =
                      vehicles.find(
                        (vehicle) =>
                          vehicle.id === id
                      );

                    setValue(
                      "vehicleId",
                      id
                    );

                    setValue(
                      "vehicleName",
                      selected?.name ||
                        ""
                    );
                  }}
                >

                  <option value="">
                    Select Vehicle
                  </option>

                  {vehicles.map(
                    (vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.name}

                        {vehicle.locationCode
                          ? ` (${vehicle.locationCode})`
                          : ""}
                      </option>
                    )
                  )}

                </select>

              </div>


              {/* STATUS */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Status
                </label>

                <select
                  {...register("status")}
                  className="input-style-4"
                >

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>

                </select>

              </div>


              {/* DESCRIPTION */}

              <div className="md:col-span-2 flex flex-col gap-2">

                <label className="label-style-4">
                  Description
                </label>

                <textarea
                  {...register("description")}
                  rows={4}
                  className="input-style-4 resize-none"
                  placeholder="Describe the route, market area, villages, shops, etc."
                />

              </div>


              {/* REMARKS */}

              <div className="md:col-span-2 flex flex-col gap-2">

                <label className="label-style-4">
                  Remarks
                </label>

                <textarea
                  {...register("remarks")}
                  rows={4}
                  className="input-style-4 resize-none"
                  placeholder="Optional remarks..."
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* RIGHT */}
        {/* ================================================= */}

        <div className="bg-white flex-[0.4] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-center">

            <h3 className="text-xl font-bold">
              Route Assignment
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              The salesman and vehicle are the
              current assignments for this route.
              They can be changed later.
            </p>

          </div>


          {/* CURRENT SALESMAN */}

          <div className="rounded-xl border bg-gray-50 p-4">

            <p className="text-xs text-gray-500">
              Current Salesman
            </p>

            <p className="mt-1 font-semibold">
              {route.salesmanName ||
                "Not assigned"}
            </p>

          </div>


          {/* CURRENT VEHICLE */}

          <div className="rounded-xl border bg-gray-50 p-4">

            <p className="text-xs text-gray-500">
              Current Vehicle
            </p>

            <p className="mt-1 font-semibold">
              {route.vehicleName ||
                "Not assigned"}
            </p>

          </div>


          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Saving..."
              : "Update Route"}
          </Button>

        </div>

      </form>

    </div>
  );
}
 
