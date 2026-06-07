import { z } from "zod";

import {
  Timestamp,
  FieldValue,
} from "firebase/firestore";

export const inventoryUnits = [
  "pcs",
  "kg",
  "gm",
  "ltr",
  "ml",
  "dozen",
  "pair",
  "box",
  "pack",
  "carton",
  "bag",
  "bottle",
  "can",
  "jar",
  "roll",
  "tray",
] as const;

export type InventoryUnit =
  (typeof inventoryUnits)[number];

/* -------------------------------- */
/* UNIT PAIRS */
/* -------------------------------- */

export const UNIT_PAIRS: Record<
  InventoryUnit,
  {
    unit: InventoryUnit;
    factor: number;
  }[]
> = {
  kg: [
    { unit: "kg", factor: 1 },
    { unit: "gm", factor: 1000 },
  ],

  gm: [
    { unit: "gm", factor: 1 },
  ],

  ltr: [
    { unit: "ltr", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  ml: [
    { unit: "ml", factor: 1 },
  ],

  dozen: [
    { unit: "dozen", factor: 1 },
    { unit: "pcs", factor: 12 },
    { unit: "bottle", factor: 12 },
    { unit: "can", factor: 12 },
  ],

  pair: [
    { unit: "pair", factor: 1 },
    { unit: "pcs", factor: 2 },
  ],

  carton: [
    { unit: "carton", factor: 1 },
    { unit: "pcs", factor: 24 },
    { unit: "bottle", factor: 24 },
    { unit: "can", factor: 24 },
  ],

  box: [
    { unit: "box", factor: 1 },
    { unit: "pcs", factor: 10 },
  ],

  pack: [
    { unit: "pack", factor: 1 },
    { unit: "pcs", factor: 6 },
  ],

  bag: [
    { unit: "bag", factor: 1 },
    { unit: "gm", factor: 5000 },
  ],

  bottle: [
    { unit: "bottle", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  can: [
    { unit: "can", factor: 1 },
    { unit: "ml", factor: 330 },
  ],

  jar: [
    { unit: "jar", factor: 1 },
    { unit: "gm", factor: 500 },
  ],

  tray: [
    { unit: "tray", factor: 1 },
    { unit: "pcs", factor: 30 },
  ],

  roll: [
    { unit: "roll", factor: 1 },
    { unit: "pcs", factor: 1 },
  ],

  pcs: [
    { unit: "pcs", factor: 1 },
  ],
};

/* -------------------------------- */
/* SCHEMA */
/* -------------------------------- */

export const newInventorySchema =
  z
    .object({
      name: z
        .string()
        .min(
          2,
          "Inventory item name is required"
        )
        .max(120),

      sku: z.string().optional(),

      barcode:
        z.string().optional(),

      supplierId:
        z.string().optional(),

      purchaseUnit:
        z.enum(inventoryUnits),

      consumptionUnit:
        z.enum(inventoryUnits),

      conversionFactor:
        z.coerce
          .number()
          .min(
            1,
            "Conversion factor must be at least 1"
          ),

      currentStock:
        z.coerce
          .number()
          .min(
            0,
            "Stock cannot be negative"
          ),

      minStock:
        z.coerce
          .number()
          .min(
            0,
            "Minimum stock cannot be negative"
          ),

      costPrice:
        z.coerce
          .number()
          .min(
            0,
            "Cost price is required"
          ),

      sellingPrice:
        z.coerce
          .number()
          .min(0)
          .optional(),

      categoryId:
        z.string().optional(),

      supplierIds: z
        .array(z.string())
        .default([]),

      isActive:
        z.boolean().default(
          true
        ),
    })

    .superRefine(
      (data, ctx) => {
        const pairs =
          UNIT_PAIRS[
            data.purchaseUnit
          ] || [];

        const validPair =
          pairs.find(
            (item) =>
              item.unit ===
              data.consumptionUnit
          );

        // INVALID PAIR
        if (!validPair) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Invalid unit combination",
            path: [
              "consumptionUnit",
            ],
          });

          return;
        }

        // INVALID FACTOR
        if (
          data.conversionFactor !==
          validPair.factor
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Conversion factor must be ${validPair.factor}`,
            path: [
              "conversionFactor",
            ],
          });
        }
      }
    );

export type TnewInventorySchema =
  z.infer<
    typeof newInventorySchema
  >;

export type InventoryItemType = {
  id: string;

  name: string;

  categoryName?: string;
  supplierName?: string;

  sku?: string;
  barcode?: string;

  purchaseUnit: InventoryUnit;

  consumptionUnit: InventoryUnit;

  conversionFactor: number;

  currentStock: number;

  minStock: number;

  costPrice: number;

  sellingPrice?: number;

  categoryId?: string;

  supplierId?: string;
  supplierIds?: string[];
  isActive: boolean;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};



