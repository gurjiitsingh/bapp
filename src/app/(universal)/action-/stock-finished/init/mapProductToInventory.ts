import { InventoryItemType, InventoryUnit } from "@/lib/types/InventoryItemType";
import { ProductType } from "@/lib/types/productType";
import {
  getConversionFactor,
  getDefaultUnitPair,
} from "@/utils/inventory/unitConversion";
import admin from "firebase-admin";

type UnitConfig = {
  purchaseUnit?: InventoryUnit;
  consumptionUnit?: InventoryUnit;
  conversionFactor?: number;
};

export function mapProductToInventory(
  product: ProductType,
  config?: UnitConfig,
  categoryId?: string,
  minStock?: number,
  currentStock?: number
): Partial<InventoryItemType> {
  const name = product.name ?? "";

  const defaultPair = getDefaultUnitPair(config?.purchaseUnit);

  const purchaseUnit =
    config?.purchaseUnit ??
    defaultPair?.purchaseUnit ??
    "pcs";

  const consumptionUnit =
    config?.consumptionUnit ??
    defaultPair?.consumptionUnit ??
    purchaseUnit;

  const conversionFactor =
    config?.conversionFactor ??
    getConversionFactor(purchaseUnit, consumptionUnit);

  return {
    id: product.id,

    name,
    nameLower: name.toLowerCase(),

    sku: product.sku ?? "",
    barcode: product.barcode ?? "",

    purchaseUnit,
    consumptionUnit,
    conversionFactor,

    // ✅ ALWAYS ensure numbers (avoid undefined / NaN)
    currentStock: Number(currentStock ?? 0),
    minStock: Number(minStock ?? 0),

    // ✅ safe category mapping
    ...(categoryId && categoryId.trim() !== "" && { categoryId }),

    ...(product.productCat && {
      categoryName: product.productCat,
    }),

    isActive: true,

    /**
     * ✅ CRITICAL FIX:
     * createdAt should NOT overwrite existing doc
     * So we REMOVE it from here
     * and set ONLY in API when doc is new
     */

    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}