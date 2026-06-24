"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createUnitConversion } from "@/app/(universal)/action/inventory/init/unit-conversion/createUnitConversion";


const BASE_UNITS = [
  "pcs",
  "gm",
  "ml",
  "pack",
  "roll",
  "bottle",
  "can",
  "jar",
];

export default function UnitConversionForm() {
  const [purchaseUnit, setPurchaseUnit] =
    useState("");

  const [consumptionUnit, setConsumptionUnit] =
    useState("");

  const [factor, setFactor] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {
    setLoading(true);

    const result =
      await createUnitConversion({
        purchaseUnit,
        consumptionUnit,
        factor: Number(factor),
      });

    setLoading(false);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert(result.message);

    setPurchaseUnit("");
    setConsumptionUnit("");
    setFactor("");
  }

  return (
    <div className="bg-white rounded-2xl border p-5 max-w-xl">

      <h2 className="text-lg font-semibold mb-4">
        Add Unit Conversion
      </h2>

      <div className="space-y-4">

        <div>
          <label className="label-style-4">
            Purchase Unit
          </label>

          <input
            value={purchaseUnit}
            onChange={(e) =>
              setPurchaseUnit(
                e.target.value
              )
            }
            placeholder="bag"
            className="input-style-4"
          />
        </div>

        <div>
          <label className="label-style-4">
            Consumption Unit
          </label>

          <select
            value={consumptionUnit}
            onChange={(e) =>
              setConsumptionUnit(e.target.value)
            }
            className="input-style-4"
          >
            <option value="">
              Select Base Unit
            </option>

            {baseUnits.map((unit) => (
              <option
                key={unit}
                value={unit}
              >
                {unit.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-style-4">
            Conversion Factor
          </label>

          <input
            type="number"
            step="0.0001"
            value={factor}
            onChange={(e) =>
              setFactor(
                e.target.value
              )
            }
            placeholder="25"
            className="input-style-4"
          />

          <p className="text-xs text-gray-500 mt-1">
            Example: 1 bag = 25 kg
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 border p-3 text-sm">
          Preview:
          <br />
          <strong>
            1 {purchaseUnit || "bag"}
          </strong>{" "}
          =
          <strong>
            {" "}
            {factor || "0"}{" "}
            {consumptionUnit || "kg"}
          </strong>
        </div>


        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="btn-save-4 w-full"
        >
          {loading
            ? "Saving..."
            : "Create Conversion"}
        </Button>

      </div>
    </div>
  );
}