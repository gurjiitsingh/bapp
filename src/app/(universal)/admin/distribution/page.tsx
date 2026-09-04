import { StorageType } from "@/lib/types/distribution/StorageType";
import { getStockLocationsAll } from "../../action/distribution/getStockLocationsAll";
import StockLocationView from "./components/StockLocationView";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    locationType?: StorageType;
    locationRef?: string;
  }>;
}) {
  const { locationType, locationRef } = await searchParams;

  const stockLocations = await getStockLocationsAll({
    locationType,
    locationRef,
  });

  return (
    <StockLocationView
      stockLocations={stockLocations}
      selectedLocation={locationType}
    />
  );
}