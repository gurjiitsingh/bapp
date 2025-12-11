"use client";

import React, {  useEffect, useState } from "react";
import CartContext from "./CartContext";

import { addressT } from "@/lib/types/addressType";
import {  cartProductType } from "@/lib/types/cartDataType";

interface Props {
  children: React.ReactNode;
}

export const CartProvider: React.FC<Props> = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  //var now1 = Date.now().toString();

  const [cartData, setCartData] = useState<cartProductType[]>([]);
   const [address, setAddress] = useState<addressT>({
    name: "",
    mobNo: "",
    city: "",
    state: "",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",
    userId: "",});
   const [counter, setCounter] = useState<number>(0);
   const [endTotalG, setEndTotalL] =useState<number>(0);
  const [productTotalCost, setProductTotalCost] = useState<number>(0);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [  totalDiscountG, setTotalDiscountL] = useState<number>(0);
 
  useEffect(() => {

     if (typeof window !== "undefined") {
        //  Load END_TOTAL safely
        const endTotalRaw = window.localStorage.getItem("END_TOTAL");
        if (endTotalRaw !== null) {
          const parsed = JSON.parse(endTotalRaw);
          if (!isNaN(parsed)) {
            setEndTotalL(+parsed);
          }
        }
   
      }
   
  //  Create cart ID if missing
  if (window.localStorage.getItem("cart_product_data_id") === null) {
    const cartItemDateId = Date.now().toString();
    window.localStorage.setItem("cart_product_data_id", cartItemDateId);
  }


     if (isUpdated) {
      //  Save cart only when updated
      window.localStorage.setItem("cart_product_data", JSON.stringify(cartData));
    } else {
      //  Load and clean cart from localStorage
      const rawCart = window.localStorage.getItem("cart_product_data");
      const parsedCart: cartProductType[] = JSON.parse(rawCart || "[]");

      const cleaned = parsedCart.filter((item) => {
        const quantity = Number(item.quantity);
        const price = parseFloat(item.price as any);
        return !isNaN(quantity) && !isNaN(price) && quantity >= 0 && price >= 0;
      });

      setCartData(cleaned);
    }



    setIsUpdated(false);
    cartTotal();
    //console.log("useEffe 0", cartData)
  }, [cartData]);

  useEffect(() => {
  
     const cart_data_localstorage: any = window.localStorage.getItem("cart_product_data");
    const data = JSON.parse(cart_data_localstorage);
    setCartData([]);
    
    if (data) {
      const cleaned = data.filter((item: cartProductType) => {
        const quantity = Number(item.quantity);
        const price = parseFloat(item.price as any);
        return !isNaN(quantity) && !isNaN(price) && quantity >= 0 && price >= 0;
      });
    
      setCartData(cleaned);
    }



  }, []);

 

  function cartTotal() {
    let total = 0;
  
    if (cartData.length > 0) {
      cartData.forEach((element, idx) => {
        const quantity = Number(element.quantity);
        const price = parseFloat(element.price as any);
  
        // Validation: skip bad items
        if (isNaN(quantity) || isNaN(price)) {
          console.warn(` Skipping bad cart item at index ${idx}:`, element);
          return;
        }
  
        total += quantity * price;
      });
    }
  
    setProductTotalCost(parseFloat(total.toFixed(2)));
    setIsUpdated(true);
  }



  function addProductToCart(newProduct: cartProductType) {
    //  Validate incoming product data
    if (
      isNaN(Number(newProduct.quantity)) ||
      isNaN(parseFloat(newProduct.price as any))
    ) {
      console.warn("Invalid product data, skipping:", newProduct);
      return;
    }
  
    const isItemInCart = cartData.find((cartItem) => cartItem.id === newProduct?.id);
  
    if (isItemInCart) {
      setCartData(
        cartData.map((cartItem) =>
          cartItem.id === newProduct?.id
            ? { ...cartItem, quantity: cartItem.quantity! + newProduct.quantity! }
            : cartItem
        )
      );
    } else {
      if (typeof window !== "undefined") {
        setCartData([
          ...cartData,
          {
            ...newProduct,
            quantity: newProduct.quantity!,
          },
        ]);
      }
    }
  }
  

  function decCartProduct(decProduct: cartProductType) {
    //this funciton dec product almost to 1
    setCartData(
      cartData.map((item: cartProductType) => {
        return item.id === decProduct.id
          ? item.quantity! > 1
            ? { ...item, quantity: item.quantity! - 1 }
            : item
          : item;
      })
    );
    setIsUpdated(true);
  }
  function decCartProductAll(decProduct: cartProductType) {
    //this funciton dec product almost to 0
    //removeCartProduct
    setCartData(
      cartData.map((item: cartProductType) => {
        return item.id === decProduct.id
          ? item.quantity! > 0
            ? { ...item, quantity: item.quantity! - 1 }
            : item
          : item;
      })
    );
    setIsUpdated(true);
  }

  function removeCartProduct(item: cartProductType | undefined) {
    const isItemInCart = cartData.find((cartItem) => cartItem.id === item?.id) as cartProductType ;
  //  console.log("item qu-- ", isItemInCart.quantity!);
    if (isItemInCart.quantity! <= 1) {
      setCartData(cartData.filter((cartItem) => cartItem.id !== item?.id)); // if the quantity of the item is 1, remove the item from the cart
    } else {
      setCartData(
        cartData.map((cartItem) =>
          cartItem.id === item?.id
            ? { ...cartItem, quantity: cartItem.quantity! - 1 } // if the quantity of the item is greater than 1, decrease the quantity of the item
            : cartItem
        )
      );
    }

    // setCartData(
    //   cartData.filter((item: cartProductType) => {
    //     return item.productId !== remProduct.productId;
    //   })
    // );

    setIsUpdated(true);
  }

  function emptyCart() {
    setCartData([]);

    setIsUpdated(true);
  }
  
  
  function addProduct(newProduct: cartProductType) {
    //  Validate incoming product data
    if (
      isNaN(Number(newProduct.quantity)) ||
      isNaN(parseFloat(newProduct.price as any))
    ) {
      console.warn("Invalid product data, skipping:", newProduct);
      return;
    }
  
    const isItemInCart = cartData.find((cartItem) => cartItem.id === newProduct.id);
  
    if (isItemInCart) {
      setCartData(
        cartData.map((cartItem) =>
          cartItem.id === newProduct.id
            ? { ...cartItem, quantity: cartItem.quantity! + 1 }
            : cartItem
        )
      );
    } else {
      if (typeof window !== "undefined") {
        setCartData([
          ...cartData,
          {
            ...newProduct,
            quantity: 1,
          },
        ]);
      }
    }
  }


  // const getCartTotal = () => {
  //   return cartData.reduce(
  //     (total, item) => total + (+item.price) * item.quantity!,
  //     0
  //   ); // calculate the total price of the items in the cart
  // };

  function addAddress(address:addressT) {
    if (typeof window !== 'undefined') {
    localStorage.setItem("customer_address", JSON.stringify(address));
    }
  }
  // function getAddress() {
  //   const address = window.localStorage.getItem("customer_address");
  //   setAddress(JSON.parse(address));
  // }

  
       function setEndTotalG(t:number){
       // console.log("in store set end total------", t)
        if (typeof window !== 'undefined') {
          localStorage.setItem("END_TOTAL", JSON.stringify(t));
          }
setEndTotalL(t)
       }

      
 function setTotalDiscountG(d:number){
  setTotalDiscountL(d)
 }
 


  return (
    <CartContext.Provider
      value={{
       
        cartData,
        address,
        addProduct,
        addAddress,
        endTotalG,
        setEndTotalG,
      //  getAddress,
        counter,
        productTotalCost,
        addProductToCart,
        decCartProduct,
        decCartProductAll,
        removeCartProduct,
        emptyCart,
        totalDiscountG,
  setTotalDiscountG,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
