"use client";

import { Suspense } from "react";
import OrderCancel from "./componets/OrderCancel";

 
const Page = () => {
  
 
  return (
   <Suspense>
    <OrderCancel />
   </Suspense>
  );
};

export default Page;
