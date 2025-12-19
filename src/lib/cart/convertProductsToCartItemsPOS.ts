import { ProductType } from "@/lib/types/productType";
import { cartProductType } from "../types/cartDataType";

/**
 * Convert ProductType[] (catalog cart)
 * → cartProductType[] (order-safe cart snapshot)
 */
export function convertProductsToCartItemsPOS(
  products: ProductType[]
): cartProductType[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image ?? "",

    price: Number(product.price),
    quantity: product.quantity ?? 1,

    stockQty: product.stockQty ?? null,

    categoryId: product.categoryId ?? "",
    productCat: product.productCat ?? "",

    taxRate: product.taxRate,
    taxType: product.taxType,
  }));
}
