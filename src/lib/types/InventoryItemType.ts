
import { z } from "zod";

import { Timestamp, FieldValue, } from "firebase/firestore";

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

export const newInventorySchema = z.object({
  name: z
    .string()
    .min(2, "Inventory item name is required")
    .max(120),

  sku: z.string().optional(),

  barcode: z.string().optional(),

  purchaseUnit:  z.enum(
  inventoryUnits
),

consumptionUnit:  z.enum(
  inventoryUnits
),

  conversionFactor: z.coerce
    .number()
    .min(
      1,
      "Conversion factor must be at least 1"
    ),

  currentStock: z.coerce
    .number()
    .min(
      0,
      "Stock cannot be negative"
    ),

  minStock: z.coerce
    .number()
    .min(
      0,
      "Minimum stock cannot be negative"
    ),

  costPrice: z.coerce
    .number()
    .min(
      0,
      "Cost price is required"
    ),

  sellingPrice: z.coerce
    .number()
    .min(0)
    .optional(),

  categoryId: z.string().optional(),

  supplierId: z.string().optional(),

  isActive: z.boolean().default(true),
})
.superRefine((data, ctx) => {
  const validPairs = [
    {
      purchaseUnit: "kg",
      consumptionUnit: "gm",
      factor: 1000,
    },
    {
      purchaseUnit: "ltr",
      consumptionUnit: "ml",
      factor: 1000,
    },
    {
      purchaseUnit: "pcs",
      consumptionUnit: "pcs",
      factor: 1,
    },
  ];

  const valid = validPairs.find(
    (item) =>
      item.purchaseUnit ===
        data.purchaseUnit &&
      item.consumptionUnit ===
        data.consumptionUnit
  );

  if (!valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Invalid unit combination",
      path: ["consumptionUnit"],
    });

    return;
  }

  if (
    data.conversionFactor !==
    valid.factor
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Conversion factor must be ${valid.factor}`,
      path: ["conversionFactor"],
    });
  }
});





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

  isActive: boolean;

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
};


// export const newInventorySchema = z.object({
//   name: z
//     .string()
//     .min(2, "Inventory item name is required")
//     .max(120),

//   sku: z.string().optional(),

//   barcode: z.string().optional(),

//   unit: z.enum(["pcs", "kg", "gm", "ltr", "ml"]),

//   currentStock: z.coerce
//     .number()
//     .min(0, "Stock cannot be negative"),

//   minStock: z.coerce
//     .number()
//     .min(0, "Minimum stock cannot be negative"),

//   costPrice: z.coerce
//     .number()
//     .min(0, "Cost price is required"),

//   sellingPrice: z.coerce
//     .number()
//     .min(0)
//     .optional(),

//   categoryId: z.string().optional(),

//   supplierId: z.string().optional(),

//   isActive: z.boolean().default(true),
// });

export type TnewInventorySchema = z.infer<typeof newInventorySchema>;
