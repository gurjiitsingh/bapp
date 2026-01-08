// components/product/ProductTitleBadge.tsx
export default function ProductTitleBadge({
  name,
  sortOrder,
  productCategoryIdG,
}: {
  name: string;
  sortOrder: string;
  productCategoryIdG: string;
}) {
  return (
    <div className="product-title-badge">
      {productCategoryIdG && <>{sortOrder}.&nbsp;</>}
      {name}
    </div>
  );
}
