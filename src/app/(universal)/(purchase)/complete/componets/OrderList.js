"use client";
import React, { useContext } from "react";
import CartContext from "@/store/CartContext";
import Image from "next/image";
import { IoMdAdd } from "react-icons/io";
import { IoMdRemove } from "react-icons/io";

const OrderList = ({ item }) => {
  const { addProductToCart, decCartProduct, removeCartProduct } =
    useContext(CartContext);

  //   console.log("cart item", item)

  function addProductToCartNew() {
    //console.log("llll")
    const newProductToAdd = { ...item, quantity: 1 };
    addProductToCart(newProductToAdd);
  }

  const total = parseInt(item.quantity) * parseFloat(item.price);
  return (
    <div className="flex flex-row gap-2 bg-amber-200   justify-between border-b mt-2 rounded-xl ">
      <div className="min-w-[20%]">
        <div className="w-[100px]">
          {" "}
          <Image
            src={item.image}
            width="0"
            height="0"
            sizes="100vw"
            loading="eager"
            priority={true}
            className="w-full h-[100px] rounded-tl-xl rounded-bl-xl"
            alt={item.name}
          />
        </div>
      </div>
      <div className="w-full flex flex-col justify-between gap-2 p-2 ">
        <div className="flex flex-row gap-3  items-start ">
          <div className="text-md w-[87%] flex items-start ">
            {item.name} {item.productDesc}
          </div>

          <div className="text-[1rem] w-[13%] flex items-start justify-end ">
            {" "}
            &euro;{item.price}
          </div>
        </div>
        <div className="text-sm"> {item.productDesc} </div>

        <div className="flex flex-row justify-between ">
          <div className="flex justify-between items-center gap-2 ">
            <div className="flex justify-center items-center gap-4 ">
              <div className=" p-1 text-sm bg-red-600 rounded-full">
                <button
                  onClick={removeCartProduct.bind(null, item)}
                  className=" rounded-sm text-white p-1"
                >
                  Remove
                </button>
              </div>

              <div className="flex justify-center items-center gap-4 ">
                <button
                  className="primary p-2 text-sm  rounded-full text-white"
                  onClick={decCartProduct.bind(null, item)}
                >
                  <IoMdRemove size={20} />
                </button>
                <div className="text-amber-950 p-2 border shadow-lg rounded-full"> {item.quantity}</div>
                <button
                  //onClick={addProductToCart.bind(null, item)}
                  onClick={addProductToCartNew}
                  className="primary p-2 text-sm  rounded-full text-white"
                >
                  <IoMdAdd size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end   text-sm ">
            &euro;{total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
