
import { z } from "zod";

import { Timestamp, FieldValue, } from "firebase/firestore";

export type InventoryItemType = {
  id: string;

  name: string;

  sku?: string;

  barcode?: string;

  unit: "pcs" | "kg" | "gm" | "ltr" | "ml";

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

export const newInventorySchema = z.object({
  name: z
    .string()
    .min(2, "Inventory item name is required")
    .max(120),

  sku: z.string().optional(),

  barcode: z.string().optional(),

  unit: z.enum(["pcs", "kg", "gm", "ltr", "ml"]),

  currentStock: z.coerce
    .number()
    .min(0, "Stock cannot be negative"),

  minStock: z.coerce
    .number()
    .min(0, "Minimum stock cannot be negative"),

  costPrice: z.coerce
    .number()
    .min(0, "Cost price is required"),

  sellingPrice: z.coerce
    .number()
    .min(0)
    .optional(),

  categoryId: z.string().optional(),

  supplierId: z.string().optional(),

  isActive: z.boolean().default(true),
});

export type TnewInventorySchema = z.infer<typeof newInventorySchema>;
