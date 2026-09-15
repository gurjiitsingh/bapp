"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { generateVehicleEMIs } from "@/app/(universal)/action/distribution/vehicle/generateVehicleEMIs";
 

type EMIFormType = {
  startDate: string;
  emiAmount: number;
  numberOfInstallments: number;
};

type Props = {
  vehicleId: string;
  financeId: string;

  defaultStartDate: string;
  defaultEmiAmount: number;
  defaultNumberOfInstallments: number;
};

export default function VehicleEMIGenerateForm({
  vehicleId,
  financeId,
  defaultStartDate,
  defaultEmiAmount,
  defaultNumberOfInstallments,
}: Props) {
  const [isSubmitting, startTransition] =
    useTransition();

  const {
    register,
    handleSubmit,
  } =
    useForm<EMIFormType>({
      defaultValues: {
        startDate:
          defaultStartDate,

        emiAmount:
          defaultEmiAmount,

        numberOfInstallments:
          defaultNumberOfInstallments,
      },
    });

  const onSubmit = (
    data: EMIFormType
  ) => {
    startTransition(async () => {
      const result =
        await generateVehicleEMIs({
          vehicleId,

          financeId,

          startDate:
            new Date(
              data.startDate
            ).getTime(),

          emiAmount:
            Number(
              data.emiAmount
            ),

          numberOfInstallments:
            Number(
              data.numberOfInstallments
            ),
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
    >
      <div className="rounded-2xl border border-gray-200 p-5 space-y-5">

        <div>
          <h3 className="font-semibold text-lg">
            Generate EMI Schedule
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Create monthly installments for
            this vehicle finance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              First EMI Date
            </label>

            <input
              type="date"
              {...register(
                "startDate",
                {
                  required: true,
                }
              )}
              className="input-style-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              EMI Amount
            </label>

            <input
              type="number"
              {...register(
                "emiAmount",
                {
                  valueAsNumber: true,
                  min: 1,
                }
              )}
              className="input-style-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Number of Installments
            </label>

            <input
              type="number"
              {...register(
                "numberOfInstallments",
                {
                  valueAsNumber: true,
                  min: 1,
                }
              )}
              className="input-style-4"
            />
          </div>

        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-save-4 h-11"
        >
          {isSubmitting
            ? "Generating..."
            : "Generate EMI Schedule"}
        </Button>

      </div>
    </form>
  );
}
 
