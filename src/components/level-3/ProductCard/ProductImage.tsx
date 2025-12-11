// components/product/ProductImage.tsx
export default function ProductImage({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="product-image-wrapper">
      {image && <img src={image} alt={alt} className="product-image" />}
    </div>
  );
}
