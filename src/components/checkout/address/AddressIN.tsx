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
import { findAddressByMob } from "@/app/(universal)/action/address/dbOperations";
import { useState } from "react";
import {
  fetchLocations,
  getLocationByName,
} from "@/app/(universal)/action/location/dbOperation";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";

export default function AddressIN() {
  //const { setCustomerAddress } = useCartContext();

  const [locations, setLocations] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

 

  useEffect(() => {
   // setCustomerAddressIsComplete(false);
    // setValue("password", "123456");
    // setValue("city", "abc");
  }, []);
useEffect(() => {
  console.log("AddressIN mounted");
  return () => console.log("AddressIN unmounted");
}, []);

useEffect(() => {
  let isMounted = true;

  async function loadLocations() {
    const result = await fetchLocations();

    // normalize once to prevent crashes
    const normalized = result.map((loc: any) => ({
      ...loc,
      searchName:
        loc.searchName ??
        loc.name?.toLowerCase().replace(/\s+/g, "") ??
        "",
    }));

    if (isMounted) {
      setLocations(normalized);
    }
  }

  loadLocations();

  return () => {
    isMounted = false;
  };
}, []);


function handleLocationInput(value: string) {
  const term = value.toLowerCase().replace(/\s+/g, "");

  if (term.length < 2) {
    setSuggestions([]);
    setShowSuggestions(false);
    return;
  }

  const filtered = locations.filter(
    (loc) => loc.searchName && loc.searchName.includes(term)
  );

  setSuggestions(filtered.slice(0, 6));
  setShowSuggestions(true);
}





function normalizeLocation(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function handleVillageTownCostCheck(value: string) {
  const clean = value.toLowerCase().replace(/\s+/g, "");

  if (clean.length < 3) return;

  const match = locations.find(
    (loc) => loc.searchName && clean.startsWith(loc.searchName)
  );

  if (match) {
    setdeliveryDis({
      deliveryFee: match.deliveryFee,
      minSpend: match.minSpend,
      deliveryDistance: match.deliveryDistance,
      note: match.notes ?? "",
      productCat: "NA",
      id: match.id,
      name: match.name,
    });

    console.log("DELIVERY ZONE FOUND ✔", match.name);
  } else {
    setdeliveryDis(null);
    console.log("NO MATCH — manual area");
  }
}





  function changeEmailHandler() {
    // emailFormToggle(true);
  }

  const {
    register,
    handleSubmit,
    setValue,
     watch,
    formState: { errors },
  } = useForm<TAddressCheckoutSMALL>({
    resolver: zodResolver(addressCheckoutSMALL),

    defaultValues: {
      city: "Jalandhar",
      state: "Punjab",
    },
  });







  async function onSubmit(data: TAddressCheckoutSMALL) {
    console.log("data--------", data);
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

    // if (deliveryType === "delivery" && data.addressLine1 === "") {
    //   addressIsComplete = false;
    //   alert("Please fill you Village / Town / locality");
    //   //Please enter the postcode for delivery or choose pickup
    // }

    if (deliveryType === "delivery" && data.addressLine1 === "") {
  addressIsComplete = false;
  toast.error("Please fill your Village / Town / Locality");
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

  async function handleMobSearch(input: string) {
    let mob = input
      .replace(/\D/g, "") // digits only
      .replace(/^0+/, "") // remove 0 prefix
      .replace(/^91/, ""); // remove +91

    if (mob.length !== 10) return;

    const result = await findAddressByMob(mob);

    if (result) {
      setValue("firstName", result.firstName);
      setValue("lastName", result.lastName);
      setValue("email", result.email ?? "");
      setValue("addressLine1", result.addressLine1 ?? "");
      setValue("addressLine2", result.addressLine2 ?? "");
      setValue("city", result.city ?? "Jalandhar");
      setValue("state", result.state ?? "Punjab");
      setValue("zipCode", result.zipCode ?? "");
      setValue("userId", result.userId ?? "");

      console.log("USER FOUND ✔ Autofilled");
    } else {
      console.log("NO ADDRESS FOUND — new user");
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
            {/* <input
              {...register("mobNo")}
              className="input-light"
              placeholder="10 digit mobile number"
            /> */}
            <input
              {...register("mobNo")}
              className="input-light"
              placeholder="10 digit mobile number"
              inputMode="numeric"
              autoComplete="tel"
              onChange={async (e) => {
                let digits = e.target.value
                  .replace(/\D/g, "")
                  .replace(/^0+/, "")
                  .replace(/^91/, "");

                // update RHF field value
                setValue("mobNo", digits, { shouldValidate: true });

                if (digits.length === 10) {
                  await handleMobSearch(digits);
                }
              }}
              onBlur={async (e) => {
                let digits = e.target.value
                  .replace(/\D/g, "")
                  .replace(/^0+/, "")
                  .replace(/^91/, "");

                setValue("mobNo", digits, { shouldValidate: true });

                if (digits.length === 10) {
                  await handleMobSearch(digits);
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  let digits = e.currentTarget.value
                    .replace(/\D/g, "")
                    .replace(/^0+/, "")
                    .replace(/^91/, "");

                  setValue("mobNo", digits, { shouldValidate: true });

                  if (digits.length === 10) {
                    await handleMobSearch(digits);
                  }
                }
              }}
            />
             {errors.mobNo?.message && (
    <span className="text-red-500 text-sm">{errors.mobNo?.message}</span>
  )}
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-light">First Name *</label>
              <input {...register("firstName")} className="input-light" />
              {errors.firstName?.message && (
    <span className="text-red-500 text-sm">{errors.firstName?.message}</span>
  )}
            </div>

            <div>
              <label className="label-light">Last Name *</label>
              <input {...register("lastName")} className="input-light" />
               {errors.lastName?.message && (
    <span className="text-red-500 text-sm">{errors.lastName?.message}</span>
  )}
            </div>
          </div>

          {/* Village / Locality */}
          <div className="relative">
            <label className="label-light">
              Village / Locality / Town <span className="text-red-500">*</span>
            </label>


{(() => {
  const {
    onChange,
    onBlur,
    ref,
    name,
  } = register("addressLine1");

  return (
    <input
      name={name}
      ref={ref}
      className="input-light"
      placeholder="Village / Town"
      autoComplete="off"
      onChange={(e) => {
        onChange(e); //  REQUIRED: update RHF state

        const value = e.target.value;
        handleLocationInput(value);        // 🔍 suggestions
        handleVillageTownCostCheck(value); // 🚚 delivery lookup
      }}
      onFocus={(e) => handleLocationInput(e.target.value)}
      onBlur={(e) => {
        onBlur(e); //  REQUIRED
        setTimeout(() => setShowSuggestions(false), 200);
      }}
    />
  );
})()}

 {errors.addressLine1?.message && (
    <span className="text-red-500 text-sm">{errors.addressLine1?.message}</span>
  )}

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded-md w-full shadow-md max-h-48 overflow-y-auto mt-1">
                {suggestions.map((loc) => (
<li
  key={loc.id}
  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
  onClick={() => {
    setValue("addressLine1", loc.name, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("city", loc.city || "Jalandhar");
    setValue("state", loc.state || "Punjab");

    handleVillageTownCostCheck(loc.name); //  FINAL lookup

    setSuggestions([]);
    setShowSuggestions(false);
  }}
>
  <span className="font-medium">{loc.name}</span>
  {loc.city && <span className="text-gray-500"> — {loc.city}</span>}
</li>


                ))}
              </ul>
            )}
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
        <div className="flex items-center gap-2 mt-4">
  <button
    type="submit"
    className="w-fit px-5 py-2 text-gray-500 rounded-md bg-green-100 hover:bg-gray-200 transition"
  >
    Use this address
  </button>

  {customerAddressIsComplete && (
    <FaCheck className="text-green-500" size={20} />
  )}
</div>
      </form>
    </div>
  );
}
