import React, { Suspense } from "react";
import PageComp from "./pagecomp";
import { getMasterCategories } from "@/app/(universal)/action/master-category/getMasterCategories";

export default async function Page() {
  const masterCategories = await getMasterCategories();

  return (
    <Suspense>
      <PageComp masterCategories={masterCategories} />
    </Suspense>
  );
}