"use client";

import { Suspense } from "react";
import OrderFailed from "./componets/OrderFail";

 
const Page = () => {
  
 
  return (
   <Suspense>
    <OrderFailed />
   </Suspense>
  );
};

export default Page;
