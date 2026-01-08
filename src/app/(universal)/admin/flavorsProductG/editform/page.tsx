"use client";

import { Suspense } from "react";
import PageComp from "./pagecomp";

const Page = () => {
 

  return (
   <Suspense>
    <PageComp />
   </Suspense>
  );
};

export default Page;
