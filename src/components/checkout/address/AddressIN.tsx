"use client";

import { useCartContext } from "@/store/CartContext";
import { useForm } from "react-hook-form";
import {
  addressCheckoutSMALL,
  TAddressCheckoutSMALL,
} from "@/lib/types/addressType";
import { createNewOrderCustomerAddressSMALL } from "@/app/(universal)/action/orders/dbOperations";
import { purchaseDataT } from "@/lib/types/cartDataType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AddressIN() {
  //const { setCustomerAddress } = useCartContext();

  const { TEXT } = useLanguage();
  const {
    //deliveryDis,

    setdeliveryDis,
    chageDeliveryType,
    deliveryType,
    customerEmail,
    setCustomerAddressIsComplete,
    customerAddressIsComplete,
    emailFormToggle,
  } = UseSiteContext();

  //   useEffect(() => {

  //     if (customerEmail !== undefined) {
  //       getAddressByEmail(customerEmail);
  //     }
  //     if (deliveryType === null) {
  //       chageDeliveryType("pickup");
  //     }
  //  // }, [session, customerEmail]);
  // }, [ customerEmail]);

  useEffect(() => {
    setCustomerAddressIsComplete(false);
    // setValue("password", "123456");
    // setValue("city", "abc");
  }, []);

  //   async function handleZipcodeChange(e: React.ChangeEvent<HTMLInputElement>) {
  //     const zipname: string = e.target.value;
  //     if (zipname.length > 4) {
  //       const result = await fetchdeliveryByZip(zipname);
  //       setdeliveryDis(result);
  //     }
  //   }

  function changeEmailHandler() {
    // emailFormToggle(true);
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TAddressCheckoutSMALL>({
    resolver: zodResolver(addressCheckoutSMALL),

    defaultValues: {
      city: "Jalandhar",
      state: "Punjab",
    },
  });

  async function onSubmit(data: TAddressCheckoutSMALL) {
    console.log("data--------",data)
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("userId", data.userId ?? "");
    formData.append("email", data.email ?? "");
    formData.append("mobNo", data.mobNo!);
    formData.append("password", "123456");
    formData.append("addressLine1", data.addressLine1 ?? "");
    formData.append("addressLine2", data.addressLine2 ?? "");
    formData.append("city", data.city ?? "Jalandhar");
    formData.append("state", data.state ?? "Punjab");
    formData.append("zipCode", data.zipCode ?? "");

    // ZIP NOT REQUIRED ANYMORE
    // setCustomerAddressIsComplete(true);
     let addressIsComplete = true;

    if (deliveryType === "delivery" && data.addressLine1 === "") {
      addressIsComplete = false;
      alert(
        "Please fill you Village / Town / locality"
      );
      //Please enter the postcode for delivery or choose pickup
    }
 if (addressIsComplete) {
      setCustomerAddressIsComplete(true);
       const customAddress = {
      firstName: data.firstName,
      lastName: data.lastName,
      userId: data.userId ?? "",
      email: data.email ?? "",
      mobNo: data.mobNo,
      addressLine1: data.addressLine1 ?? "",
      addressLine2: data.addressLine2 ?? "",
      city: data.city ?? "Jalandhar",
      state: data.state ?? "Punjab",
      zipCode: data.zipCode ?? "",
    };
      if (typeof window !== "undefined") {
        localStorage.setItem("customer_address", JSON.stringify(customAddress));
      }
      //await addCustomerAddress(formData);

      const purchaseData = {
        userId: "sfad", //session?.user?.id,
        address: customAddress,
      } as purchaseDataT;

       const result = await createNewOrderCustomerAddressSMALL(purchaseData);

      const addressAddedIdS = result.addressAddedId;
      const userAddedIdS = result.UserAddedId;
      const customerNameS = result.customerName;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "customer_address_Id",
          JSON.stringify(addressAddedIdS)
        );
        localStorage.setItem("order_user_Id", JSON.stringify(userAddedIdS));
        localStorage.setItem("customer_name", JSON.stringify(customerNameS));
      }


//  const WINONDER_ENABLED = process.env.NEXT_PUBLIC_WINONDER === "true";
//   if (WINONDER_ENABLED) {
//     const { createNewOrderFile } = await import(
//       '@/app/(universal)/action/newOrderFile/newfile'
//     );
//     createNewOrderFile(cartData, customAddress);
//   }
//     }
  }
}

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Billing Details
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("FORM ERRORS ❌", errors);
        })}
        className="space-y-6"
      >
        {/* ================= REQUIRED SECTION ================= */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">
            Required Information
          </h3>

          {/* Mobile */}
          <div>
            <label className="label-light">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("mobNo")}
              className="input-light"
              placeholder="10 digit mobile number"
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-light">First Name *</label>
              <input {...register("firstName")} className="input-light" />
            </div>

            <div>
              <label className="label-light">Last Name *</label>
              <input {...register("lastName")} className="input-light" />
            </div>
          </div>

          {/* Village / Locality */}
          <div>
            <label className="label-light">
              Village / Locality / Town <span className="text-red-500">*</span>
            </label>
            <input {...register("addressLine1")} className="input-light" />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            {/* CITY DROPDOWN */}
            <div>
              <label className="label-light">City</label>
              <select
                {...register("city")}
                className="input-light"
                defaultValue="Jalandhar"
              >
                <option value="Jalandhar">Jalandhar</option>
                <option value="Kapurthala">Kapurthala</option>
                <option value="Hoshiarpur">Hoshiarpur</option>
              </select>
            </div>

            {/* STATE HARDCODED */}
            <div>
              <label className="label-light">State</label>
              <input
                {...register("state")}
                className="input-light"
                defaultValue="Punjab"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* ================= OPTIONAL SECTION ================= */}
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">
            Optional Information
          </h3>

          {/* Email */}
          <div>
            <label className="label-light">Email</label>
            <input
              {...register("email")}
              className="input-light"
              placeholder="you@example.com"
            />
          </div>

          {/* House / Street */}
          <div>
            <label className="label-light">House / Street</label>
            <input {...register("addressLine2")} className="input-light" />
          </div>

          {/* Pincode */}
          <div>
            <label className="label-light">Pincode</label>
            <input {...register("zipCode")} className="input-light" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full mt-4 py-2 text-gray-500 rounded-md bg-gray-300 hover:bg-gray-200 transition"
        >
          Use this address
        </button>
      </form>
    </div>
  );
}
