'use client'

import React, { useContext } from 'react'
import CartContext from '@/store/cartcontext'

const Subtotal = () => {
const { cartData }= useContext(CartContext);
console.log("in the subtoal");
console.log(cartData);

 var total=0;
if(cartData.length>0){
 cartData.forEach(element => {
   total = total + parseInt(element.quantity) * parseFloat(element.price).toFixed(2)   
});
}

  return (<>
  <h2 className='flex border-b-2 by-2 p-3 text-[1.3rem] mt-12'>Cart Total</h2>
    <div className='w-full flex flex-col gap-3 bg-slate-50  px-3 py-3 justify-between mt-10 my-10'>
    
    <div className='flex border-b-2 by-2 p-3'>Cupone Code</div>
    <div className='flex border-b-2 by-2 p-3 justify-between'><div>Subtotal</div><div>${total.toFixed(2)} </div></div>
    <div className='flex border-b-2 by-2 p-3 justify-between'><div>Shipping</div><div>$0 </div></div>
    <div className='flex border-b-2 by-2 p-3 justify-between'><div>Total</div><div>${total.toFixed(2)} </div></div>
    </div>
  </>
  )
}

export default Subtotal