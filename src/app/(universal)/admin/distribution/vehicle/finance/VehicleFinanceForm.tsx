"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { addVehicleFinance } from "@/app/(universal)/action/distribution/vehicle/addVehicleFinance";

type VehicleFinanceFormType = {
  vehicleId: string;

  financeCompany: string;
  loanAccountNumber: string;

  loanAmount: number;
  interestRate: number;

  loanTenure: number;
  tenureUnit: "YEARS" | "MONTHS";

  paymentFrequency: "MONTHLY" | "QUARTERLY" | "YEARLY";

  emiAmount: number;
  numberOfInstallments: number;

  startDate: string;
  endDate: string;

  remarks: string;
};

type VehicleOption = {
  id: string;
  locationCode: string;
  vehicleNumber?: string;
  name: string;
};

type Props = {
  vehicles: VehicleOption[];
};

export default function VehicleFinanceForm({
  vehicles,
}: Props) {
  const [isSubmitting, startTransition] =
    useTransition();

  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<VehicleFinanceFormType>({
    defaultValues: {
      vehicleId: "",

      financeCompany: "",
      loanAccountNumber: "",

      loanAmount: 0,
      interestRate: 0,

      loanTenure: 0,
      tenureUnit: "YEARS",

      paymentFrequency: "MONTHLY",

      emiAmount: 0,
      numberOfInstallments: 0,

      startDate: "",
      endDate: "",

      remarks: "",
    },
  });

  const loanAmount = useWatch({
    control,
    name: "loanAmount",
  });

  const interestRate = useWatch({
    control,
    name: "interestRate",
  });

  const loanTenure = useWatch({
    control,
    name: "loanTenure",
  });

  const tenureUnit = useWatch({
    control,
    name: "tenureUnit",
  });

  const paymentFrequency = useWatch({
    control,
    name: "paymentFrequency",
  });

  const startDate = useWatch({
    control,
    name: "startDate",
  });

  // Number of payments per year
  const paymentsPerYear =
    paymentFrequency === "MONTHLY"
      ? 12
      : paymentFrequency === "QUARTERLY"
      ? 4
      : 1;

  // Total number of installments
  const numberOfInstallments =
    loanTenure > 0
      ? tenureUnit === "YEARS"
        ? loanTenure * paymentsPerYear
        : Math.ceil(
            (loanTenure * paymentsPerYear) / 12
          )
      : 0;

  // Interest rate per payment period
  const periodicInterestRate =
    Number(interestRate) > 0
      ? Number(interestRate) /
        100 /
        paymentsPerYear
      : 0;

  // Calculate EMI
  let emiAmount = 0;

  if (
    Number(loanAmount) > 0 &&
    numberOfInstallments > 0
  ) {
    if (periodicInterestRate === 0) {
      emiAmount =
        Number(loanAmount) /
        numberOfInstallments;
    } else {
      emiAmount =
        (Number(loanAmount) *
          periodicInterestRate *
          Math.pow(
            1 + periodicInterestRate,
            numberOfInstallments
          )) /
        (Math.pow(
          1 + periodicInterestRate,
          numberOfInstallments
        ) - 1);
    }
  }

  // Calculate finance end date
  let endDate = "";

  if (
    startDate &&
    numberOfInstallments > 0
  ) {
    const lastPaymentDate = new Date(
      `${startDate}T00:00:00`
    );

    const monthsPerPayment =
      paymentFrequency === "MONTHLY"
        ? 1
        : paymentFrequency === "QUARTERLY"
        ? 3
        : 12;

    lastPaymentDate.setMonth(
      lastPaymentDate.getMonth() +
        (numberOfInstallments - 1) *
          monthsPerPayment
    );

    endDate = lastPaymentDate
      .toISOString()
      .split("T")[0];
  }

  const onSubmit = (
    data: VehicleFinanceFormType
  ) => {
    if (emiAmount <= 0) {
      toast.error(
        "Unable to calculate EMI."
      );
      return;
    }

    if (numberOfInstallments <= 0) {
      toast.error(
        "Please enter a valid loan tenure."
      );
      return;
    }

    if (!endDate) {
      toast.error(
        "Please select the first EMI date."
      );
      return;
    }

    startTransition(async () => {
      const result =
        await addVehicleFinance({
          vehicleId: data.vehicleId,

          financeCompany:
            data.financeCompany,

          loanAccountNumber:
            data.loanAccountNumber,

          loanAmount:
            Number(data.loanAmount),

          interestRate:
            Number(data.interestRate),

          emiAmount:
            Number(emiAmount.toFixed(2)),

          numberOfInstallments:
            numberOfInstallments,

          startDate:
            new Date(
              data.startDate
            ).getTime(),

          endDate:
            new Date(
              endDate
            ).getTime(),

          remarks: data.remarks,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      reset();
    });
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col xl:flex-row gap-3 w-full"
      >
        {/* LEFT */}
        <div className="bg-white flex-[0.6] rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="rounded-2xl border border-gray-200 p-5 space-y-5">

            <h3 className="font-semibold text-lg">
              Finance Details
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              {/* Vehicle */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Vehicle
                </label>

                <select
                  {...register(
                    "vehicleId",
                    {
                      required: true,
                    }
                  )}
                  className="input-style-4"
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
                        {vehicle.vehicleNumber ||
                          vehicle.locationCode}{" "}
                        - {vehicle.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Finance Company */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Finance Company / Bank
                </label>

                <input
                  {...register(
                    "financeCompany",
                    {
                      required: true,
                    }
                  )}
                  className="input-style-4"
                  placeholder="HDFC Bank"
                />
              </div>

              {/* Account Number */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Loan Account Number
                </label>

                <input
                  {...register(
                    "loanAccountNumber"
                  )}
                  className="input-style-4"
                  placeholder="Optional"
                />
              </div>

              {/* Loan Amount */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Loan Amount
                </label>

                <input
                  type="number"
                  {...register(
                    "loanAmount",
                    {
                      valueAsNumber: true,
                      min: 1,
                    }
                  )}
                  className="input-style-4"
                  placeholder="800000"
                />
              </div>

              {/* Interest Rate */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Interest Rate (% p.a.)
                </label>

                <input
                  type="number"
                  step="0.01"
                  {...register(
                    "interestRate",
                    {
                      valueAsNumber: true,
                      min: 0,
                    }
                  )}
                  className="input-style-4"
                  placeholder="12"
                />
              </div>

         {/* Loan Tenure */}
<div className="flex flex-col gap-2">
  <label className="label-style-4">
    Loan Tenure
  </label>

  <div className="flex gap-2">
    <input
      type="number"
      {...register("loanTenure", {
        valueAsNumber: true,
        min: 1,
      })}
      className="input-style-4 w-3/5"
      placeholder="3"
    />

    <select
      {...register("tenureUnit")}
      className="input-style-4 w-2/5"
    >
      <option value="YEARS">
        Years
      </option>

      <option value="MONTHS">
        Months
      </option>
    </select>
  </div>
</div>
              {/* Payment Frequency */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Payment Frequency
                </label>

                <select
                  {...register(
                    "paymentFrequency"
                  )}
                  className="input-style-4"
                >
                  <option value="MONTHLY">
                    Monthly
                  </option>

                  <option value="QUARTERLY">
                    Quarterly
                  </option>

                  <option value="YEARLY">
                    Yearly
                  </option>
                </select>
              </div>

              {/* First Payment Date */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  First Payment Date
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

              {/* EMI Amount */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  EMI Amount
                </label>

                <input
                  type="text"
                  value={
                    emiAmount > 0
                      ? `₹${emiAmount.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2,
                          }
                        )}`
                      : "-"
                  }
                  readOnly
                  className="input-style-4 bg-gray-50 font-semibold"
                />
              </div>

              {/* Number of Installments */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Number of Installments
                </label>

                <input
                  type="text"
                  value={
                    numberOfInstallments ||
                    "-"
                  }
                  readOnly
                  className="input-style-4 bg-gray-50 font-semibold"
                />
              </div>

              {/* Finance End Date */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Finance End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  readOnly
                  className="input-style-4 bg-gray-50"
                />
              </div>

              {/* Remarks */}
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

        {/* RIGHT */}
        <div className="bg-white flex-[0.4] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-center">
            <h3 className="text-xl font-bold">
              Vehicle Finance
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Add loan terms and payment
              information for this vehicle.
            </p>
          </div>

          {/* Calculation Summary */}
          <div className="rounded-xl border border-gray-200 p-5 space-y-3">
            <h4 className="font-semibold">
              Loan Summary
            </h4>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Loan Amount
              </span>
              <span className="font-semibold">
                ₹
                {Number(
                  loanAmount || 0
                ).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Interest Rate
              </span>
              <span className="font-semibold">
                {Number(
                  interestRate || 0
                ).toFixed(2)}
                % p.a.
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Installments
              </span>
              <span className="font-semibold">
                {numberOfInstallments || "-"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Payment Frequency
              </span>
              <span className="font-semibold">
                {paymentFrequency}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold">
                EMI
              </span>

              <span className="font-bold text-lg">
                ₹
                {emiAmount > 0
                  ? emiAmount.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )
                  : "-"}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Finance"}
          </Button>

        </div>
      </form>
    </div>
  );
}