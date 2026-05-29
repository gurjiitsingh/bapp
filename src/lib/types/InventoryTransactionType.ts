
import { z } from "zod";

export type InventoryTransactionType = {
  id: string;

  inventoryItemId: string;

  inventoryItemName: string;

  type:
    | "purchase"
    | "sale"
    | "adjustment"
    | "wastage"
    | "return";

  quantity: number;

  previousStock: number;

  newStock: number;

  note?: string;

  createdBy?: string;

  createdAt: number;
};

export const newInventoryTransactionSchema =
  z.object({
    inventoryItemId: z
      .string()
      .min(
        1,
        "Inventory item is required"
      ),

    type: z.enum([
      "purchase",
      "sale",
      "adjustment",
      "wastage",
      "return",
    ]),

    quantity: z.coerce
      .number()
      .min(
        0.01,
        "Quantity must be greater than 0"
      ),

    note: z
      .string()
      .max(500)
      .optional(),
  });

export type TnewInventoryTransactionSchema =
  z.infer<
    typeof newInventoryTransactionSchema
  >;


