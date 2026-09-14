 
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

import { updateInventoryField } from "@/app/(universal)/action/inventory/repair/updateInventoryField";
import { repairFetchInventoryItemById } from "../../action/inventory/repair/repairFetchInventoryItemById";
import { updateInventoryFieldNew } from "../../action/inventory/repair/updateInventoryFieldNew";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItemId: string;
};

type PurchaseMapping = {
  purchaseUnit: string;
  consumptionUnit: string;
  factor: number;
};

export default function RepairInventoryItemDialog({
  open,
  onOpenChange,
  inventoryItemId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [item, setItem] = useState<any>(null);

  const [currentStock, setCurrentStock] = useState("");
  const [consumptionUnit, setConsumptionUnit] = useState("");
  const [purchaseUnit, setPurchaseUnit] = useState("");
  const [conversionFactor, setConversionFactor] = useState("");
  const [averageCost, setAverageCost] = useState("");
  const [purchaseUnitCost, setPurchaseUnitCost] = useState("");

  // =========================================================
  // LOAD ONE INVENTORY ITEM
  // =========================================================

  useEffect(() => {
    if (!open || !inventoryItemId) {
      return;
    }

    async function loadItem() {
      setLoading(true);

      // Clear previous item while loading another item
      setItem(null);

      try {
        const data = await repairFetchInventoryItemById(
          inventoryItemId
        );

        if (!data) {
          console.error(
            "❌ Repair item returned null:",
            inventoryItemId
          );
          return;
        }

        console.log(
          "✅ Repair dialog received item:",
          data
        );

        setItem(data);

        setCurrentStock(
          String(data.currentStock ?? 0)
        );

        setConsumptionUnit(
          String(data.consumptionUnit ?? "")
        );

        setPurchaseUnit(
          String(data.purchaseUnit ?? "")
        );

        setConversionFactor(
          String(data.conversionFactor ?? 0)
        );

        setAverageCost(
          String(data.averageCost ?? 0)
        );

        setPurchaseUnitCost(
          String(data.purchaseUnitCost ?? 0)
        );
      } catch (error) {
        console.error(
          "❌ RepairInventoryItemDialog load error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [open, inventoryItemId]);

  // =========================================================
  // PURCHASE MAPPINGS
  // =========================================================

  const purchaseMappings: PurchaseMapping[] = useMemo(() => {
    if (!item?.purchaseMappings) {
      return [];
    }

    return Array.isArray(item.purchaseMappings)
      ? item.purchaseMappings
      : [];
  }, [item]);

  // =========================================================
  // PURCHASE UNIT CHANGE
  // =========================================================

function handlePurchaseUnitChange(value: string) {
  // ---------------------------------------------------------
  // OLD VALUES
  // ---------------------------------------------------------

  const oldFactor = Number(conversionFactor);
  const oldAverageCost = Number(averageCost);
  const oldPurchaseUnitCost = Number(purchaseUnitCost);

  // ---------------------------------------------------------
  // CHANGE PURCHASE UNIT
  // ---------------------------------------------------------

  setPurchaseUnit(value);

  const mapping = purchaseMappings.find(
    (mapping) => mapping.purchaseUnit === value
  );

  if (!mapping) {
    return;
  }

  const newFactor = Number(mapping.factor);

  // ---------------------------------------------------------
  // CHANGE CONSUMPTION UNIT
  // ---------------------------------------------------------

  if (mapping.consumptionUnit) {
    setConsumptionUnit(mapping.consumptionUnit);
  }

  // ---------------------------------------------------------
  // CHANGE CONVERSION FACTOR
  // ---------------------------------------------------------

  setConversionFactor(String(newFactor));

  // ---------------------------------------------------------
  // CONVERT COSTS
  // ---------------------------------------------------------

  if (
    Number.isFinite(oldFactor) &&
    oldFactor > 0 &&
    Number.isFinite(newFactor) &&
    newFactor > 0
  ) {
    const ratio = oldFactor / newFactor;

    // Average Cost
    if (
      Number.isFinite(oldAverageCost) &&
      oldAverageCost >= 0
    ) {
      const newAverageCost =
        oldAverageCost / ratio;

      setAverageCost(
        String(
          Number(newAverageCost.toFixed(4))
        )
      );
    }

    // Purchase Unit Cost
    if (
      Number.isFinite(oldPurchaseUnitCost) &&
      oldPurchaseUnitCost >= 0
    ) {
      const newPurchaseUnitCost =
        oldPurchaseUnitCost / ratio;

      setPurchaseUnitCost(
        String(
          Number(
            newPurchaseUnitCost.toFixed(4)
          )
        )
      );
    }
  }
}

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const stock = Number(currentStock);
  const factor = Number(conversionFactor);
  const cost = Number(averageCost);

  // Current stock is stored in consumption units.
  //
  // Example:
  // 146925000 gm / 50000 gm per bag
  // = 2938.5 bags

  const purchaseQuantity =
    Number.isFinite(stock) &&
    Number.isFinite(factor) &&
    factor > 0
      ? stock / factor
      : 0;

  // =========================================================
  // STOCK VALUE
  // =========================================================

  // Example:
  //
  // 2938.5 bags × ₹4800
  // = ₹14,104,800

  const stockValue =
    Number.isFinite(stock) &&
    Number.isFinite(factor) &&
    Number.isFinite(cost) &&
    factor > 0
      ? (stock / factor) * cost
      : 0;

  // =========================================================
  // SAVE
  // =========================================================

  async function handleSave() {
    const stockNumber = Number(currentStock);
    const factorNumber = Number(conversionFactor);
    const costNumber = Number(averageCost);
    const purchaseUnitCostNumber =
      Number(purchaseUnitCost);

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (
      !Number.isFinite(stockNumber) ||
      stockNumber < 0
    ) {
      alert("Please enter a valid current stock.");
      return;
    }

    if (!consumptionUnit.trim()) {
      alert("Please enter a consumption unit.");
      return;
    }

    if (!purchaseUnit.trim()) {
      alert(
        "Please select or enter a purchase unit."
      );
      return;
    }

    if (
      !Number.isFinite(factorNumber) ||
      factorNumber <= 0
    ) {
      alert(
        "Please enter a valid conversion factor greater than 0."
      );
      return;
    }

    if (
      !Number.isFinite(costNumber) ||
      costNumber < 0
    ) {
      alert("Please enter a valid average cost.");
      return;
    }

    if (
      !Number.isFinite(
        purchaseUnitCostNumber
      ) ||
      purchaseUnitCostNumber < 0
    ) {
      alert(
        "Please enter a valid purchase unit cost."
      );
      return;
    }

    // -------------------------------------------------------
    // CALCULATE STOCK VALUE
    // -------------------------------------------------------

    const newStockValue =
      (stockNumber / factorNumber) *
      costNumber;

    if (!Number.isFinite(newStockValue)) {
      alert(
        "Stock value calculation is invalid."
      );
      return;
    }

    // -------------------------------------------------------
    // DEBUG
    // -------------------------------------------------------

    console.log("🔧 REPAIR VALUES:", {
      id: inventoryItemId,
      name: item?.name,

      currentStock: stockNumber,

      consumptionUnit,

      purchaseUnit,

      conversionFactor: factorNumber,

      purchaseQuantity,

      averageCost: costNumber,

      purchaseUnitCost:
        purchaseUnitCostNumber,

      stockValue: newStockValue,
    });

    setSaving(true);

    try {
      // -----------------------------------------------------
      // UPDATE CURRENT STOCK
      // -----------------------------------------------------

      const stockResult =
        await updateInventoryField(
          inventoryItemId,
          "currentStock",
          stockNumber
        );

      if (!stockResult.success) {
        alert(stockResult.message);
        return;
      }

      // -----------------------------------------------------
      // UPDATE CONSUMPTION UNIT
      // -----------------------------------------------------

      const consumptionUnitResult =
        await updateInventoryFieldNew(
          inventoryItemId,
          "consumptionUnit",
          consumptionUnit.trim()
        );

      if (!consumptionUnitResult.success) {
        alert(
          consumptionUnitResult.message
        );
        return;
      }

      // -----------------------------------------------------
      // UPDATE PURCHASE UNIT
      // -----------------------------------------------------

      const purchaseUnitResult =
        await updateInventoryFieldNew(
          inventoryItemId,
          "purchaseUnit",
          purchaseUnit.trim()
        );

      if (!purchaseUnitResult.success) {
        // alert(
        //   purchaseUnitResult.message
        // );
        return;
      }

      // -----------------------------------------------------
      // UPDATE CONVERSION FACTOR
      // -----------------------------------------------------

      const conversionResult =
        await updateInventoryFieldNew(
          inventoryItemId,
          "conversionFactor",
          factorNumber
        );

      if (!conversionResult.success) {
        alert(
          conversionResult.message
        );
        return;
      }

      // -----------------------------------------------------
      // UPDATE AVERAGE COST
      // -----------------------------------------------------

      const costResult =
        await updateInventoryField(
          inventoryItemId,
          "averageCost",
          costNumber
        );

      if (!costResult.success) {
        alert(costResult.message);
        return;
      }

      // -----------------------------------------------------
      // UPDATE PURCHASE UNIT COST
      // -----------------------------------------------------

      const purchaseUnitCostResult =
        await updateInventoryFieldNew(
          inventoryItemId,
          "purchaseUnitCost",
          purchaseUnitCostNumber
        );

      if (!purchaseUnitCostResult.success) {
        alert(
          purchaseUnitCostResult.message
        );
        return;
      }

      // -----------------------------------------------------
      // UPDATE STOCK VALUE
      // -----------------------------------------------------

      const stockValueResult =
        await updateInventoryFieldNew(
          inventoryItemId,
          "stockValue",
          newStockValue
        );

      if (!stockValueResult.success) {
        alert(
          stockValueResult.message
        );
        return;
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      console.log(
        "✅ INVENTORY REPAIRED SUCCESSFULLY:",
        {
          id: inventoryItemId,
          name: item?.name,

          currentStock: stockNumber,

          consumptionUnit,

          purchaseUnit,

          conversionFactor:
            factorNumber,

          averageCost: costNumber,

          purchaseUnitCost:
            purchaseUnitCostNumber,

          stockValue: newStockValue,
        }
      );



      onOpenChange(false);

      // Refresh server data
      window.location.reload();
    } catch (error) {
      console.error(
        "❌ RepairInventoryItemDialog save error:",
        error
      );

      alert(
        "Failed to repair inventory item."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DON'T RENDER
  // =========================================================

  if (!open) {
    return null;
  }

  // =========================================================
  // POPUP
  // =========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Repair Inventory Item
            </h2>

            {item && (
              <p className="mt-1 text-sm text-gray-500">
                {item.name}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenChange(false)
            }
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2
                size={24}
                className="animate-spin text-gray-500"
              />

              <span className="ml-2 text-sm text-gray-500">
                Loading item...
              </span>
            </div>
          ) : !item ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Inventory item not found.
            </div>
          ) : (
            <div className="space-y-5">

            <div className="flex justify-between">

              {/* =========================================
                  CURRENT STOCK
              ========================================= */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current Stock
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentStock}
                  onChange={(e) =>
                    setCurrentStock(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Stock is stored in the
                  consumption unit.
                </p>
              </div>

              {/* =========================================
                  CONSUMPTION UNIT
              ========================================= */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Consumption Unit
                </label>

                <input
                  type="text"
                  value={consumptionUnit}
                  onChange={(e) =>
                    setConsumptionUnit(
                      e.target.value
                    )
                  }
                  placeholder="gm"
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Example: gm, kg, ml,
                  litre, pcs
                </p>
              </div>
</div>
              {/* =========================================
                  PURCHASE UNIT
              ========================================= */}
 <div className="flex justify-between">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Purchase Unit
                </label>

                {purchaseMappings.length > 0 ? (
                  <select
                    value={purchaseUnit}
                    onChange={(e) =>
                      handlePurchaseUnitChange(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select purchase unit
                    </option>

                    {purchaseMappings.map(
                      (
                        mapping,
                        index
                      ) => (
                        <option
                          key={`${mapping.purchaseUnit}-${index}`}
                          value={
                            mapping.purchaseUnit
                          }
                        >
                          {
                            mapping.purchaseUnit
                          }
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={purchaseUnit}
                    onChange={(e) =>
                      setPurchaseUnit(
                        e.target.value
                      )
                    }
                    placeholder="bag(50)"
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
                  />
                )}

                <p className="mt-1 text-xs text-gray-400">
                  Select from the existing
                  purchase mappings.
                </p>
              </div>

              {/* =========================================
                  CONVERSION FACTOR
              ========================================= */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Conversion Factor
                </label>

                <input
                  type="number"
                  min="0.000001"
                  step="0.01"
                  value={conversionFactor}
                  onChange={(e) =>
                    setConversionFactor(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  {consumptionUnit || "-"}{" "}
                  per{" "}
                  {purchaseUnit || "-"}
                </p>
              </div>
</div>
              {/* =========================================
                  AVERAGE COST
              ========================================= */}
 <div className="flex justify-between">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Average Cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={averageCost}
                  onChange={(e) =>
                    setAverageCost(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Cost per{" "}
                  {purchaseUnit || "-"}
                </p>
              </div>

              {/* =========================================
                  PURCHASE UNIT COST
              ========================================= */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Purchase Unit Cost
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchaseUnitCost}
                  onChange={(e) =>
                    setPurchaseUnitCost(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Purchase cost per{" "}
                  {purchaseUnit || "-"}
                </p>
              </div>
</div>
              {/* =========================================
                  CALCULATION PREVIEW
              ========================================= */}

              <div className="rounded-xl border bg-green-50 p-4">
                <div className="space-y-3">

                  {/* Current Stock */}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Stock
                    </span>

                    <span className="font-semibold text-gray-800">
                      {Number.isFinite(stock)
                        ? stock.toLocaleString()
                        : "0"}{" "}
                      {consumptionUnit ||
                        ""}
                    </span>
                  </div>

                  {/* Purchase Units */}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                       Qty (Purchase Units)
                    </span>

                    <span className="font-semibold text-gray-800">
                   {purchaseQuantity.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}{" "}
                      {purchaseUnit ||
                        ""}
                    </span>
                  </div>

                  {/* Average Cost */}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Average Cost
                    </span>

                    <span className="font-semibold text-gray-800">
                      Rs{" "}
                      {Number.isFinite(cost)
                        ? cost.toFixed(2)
                        : "0.00"}{" "}
                      /{" "}
                      {purchaseUnit ||
                        ""}
                    </span>
                  </div>

                  {/* Stock Value */}

                  <div className="border-t border-green-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        New Stock Value
                      </span>

                      <span className="text-lg font-bold text-green-700">
                        Rs{" "}
                        {new Intl.NumberFormat(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        ).format(
                          stockValue
                        )}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading && item && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onOpenChange(false)
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Repair & Save
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
 
