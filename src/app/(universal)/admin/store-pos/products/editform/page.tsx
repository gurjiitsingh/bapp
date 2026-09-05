import React, { Suspense } from "react";

import { getMasterCategories } from "@/app/(universal)/action/master-category/getMasterCategories";
import EditProduct from "./componets/EditProduct";

export default async function Page() {
  const masterCategories = await getMasterCategories();

  return (
    <Suspense>
      <EditProduct
        masterCategories={masterCategories}
      />
    </Suspense>
  );
}
