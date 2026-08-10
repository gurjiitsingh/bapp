 
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
 
import toast from "react-hot-toast";
import { userDashboardType } from "@/lib/types/userDashboardType";
import { addRoute } from "@/app/(universal)/action/distribution/sale-route/addRoute";

type VehicleType = {
  id: string;
  name: string;
  locationCode?: string;
};

type RouteFormType = {
  routeCode: string;
  routeName: string;

  salesmanId: string;
  salesmanName: string;

  vehicleId: string;
  vehicleName: string;

  description?: string;
  remarks?: string;
};

type Props = {
  salesman: userDashboardType[];
  vehicles: VehicleType[];
};

export default function RouteForm({
  salesman,
  vehicles,
}: Props) {
  const [isSubmitting, startTransition] =
    useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
  } = useForm<RouteFormType>({
    defaultValues: {
      routeCode: "",
      routeName: "",

      salesmanId: "",
      salesmanName: "",

      vehicleId: "",
      vehicleName: "",

      description: "",
      remarks: "",
    },
  });

  const onSubmit = (
    data: RouteFormType
  ) => {
    startTransition(async () => {

      const result =
        await addRoute(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      reset();
    });
  };

  return (
    <div>

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Add Route
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create a route with its default
          salesman and vehicle
        </p>

      </div>


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col xl:flex-row gap-3 w-full"
      >

        {/* ================= LEFT ================= */}

        <div className="bg-white flex-[0.6] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-2xl border border-gray-200 p-5 space-y-5">

            <h3 className="font-semibold text-lg">
              Route Details
            </h3>


            <div className="grid md:grid-cols-2 gap-5">

              {/* ================================= */}
              {/* ROUTE CODE */}
              {/* ================================= */}

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


              {/* ================================= */}
              {/* ROUTE NAME */}
              {/* ================================= */}

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


              {/* ================================= */}
              {/* SALESMAN */}
              {/* ================================= */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Default Salesman
                </label>

                <input
                  type="hidden"
                  {...register(
                    "salesmanName"
                  )}
                />

                <select
                  {...register(
                    "salesmanId"
                  )}
                  className="input-style-4"
                  onChange={(e) => {

                    const id =
                      e.target.value;

                    const selected =
                      salesman.find(
                        (person) =>
                          person.id === id
                      );

                    setValue(
                      "salesmanId",
                      id
                    );

                    setValue(
                      "salesmanName",
                      selected?.fullName ??
                        ""
                    );
                  }}
                >

                  <option value="">
                    Select salesman
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


              {/* ================================= */}
              {/* VEHICLE */}
              {/* ================================= */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Default Vehicle
                </label>

                <input
                  type="hidden"
                  {...register(
                    "vehicleName"
                  )}
                />

                <select
                  {...register(
                    "vehicleId"
                  )}
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
                      selected?.name ??
                        ""
                    );
                  }}
                >

                  <option value="">
                    Select vehicle
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


              {/* ================================= */}
              {/* DESCRIPTION */}
              {/* ================================= */}

              <div className="md:col-span-2 flex flex-col gap-2">

                <label className="label-style-4">
                  Description
                </label>

                <textarea
                  {...register(
                    "description"
                  )}
                  rows={4}
                  className="input-style-4 resize-none"
                  placeholder="Describe the route, market area, villages, shops, etc."
                />

              </div>


              {/* ================================= */}
              {/* REMARKS */}
              {/* ================================= */}

              <div className="md:col-span-2 flex flex-col gap-2">

                <label className="label-style-4">
                  Remarks
                </label>

                <textarea
                  {...register(
                    "remarks"
                  )}
                  rows={4}
                  className="input-style-4 resize-none"
                  placeholder="Optional remarks..."
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================= RIGHT ================= */}

        <div className="bg-white flex-[0.4] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-center">

            <h3 className="text-xl font-bold">
              Route Information
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Assign a default salesman and
              vehicle to this route. These can
              be changed later when creating a
              distribution trip.
            </p>

          </div>


          <div className="rounded-xl border bg-gray-50 p-4">

            <p className="text-xs text-gray-500">
              Default Salesman
            </p>

            <p className="mt-1 font-medium">
              Selected salesman will be used
              as the default for this route.
            </p>

          </div>


          <div className="rounded-xl border bg-gray-50 p-4">

            <p className="text-xs text-gray-500">
              Default Vehicle
            </p>

            <p className="mt-1 font-medium">
              Selected vehicle will be used
              as the default for this route.
            </p>

          </div>


          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Route"}
          </Button>

        </div>

      </form>

    </div>
  );
}
 
