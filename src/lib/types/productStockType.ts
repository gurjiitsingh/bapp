import { z } from "zod";

export type ProductStock = {
  id: string;              // same as productId (IMPORTANT)
  name: string;
  price: number;

  productMode?: "raw_stock" | "finished_stock" | "simple";

  currentStock: number;
  minStock: number;

  categoryId?: string;
  categoryName?: string;

  sku?: string;
  barcode?: string;

  updatedAt: number;
};