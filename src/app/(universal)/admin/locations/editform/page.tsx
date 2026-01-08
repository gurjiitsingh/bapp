"use client";

import { Suspense } from "react";
import EditLocationPage from "./componets/EditLocationPage";


const Page = () => {

  return (
   <Suspense>
    <EditLocationPage />
   </Suspense>
  );
};

export default Page;
