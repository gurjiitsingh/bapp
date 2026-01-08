"use client";
import React, { useEffect, useState } from "react";
import {
  fetchOrderMasterById,
  fetchOrderProductsByOrderMasterId,
} from "@/app/(universal)/action/orders/dbOperations";
import ProductList from "./productList";
import { searchAddressByAddressId } from "@/app/(universal)/action/address/dbOperations";
import { useSearchParams } from "next/navigation";
import ListHead from "./ListHead";
import { addressResT } from "@/lib/types/addressType";
import { OrderProductT } from "@/lib/types/orderType";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { formatCurrencyNumber } from '@/utils/formatCurrency';
import { UseSiteContext } from "@/SiteContext/SiteContext";
  import { Timestamp } from "firebase/firestore";
import { formatFirestoreDateToIST } from "@/utils/date";
export type orderMasterDataSafeT = Omit<orderMasterDataT, "createdAt"> & {
  createdAt: string;
};
const OrderDetail = () => {
  const searchParams = useSearchParams();
  // console.log(
  //   "this is ids ---------------",
  //   searchParams.get("addressId"),
  //   searchParams.get("userId")
  // );
  const addressId = searchParams.get("addressId") as string;
  const masterOrderId = searchParams.get("masterId") as string;
  const [orderProducts, setOrderProducts] = useState<OrderProductT[]>([]);
  const [customerAddress, setCustomerAddress] = useState<addressResT>();
  const [orderMasterData, setOrderMasterData] =
    useState<orderMasterDataSafeT | null>(null);

  const { settings } = UseSiteContext();

 

  useEffect(() => {
    async function getOrderProducts() {
      // console.log("maserer id-----------", masterOrderId);
      const orderProductList = await fetchOrderProductsByOrderMasterId(
        masterOrderId
      );
     

let addressRes;

if (addressId === "POS_ORDER") {
  addressRes = {
    id: "POS_ORDER",
    email: "pos@local",
    firstName: "Walk-in",
    lastName: "Customer",
    userId: "POS",
    mobNo: "-",
    addressLine1: "POS Counter",
    addressLine2: "-",
    city: "-",
    state: "-",
    zipCode: "-"
  };
} else {
  addressRes = await searchAddressByAddressId(addressId);
}



      // console.log("orderProductList ---------", orderProductList);

      setOrderProducts(orderProductList);
      setCustomerAddress(addressRes);

      const orderMaster = await fetchOrderMasterById(masterOrderId);
      setOrderMasterData(orderMaster);
     
    }
    getOrderProducts();
  }, []);

  useEffect(() => {
    // console.log("addre ins use efferxt-----", customerAddress);
  }, [customerAddress]);
  const subTotal = orderMasterData?.subTotal;
   
    
  const totalTax = formatCurrencyNumber(
    Number(orderMasterData?.taxAfterDiscount ?? 0),
    (settings.currency ) as string,
    (settings.locale ) as string
  );

  const grandTotal = formatCurrencyNumber(
    Number(orderMasterData?.grandTotal ?? 0),
    (settings.currency ) as string,
    (settings.locale ) as string
  );

      const itemTotal = formatCurrencyNumber(
    Number(orderMasterData?.itemTotal ?? 0),
    (settings.currency ) as string,
    (settings.locale ) as string
  );
    const subTotalS = formatCurrencyNumber(
    Number(subTotal?.toFixed(2)) ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );

    const deliveryFee = formatCurrencyNumber(
    Number(orderMasterData?.deliveryFee) ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );


    const calculatedPickUpDiscount = formatCurrencyNumber(
    Number(orderMasterData?.calculatedPickUpDiscountL) ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );
    const flatDiscount = formatCurrencyNumber(
    Number(orderMasterData?.flatDiscount) ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );

      const calCouponDiscount = formatCurrencyNumber(
    Number(orderMasterData?.calCouponDiscount) ?? 0,
    (settings.currency ) as string,
    (settings.locale ) as string
  );





const dateTime = formatFirestoreDateToIST(
  orderMasterData?.createdAt as string
);




  return (
    <div className="flex flex-col gap-4 bg-white px-3 flex-1 mb-12">
      <div className="py-5 px-12 border-b">
        <h1 className=" text-[1.7rem]">Order Detail</h1>
      </div>
      <div className="w-full flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex flex-col gap-2 w-full md:w-[33%] rounded-xl border p-4">
          <h2 className="text-2xl "> Order</h2>

          <div className="flex gap-2">
            <div className="font-semibold">Sr. No:</div>{" "}
            <div className="">{orderMasterData?.srno}</div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold">Date:</div>{" "}
            <div className="">
              {/* {orderMasterData?.time} */}
              {dateTime}
              </div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold">Status:</div>{" "}
            <div className="">{orderMasterData?.orderStatus}</div>
          </div>


         
 <div className="flex gap-2">
            <div className="font-semibold">Total Payable:</div>{" "}
            <div className="">{grandTotal}</div>
          </div>
         
        </div>


        <div className="flex flex-col gap-2 w-full md:w-[33%] rounded-xl border p-4">
          <h2 className="text-2xl "> Calculations</h2>

        

          <div className="flex gap-2">
            <div className="font-semibold">Item total:</div>{" "}
            <div className="">{itemTotal}</div>
          </div>

          
          <div className="flex gap-2">
            <div className="font-semibold">Dilevery cost:</div>{" "}
            <div className="">{deliveryFee}</div>
          </div>

          <div className="flex gap-2">
            <div className="font-semibold">Pickup discount:</div>{" "}
            <div className="">
            {calculatedPickUpDiscount}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="font-semibold">Coupon Discount Flat:</div>{" "}
            <div className=""> {flatDiscount}</div>
          </div>

          <div className="flex gap-2">
            <div className="font-semibold">Coupon Discount percent:</div>{" "}
            <div className=""> {calCouponDiscount}</div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold">Subtotal:</div>{" "}
            <div className="">{subTotalS}</div>
          </div>
   <div className="flex gap-2">
            <div className="font-semibold">Tax:</div>{" "}
            <div className="">{totalTax}</div>
          </div>
 <div className="flex gap-2">
            <div className="font-semibold">Grand Total:</div>{" "}
            <div className="">{grandTotal}</div>
          </div>

        </div>




        <div className="w-full md:w-[33%] flex flex-col gap-2 rounded-xl border p-4">
          <h2 className="text-2xl "> Address</h2>
          <div className="flex gap-2">
            <div className="font-semibold">Name</div>
            <div className="">
              {customerAddress?.firstName} {customerAddress?.lastName}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold">Email</div>
            <div className="">{customerAddress?.email}</div>
          </div>
          <div className="flex gap-2">
            <div className="font-semibold">Phone</div>
            <div className="">{customerAddress?.mobNo}</div>
          </div>
          <div className="">
            <div className=""></div>
            <div className="">
              {customerAddress?.addressLine1} {customerAddress?.addressLine2}
            </div>
          </div>

          <div className="">
            <div className=""></div>
            <div className="">
              {customerAddress?.city}{" "}
              {customerAddress?.state !== undefined ? (
                customerAddress?.state
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="">
            <div className=""></div>
            <div className="">{customerAddress?.zipCode}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">{/* Billing address */}</div>
      </div>
      <div>
        <ListHead />
        {orderProducts.map((item) => {
          return <ProductList key={item.id} item={item} />;
        })}

        {/* <PickUp />
        <ItemsSubtotal />
        <Shipping />
        <OrderTotal />
        <Paid /> */}
      </div>
    </div>
  );
};
export default OrderDetail;
