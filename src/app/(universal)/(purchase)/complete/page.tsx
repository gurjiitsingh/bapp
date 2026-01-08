"use client";

import { Suspense } from "react";
import OrderComplete from "./componets/OrderComplete";

 
const Page = () => {
  
 
  return (<div translate="no">
   <Suspense>
    <OrderComplete />
   </Suspense>
   </div>
  );
};

export default Page;
