
import { ProductType } from "@/lib/types/productType";

export type ProductStock = {
  id: string;
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

type InventoryItemType = {
  id: string;

  name: string;

  categoryName?: string;


  // costPrice?: number;

  // sellingPrice?: number;

  categoryId?: string;


  isActive: boolean;

  // createdAt: Timestamp | FieldValue;
  // updatedAt?: Timestamp | FieldValue;
};


export function mapProductToInventory(
  product: ProductType
): InventoryItemType {
  return {
    // ✅ IMPORTANT: keep same ID as product
    id: product.id,

    name: product.name ?? "",

    categoryId: product.categoryId ?? "",

    // 👇 UI friendly
    categoryName: product.productCat ?? "",

    isActive: true,


  };
}