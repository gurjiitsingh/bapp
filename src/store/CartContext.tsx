import { createContext, useContext } from "react";
//import { cartProductType } from  '@/lib/types/cartProductType'
//import { cartProductTypeT } from "@/lib/types/cartProductTypeype";


import { addressT } from "@/lib/types/addressType";
import { cartProductType } from "@/lib/types/cartDataType";
interface CartContextType {
  counter: number;
  productTotalCost: number;
  cartData: cartProductType[];
  address: addressT;
  addAddress: (a:addressT) => void;

  //getAddress:()=>{};
  addProduct: (c: cartProductType) => void;
  addProductToCart: (c: cartProductType ) => void;
  decCartProduct: (c: cartProductType) => void;
  decCartProductAll: (c: cartProductType) => void;
  removeCartProduct: (c: cartProductType | undefined) => void;
  emptyCart: () => void;
  endTotalG: number;
  setEndTotalG: (c: number) => void;
  totalDiscountG: number;
  setTotalDiscountG: (c: number) => void;
  
}

//const CartContext = createContext<CartContextType | null>(null);

const CartContext = createContext<CartContextType>({
  counter: 0,
  endTotalG: 0,
  setEndTotalG: () => {},
  productTotalCost: 0,
  cartData: [],
  address: {
    name: "",
    mobNo: "",
    city: "",
    state: "",
    zipCode: "",
    addressLine1: "",
    addressLine2: "",
    userId: "",
  },
 
  addAddress: (a:addressT) => {return a},
  // getAddress:()=>{},
  addProduct: () => {},
  addProductToCart: (p:cartProductType) => {return p},
  decCartProduct: () => {},
  decCartProductAll: () => {},
  removeCartProduct: () => {},
  emptyCart: () => {},
  totalDiscountG: 0,
  setTotalDiscountG: () => {},
});

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartContextProvider");
  }
  return context;
};

export default CartContext;
