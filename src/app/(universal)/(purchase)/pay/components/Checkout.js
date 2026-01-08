
import {
    PayPalButtons,
   
    usePayPalScriptReducer,
  } from "@paypal/react-paypal-js";

  
  
  import { useRouter, useSearchParams } from "next/navigation";
  import { useCartContext } from "@/store/CartContext";

export default function Checkout(){
 const searchParams = useSearchParams();
   const orderMasterId = searchParams.get("orderMasterId");
   const deliveryType = searchParams.get("deliveryType");
  const customerNote = searchParams.get("customerNote");
  const couponCode = searchParams.get("couponCode");
  const couponDiscount = searchParams.get("couponDiscount");
  

    const [{ options, isPending,isRejected,isResolved, isInitial  }, dispatch] = usePayPalScriptReducer();
  
    const router = useRouter();
    const {   endTotalG } = useCartContext();



//    if (
//     !endTotalG || 
//     typeof endTotalG !== "number" || 
//     isNaN(endTotalG)
//   ) {
// //  toast.error(TEXT.error_address_not_deliverable);
// toast.error("Something went wrong, refresh browser or reorder foods");
//    console.log("paypal not a number")
//    // return; // ⛔ stop
//   }

    
    const formattedAmount = (Number(endTotalG) || 0).toFixed(2);

   

  

  
     const onCreateOrder = (data,actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: formattedAmount,
                    },
                },
            ],
        });
    }
  
  
  

  
    const onApproveOrder = (data, actions) => {
      return actions.order.capture().then((details) => {
	  // const payer = details.payer;
    // 	  console.log("details-----",payer);
          router.push(`/complete?paymentType=paypal&status=success&orderMasterId=${orderMasterId}&deliveryType=${deliveryType}&customerNote=${customerNote}&couponCode=${couponCode}&couponDiscount=${couponDiscount}`)
       });
    };
 
    const onError = (err) => {
      //console.log("paypal errot-------------",err)
     router.push(`/order-fail?paymentType=paypal&status=fail&orderMasterId=${orderMasterId}&error=${encodeURIComponent(err)}`)
  }

  const onCancel= (data) => {
   // console.log("Payment Cancelled:", data);
    router.push(`/order-cancel?paymentType=paypal&status=cancel&orderMasterId=${orderMasterId}`)
  }


 
  
    return (<div className="flex container mx-auto px-[30%] items-center justify-center my-[20%] ">
      <div className="checkout">
        {(isPending || typeof window === 'undefined' || !window.paypal) ? (
          <p>LOADING...</p>
        ) : (
          <>
        
            <PayPalButtons
              message={{
                amount: formattedAmount,
                align: "center",
                color: "black",
                position: "top",
              }}
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => onCreateOrder(data, actions)}
              onApprove={(data, actions) => onApproveOrder(data, actions)}
              onError={ (err)=> onError(err)}
              onCancel = {(data)=> onCancel(data)}
            />

            
           
          </>
        )}
      </div></div>
    );
  };
