"use client";
import React, { useContext, useEffect } from "react";
import ProductList from "@/components/Cart/productList";
import CartContext from "@/store/CartContext";


const CartContent = () => {
  const { cartData } = useContext(CartContext);

  useEffect(() => {
  //  console.log("incart content", cartData);
  }, [cartData]);
  return (
    <div className="flex flex-col gap-4 bg-white px-3 flex-1">
      <div className="py-5 px-12 border-b">
        <h1 className=" text-[1.7rem]">Shoping Cart</h1>
      </div>
      <div>
        {cartData.map((item) => {
           return (
           
              <ProductList key={item.id} item={item} />
           
          );
        })}
      </div>
    </div>
  );
};
export default CartContent;

{
  /* <div className="w-full flex flex-row gap-3 bg-slate-600  px-3 py-5 justify-between mt-12 font-semibold mb-3 ">
        <div className="w-[10%]"></div>
        <div>Products</div>
        <div>Price</div>
        <div>Quty</div>
        <div>Action</div>
        <div>Total</div>
      </div> */
}
