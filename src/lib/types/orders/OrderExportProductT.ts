import { cartModifierItem } from "../cartDataType";

export type OrderExportProductT = {
  id?: string;

  productId: string;
  orderMasterId: string;

  name: string;

  basePrice?: number;

  quantity: number;

  itemSubtotal: number;

  taxRate: number;

  taxType: "inclusive" | "exclusive";

  taxAmount: number;
  taxTotal: number;

  finalPrice: number;
  finalTotal: number;

  image: string;

  categoryId: string;
  productCat: string;

  purchaseSession: string;

  status: string;

  userId: string;

  productDesc?: string;

  modifiers?: cartModifierItem[];

  note?: string;
};