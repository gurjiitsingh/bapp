"use client";
import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import Image from "next/image";
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";

const ProductList = ({ item }) => {
  const { addProductToCart, decCartProduct, removeCartProduct } =
    useContext(CartContext);

 //   console.log("cart item", item)

function addProductToCartNew(){
//console.log("llll")
  addProductToCart(item)
}

  const total = parseInt(item.quantity) * parseFloat(item.price);
  return (
    <div className="flex flex-row gap-5  px-3 py-4 justify-between border-b ">
      <div className="w-[25%]">
        <div className="w-[150px]">
          {" "}
          <Image
            src={item.image}
            width="0"
            height="0"
            sizes="100vw"
            loading="eager"
            priority={true}
            className="w-full h-[150px]"
            alt={item.name}
          />
        </div>
      </div>
      <div className="w-full flex flex-col justify-between gap-2 ">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center ">
        <div className="text-xl">
          {item.name} , Model 234CD First release
        </div>
        

        <div className="text-xl font-semibold">Price ${item.price}</div>
        </div>
        <div > {item.productDesc} </div>
        {/* botom row */}
        <div className="flex flex-row justify-start ">
          <div className="flex justify-center items-center gap-2">
            <button
              className=" rounded-sm bg-slate-300 p-1"
              onClick={decCartProduct.bind(null, item)}
            >
               <IoMdRemove />
            </button>
            {item.quantity}
            <button
              //onClick={addProductToCart.bind(null, item)}
              onClick={addProductToCartNew}
              className="rounded-sm bg-slate-300 p-1"
            >
              <IoMdAdd />
            </button>
          </div>

          <div className="border-r px-2 text-sm text-orange-500">
            <button
              onClick={removeCartProduct.bind(null, item)}
              className=" rounded-sm "
            >
              delete
            </button>
          </div>

          <div className="border-r px-2 text-sm text-orange-500">${total.toFixed(2)}</div>
        </div>
        {/*end  botom row */}
      </div>
    </div>
  );
};

export default ProductList;
