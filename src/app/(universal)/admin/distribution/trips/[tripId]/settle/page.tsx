"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

import { settleDriverTrip } from "@/app/(universal)/action/distribution/saleman/settleDriverTrip";

type SettlementData = {
    settlementId: string;
    tripId: string;
    tripNo: string;
    vehicleId: string;
    vehicleName: string;

    driverId: string;
    driverName: string;

    openingCash: number;

    totalSalesAmount: number;

    newSaleCashCollected: number;
    newSaleCreditAmount: number;

    oldCreditCollected: number;

    totalCashCollected: number;

    totalExpenses: number;

    amountPayableToManager: number;

    amountHandedOver: number;

    shortageAmount: number;
    excessAmount: number;

    status: string;

    remarks?: string;

    createdAt?: Date;
    updatedAt?: Date;
};

export default function SettleTripPage() {
    const params = useParams();
    const router = useRouter();

    const tripId = String(params.tripId);

    const [settlement, setSettlement] =
        useState<SettlementData | null>(null);

    const [amountHandedOver, setAmountHandedOver] =
        useState("");

    const [remarks, setRemarks] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [settling, setSettling] =
        useState(false);


    // =====================================================
    // LOAD SETTLEMENT
    // =====================================================

    const loadSettlement = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                `/api/distribution/trips/${encodeURIComponent(
                    tripId
                )}/settlement`,
                {
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!result.success) {
                toast.error(
                    result.message ||
                    "Failed to load settlement."
                );

                setSettlement(null);
                return;
            }

            setSettlement(result.data);

            // If not yet settled, pre-fill payable amount
            if (
                result.data.status !== "SETTLED"
            ) {
                setAmountHandedOver(
                    String(
                        Number(
                            result.data.amountPayableToManager ||
                            0
                        )
                    )
                );
            }

        } catch (error: any) {
            console.error(error);

            toast.error(
                error?.message ||
                "Failed to load settlement."
            );

            setSettlement(null);

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (tripId) {
            loadSettlement();
        }
    }, [tripId]);


    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatMoney = (
        value: number
    ) => {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(value || 0);
    };


    // =====================================================
    // CALCULATED VALUES
    // =====================================================

    const payable =
        Number(
            settlement?.amountPayableToManager || 0
        );

    const handedOver =
        Number(amountHandedOver || 0);

    const shortage =
        handedOver < payable
            ? payable - handedOver
            : 0;

    const excess =
        handedOver > payable
            ? handedOver - payable
            : 0;


    // =====================================================
    // SETTLEMENT
    // =====================================================

    const handleSettlement = async () => {

        if (!settlement) {
            toast.error(
                "Settlement data not found."
            );
            return;
        }

        if (settlement.status === "SETTLED") {
            toast.error(
                "This trip has already been settled."
            );
            return;
        }

        if (
            amountHandedOver === "" ||
            handedOver < 0
        ) {
            toast.error(
                "Enter a valid handed over amount."
            );
            return;
        }


        const confirmed =
            window.confirm(
                `Confirm settlement?\n\n` +
                `Amount payable: ${formatMoney(
                    payable
                )}\n` +
                `Amount handed over: ${formatMoney(
                    handedOver
                )}\n` +
                `Shortage: ${formatMoney(
                    shortage
                )}\n` +
                `Excess: ${formatMoney(
                    excess
                )}`
            );

        if (!confirmed) {
            return;
        }


        setSettling(true);

        try {

            const result =
                await settleDriverTrip({
                    tripId,

                    amountHandedOver:
                        Number(amountHandedOver),

                    remarks,

                    createdBy:
                        "ADMIN",
                });


            if (!result.success) {
                toast.error(
                    result.message
                );
                return;
            }


            toast.success(
                result.message
            );


            // Reload latest settlement
            await loadSettlement();

            // Optional:
            // router.push(
            //   `/admin/distribution/trips/${tripId}`
            // );

        } catch (error: any) {

            console.error(error);

            toast.error(
                error?.message ||
                "Failed to settle trip."
            );

        } finally {

            setSettling(false);

        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="p-6">
                <div className="rounded-xl border  border-slate-300  bg-white p-10 text-center">
                    Loading settlement...
                </div>
            </div>
        );
    }


    // =====================================================
    // NOT FOUND
    // =====================================================

    if (!settlement) {
        return (
            <div className="p-6">

                <div className="rounded-xl border  border-slate-300  bg-white p-10 text-center">

                    <h2 className="text-lg font-semibold">
                        Settlement not found
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        No salesman settlement was found
                        for this trip.
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="min-h-screen   p-6">

            <div className="mx-auto max-w-5xl space-y-6">


                {/* ========================================= */}
                {/* HEADER */}
                {/* ========================================= */}

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold">
                            Trip Settlement
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Final cash settlement for salesman
                        </p>

                    </div>
                      <div className="flex justify-end gap-3">

                                <Button 
                                    onClick={
                                        handleSettlement
                                    }
                                    disabled={
                                        settling
                                    }
                                    className="bg-red-600 hover:bg-red-700 w-[300px] text-slate-100"
                                >
                                    {settling
                                        ? "Settling..."
                                        : "Settle Trip"}
                                </Button>

                                         <div
                        className={`
              rounded-full
              px-4
              py-2
              text-sm
              font-medium
              ${settlement.status ===
                                "SETTLED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
            `}
                    >
                        {settlement.status}
                    </div>

                            </div>


           



                </div>


                {/* ========================================= */}
                {/* TRIP INFORMATION */}
                {/* ========================================= */}

                <div className="rounded-xl border  border-slate-300  bg-white p-6">

                    <h2 className="mb-4 text-lg font-semibold">
                        Trip Information
                    </h2>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <Info
                            label="Trip No"
                            value={settlement.tripNo || "-"}
                        />

                        <Info
                            label="Vehicle"
                            value={
                                settlement.vehicleName ||
                                "-"
                            }
                        />

                        <Info
                            label="Salesman"
                            value={
                                settlement.driverName ||
                                "-"
                            }
                        />

                    </div>

                </div>

        {/* ========================================= */}
                {/* HANDOVER */}
                {/* ========================================= */}

                <div className="rounded-xl border  border-slate-300  bg-white p-6">

                    <h2 className="mb-4 text-lg font-semibold">
                        Manager Handover
                    </h2>


                    {settlement.status ===
                        "SETTLED" ? (

                        <div className="space-y-4">

                            <div className="rounded-xl bg-green-50 p-5">

                                <p className="text-sm text-gray-600">
                                    Amount handed over
                                </p>

                                <p className="mt-1 text-2xl font-bold text-green-700">
                                    {formatMoney(
                                        settlement.amountHandedOver
                                    )}
                                </p>

                            </div>


                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <MoneyCard
                                    label="Shortage"
                                    value={
                                        settlement.shortageAmount
                                    }
                                />

                                <MoneyCard
                                    label="Excess"
                                    value={
                                        settlement.excessAmount
                                    }
                                />
                            </div>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {/* AMOUNT */}

                            <div>

                                <label className="mb-2 block text-sm font-medium">
                                    Amount Handed Over
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        amountHandedOver
                                    }
                                    onChange={(e) =>
                                        setAmountHandedOver(
                                            e.target.value
                                        )
                                    }
                                    className="
                    h-12
                    w-full
                    rounded-lg
                    border
                    px-4
                    text-lg
                    font-semibold
                    outline-none
                    focus:ring-2
                  "
                                    placeholder="Enter amount"
                                />

                            </div>


                            {/* LIVE DIFFERENCE */}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                <div className="rounded-xl bg-gray-50 p-4">

                                    <p className="text-sm text-gray-500">
                                        Payable
                                    </p>

                                    <p className="mt-1 text-xl font-bold">
                                        {formatMoney(
                                            payable
                                        )}
                                    </p>

                                </div>


                                <div className="rounded-xl bg-gray-50 p-4">

                                    <p className="text-sm text-gray-500">
                                        Shortage
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-red-600">
                                        {formatMoney(
                                            shortage
                                        )}
                                    </p>

                                </div>


                                <div className="rounded-xl bg-gray-50 p-4">

                                    <p className="text-sm text-gray-500">
                                        Excess
                                    </p>

                                    <p className="mt-1 text-xl font-bold text-green-600">
                                        {formatMoney(
                                            excess
                                        )}
                                    </p>

                                </div>

                            </div>


                            {/* REMARKS */}

                            <div>

                                <label className="mb-2 block text-sm font-medium">
                                    Remarks
                                </label>

                                <textarea
                                    value={remarks}
                                    onChange={(e) =>
                                        setRemarks(
                                            e.target.value
                                        )
                                    }
                                    rows={3}
                                    className="
                    w-full
                    rounded-lg
                    border
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                  "
                                    placeholder="Settlement remarks..."
                                />

                            </div>


                            {/* BUTTON */}



                        </div>

                    )}

                </div>
                {/* ========================================= */}
                {/* SALES SUMMARY */}
                {/* ========================================= */}

                <div className="rounded-xl border  border-slate-300  bg-white p-6">

                    <h2 className="mb-4 text-lg font-semibold">
                        Sales & Cash Summary
                    </h2>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">


                        <MoneyCard
                            label="Total Sales"
                            value={
                                settlement.totalSalesAmount
                            }
                        />


                        <MoneyCard
                            label="New Sale — Cash"
                            value={
                                settlement.newSaleCashCollected
                            }
                        />


                        <MoneyCard
                            label="New Sale — Credit"
                            value={
                                settlement.newSaleCreditAmount
                            }
                        />


                        <MoneyCard
                            label="Old Credit Collected"
                            value={
                                settlement.oldCreditCollected
                            }
                        />


                        <MoneyCard
                            label="Total Cash Collected"
                            value={
                                settlement.totalCashCollected
                            }
                        />

                        <MoneyCard
                            label="Expenses"
                            value={settlement.totalExpenses}
                        />

                        {/* <MoneyCard
              label="Expenses"
              value={
                settlement.totalExpenses}
              /> */}

                    </div>

                </div>


                {/* ========================================= */}
                {/* MONEY CALCULATION */}
                {/* ========================================= */}

                <div className="rounded-xl border  border-slate-300  bg-white p-6">

                    <h2 className="mb-4 text-lg font-semibold">
                        Amount Payable
                    </h2>


                    <div className="rounded-xl bg-gray-50 p-5">

                        <div className="flex items-center justify-between">

                            <span className="text-gray-600">
                                Cash collected
                            </span>

                            <span className="font-medium">
                                {formatMoney(
                                    settlement.totalCashCollected
                                )}
                            </span>

                        </div>


                        <div className="mt-3 flex items-center justify-between">

                            <span className="text-gray-600">
                                Expenses
                            </span>

                            <span className="font-medium">
                                -{" "}
                                {formatMoney(
                                    settlement.totalExpenses
                                )}
                            </span>

                        </div>


                        <div className="my-4 border-t" />


                        <div className="flex items-center justify-between">

                            <span className="text-lg font-semibold">
                                Amount Payable to Manager
                            </span>

                            <span className="text-2xl font-bold">
                                {formatMoney(
                                    payable
                                )}
                            </span>

                        </div>

                    </div>

                </div>


        

            </div>

        </div>
    );
}


// =====================================================
// SMALL COMPONENTS
// =====================================================

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>

            <p className="text-xs text-gray-500">
                {label}
            </p>

            <p className="mt-1 font-medium">
                {value}
            </p>

        </div>
    );
}


function MoneyCard({
    label,
    value,
}: {
    label: string;
    value: number;
}) {

    const formatted =
        new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }
        ).format(value || 0);

    return (
        <div className="rounded-xl border  border-slate-300  bg-gray-50 p-4">

            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold">
                {formatted}
            </p>

        </div>
    );
}