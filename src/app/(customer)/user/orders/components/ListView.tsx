"use client";

type productTableProps = {
  limit?: number;
  title?: string;
};
import { TOrderMaster } from "@/lib/types/orderMasterType";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  //TableCell,
  TableHead,
  TableHeader,
  TableRow,
  //TableCaption,
} from "@/components/ui/table";

//import { Button } from "../ui/button";

import TableRows from "./TableRows";

import { useSession } from "next-auth/react";

//import FeaturProductUpdate from "./FeaturProductUpdate";

const ListView = ({ title }: productTableProps) => {
  const [orderData, setOrderData] = useState<Array<TOrderMaster>>([]);
  const { data: session } = useSession();//, status
// var pageNo = 1;
// var limit = 10

  useEffect(() => {
 
 async function fetchOrder(){
      
      try {
        // if(session?.user?.id !== undefined){
        // const idUser: string = session?.user?.id;
        // const result = await fetchOrdersMasterByUserId(idUser);
        // setOrderData(result)
        // }
      } catch (error) {
        console.log(error)
      }
    
   };
    fetchOrder();
  
  }, [session]);


 





  return (
    <>
      <div className="mt-10 p-2">
        <h3 className="text-2xl mb-4 font-semibold">
          {title ? title : "Products"}
        </h3>
        <div className="bg-slate-50 rounded-lg p-1">
        <Table >
          {/* <TableCaption>Product List</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="hidden md:table-cell">Order</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
             
              <TableHead>Total</TableHead>
              <TableHead>Oringin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderData.map((order: TOrderMaster) => {
              return (
                <TableRows key={order?.id} order={order} />
              );
            })}
          </TableBody>
        </Table></div>
      </div>
    </>
  );
};

export default ListView;
