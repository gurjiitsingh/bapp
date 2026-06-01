// app/admin/product-recipes/page.tsx

export default async function Page({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const productId = searchParams?.productId || null;

  const [products, inventoryItems, recipes] =
    await Promise.all([
      fetchProducts(),
      fetchInventoryItems(),
      fetchProductRecipes(),
    ]);

  const filteredProducts = products.filter(
    (product) => product.type === "parent"
  );

  return (
    <FormView
      products={filteredProducts}
      inventoryItems={inventoryItems}
      recipes={recipes}
      initialProductId={productId}   // ✅ NEW
    />
  );
}