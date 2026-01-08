// components/product/PriceDisplay.tsx
export default function PriceDisplay({
  priceRegular,
  priceDiscounted,
  discountPrice,
}: {
  priceRegular: number;
  priceDiscounted: number;
  discountPrice?: number;
}) {
  return (
    <div className="price-display">
      <div className="text-white">Pack</div>
      <div>
        {discountPrice !== undefined && discountPrice > 0 ? (
          <div className="flex justify-between gap-3 items-center">
            <div className="line-through">&euro;{priceRegular}</div>
            <div>&euro;{priceDiscounted}</div>
          </div>
        ) : (
          <div>&euro;{priceRegular}</div>
        )}
      </div>
    </div>
  );
}
