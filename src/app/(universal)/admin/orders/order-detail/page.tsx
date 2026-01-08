

'use client'


import { Suspense } from "react";
import OrderDetail from "./components/OrderDetail";


export default function Order() {
 
  

  return (
    <Suspense>
    <OrderDetail  />
    </Suspense>
  );
}

