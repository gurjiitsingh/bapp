
import { z } from "zod";
import { Timestamp, FieldValue, } from "firebase/firestore";


// export type InventoryTransactionType =
//   | "purchase"
//   | "sale"
//   | "adjustment_add"
//   | "adjustment_remove"
//   | "wastage"
//   | "opening";

export type InventoryTransactionType = {
  id: string;

  inventoryItemId: string;
  inventoryItemName: string;

  transactionType:
  | "SALE"
  | "PURCHASE"
  | "OPENING"
  | "ADJUSTMENT"
  | "WASTAGE"
  | "RETURN";

  stockDirection:
  | "IN"
  | "OUT";

  quantity: number;


  beforeStock: number;
  afterStock: number;

  unit: string;

  referenceType:
  | "ORDER"
  | "PURCHASE"
  | "MANUAL";

  referenceId?: string;

  productId?: string;
  productName?: string;

  note?: string;
  orderId?: string;
  purchaseId?: string;
  source?: "POS" | "ADMIN" | "SYSTEM" | null;
  createdBy?: string;

  createdAt:
  | Timestamp
  | FieldValue;
};


// export type InventoryTransactionType = {
//   id: string;

//   inventoryItemId: string;

//   inventoryItemName: string;

//   type:
//     | "purchase"
//     | "sale"
//     | "adjustment"
//     | "wastage"
//     | "return";

//   quantity: number;

//   previousStock: number;

//   newStock: number;

//   note?: string;

//   createdBy?: string;

//   createdAt: number;
// };

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


