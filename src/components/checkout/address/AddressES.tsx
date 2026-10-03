"use client";

import { useCartContext } from "@/store/CartContext";
import { useForm } from "react-hook-form";
import {
  addressCheckoutSMALL,
  addressResT,
  TAddressCheckoutSMALL,
} from "@/lib/types/addressType";
import { createNewOrderCustomerAddressSMALL } from "@/app/(universal)/action/orders/dbOperations";
import { purchaseDataT } from "@/lib/types/cartDataType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { findAddressByMob, searchAddressByMob } from "@/app/(universal)/action/address/dbOperations";
import { useState } from "react";
import {
  fetchLocations,
  getLocationByName,
} from "@/app/(universal)/action/location/dbOperation";
import {
  searchAddressEmail,
  // searchAddressByUserId,
} from "@/app/(universal)/action/address/dbOperations";

import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { fetchdeliveryByZip } from "@/app/(universal)/action/delivery/dbOperation";
import { Check, Hash, Home, Mail, MapPin, Phone, User } from "lucide-react";

export default function AddressAll() {
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

  async function getAddressByEmail(inputEmail: string) {
    console.log("START: searchAddressEmail ------------------", inputEmail)
    const addressRes = await searchAddressEmail(inputEmail);
    console.log("FETCHED searchAddressEmail------------------", addressRes)
    if (addressRes) {
      setAddress(addressRes);
      const zipInfo = await fetchdeliveryByZip(addressRes.zipCode);
      setdeliveryDis(zipInfo);
    } else {
      setAddressReset();
      console.warn("No address found for email:", inputEmail);
    }
  }

  async function getAddressByMob(inputMob: string) {
    //  console.log("START: searchAddressMob ------------------",inputEmail)
    const addressRes = await searchAddressByMob(inputMob);
    console.log("FETCHED searchAddressEmail------------------", addressRes)
    if (addressRes) {
      setAddress(addressRes);
      const zipInfo = await fetchdeliveryByZip(addressRes.zipCode);
      setdeliveryDis(zipInfo);
    } else {
      setAddressReset();
      console.warn("No address found for email:", inputMob);
    }
  }




  useEffect(() => {
    // console.log("Identifier value come from email cature form ----------------", customerEmail)
    if (!customerEmail?.trim()) {
      return;
    }

    const identifier = customerEmail.trim();

    // =====================================================
    // EMAIL
    // =====================================================

    if (isEmailIdentifier(identifier)) {
      console.log("CUSTOMER IDENTIFIER = EMAIL:", identifier);
      getAddressByEmail(identifier)
      // Put identifier in EMAIL field
      setValue("email", identifier);

      // Clear mobile field
      setValue("mobNo", "");

      return;
    }

    // =====================================================
    // MOBILE
    // =====================================================

    const mobile = normalizeMobile(identifier);
    if (!isEmailIdentifier(identifier)) {
      if (mobile.length === 10) {
        console.log("CUSTOMER IDENTIFIER = MOBILE:", mobile);

        // Put identifier in MOBILE field
        //setValue("mobNo", mobile);
        setValue("mobNo", mobile, { shouldValidate: true });
        getAddressByMob(mobile)
        // Clear email field
        setValue("email", "");

        return;
      }
    }
    console.warn(
      "Invalid customer identifier:",
      identifier
    );
  }, [customerEmail]);




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

      //    console.log("cokies fill---------------------", customAddress)
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


  //********************************************************
  // THIS FUNCITON NOT INTENTIONA CAN BE REMOVED AFTER CHECK
  //********************************************************
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




  // =========================================================
  // CUSTOMER IDENTIFIER HELPERS
  // customerEmail can be EMAIL or MOBILE
  // =========================================================

  function isEmailIdentifier(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function normalizeMobile(value: string): string {
    return value
      .replace(/\D/g, "")
      .replace(/^0+/, "")
      .replace(/^91/, "");
  }

  function isMobileIdentifier(value: string): boolean {
    return normalizeMobile(value).length === 10;
  }


  // =========================================================
  // RESET ADDRESS
  // Keep the entered identifier in the correct field
  // =========================================================

  function setAddressReset(identifier?: {
    email?: string;
    mobNo?: string;
  }) {

    // console.log("email and phone----------------",email,  mobNo)
    setValue("email", identifier?.email ?? "");

    setValue("firstName", "");
    setValue("lastName", "");

    setValue("mobNo", identifier?.mobNo ?? "");

    setValue("addressLine1", "");
    setValue("addressLine2", "");

    setValue("city", "");
    setValue("state", "");
    setValue("zipCode", "");

    setValue("userId", "");
  }


  // =========================================================
  // SET EXISTING CUSTOMER ADDRESS
  // =========================================================

  function setAddress(addressRes: addressResT) {
    console.log("setAddress: -----------------------", addressRes)

    setValue("email", addressRes.email ?? "");
    setValue(
      "firstName",
      addressRes.firstName ?? ""
    );

    setValue(
      "lastName",
      addressRes.lastName ?? ""
    );

    setValue(
      "mobNo",
      addressRes.mobNo ?? ""
    );

    setValue(
      "addressLine1",
      addressRes.addressLine1 ?? ""
    );

    setValue(
      "addressLine2",
      addressRes.addressLine2 ?? ""
    );

    setValue(
      "city",
      addressRes.city ?? ""
    );

    setValue(
      "state",
      addressRes.state ?? ""
    );

    setValue(
      "zipCode",
      addressRes.zipCode ?? ""
    );

    setValue(
      "userId",
      addressRes.userId ?? ""
    );
  }


  // =========================================================
  // CUSTOMER LOOKUP
  // Detect EMAIL OR MOBILE first
  // =========================================================

  async function getCustomerByIdentifier(
    identifier: string
  ) {
    const value = identifier.trim();

    if (!value) {
      return;
    }

    console.log(
      "CUSTOMER IDENTIFIER ------------------",
      value
    );


    // =======================================================
    // EMAIL
    // =======================================================

    if (isEmailIdentifier(value)) {
      console.log(
        "IDENTIFIER TYPE ------------------ EMAIL"
      );

      const addressRes =
        await searchAddressEmail(value);

      console.log(
        "ADDRESS BY EMAIL ------------------",
        addressRes
      );

      if (addressRes) {
        setAddress(addressRes);

        if (addressRes.zipCode) {
          const zipInfo =
            await fetchdeliveryByZip(
              addressRes.zipCode
            );

          setdeliveryDis(zipInfo);
        }
      } else {
        // New customer using EMAIL
        // setAddressReset({
        //   email: value,
        // });

        console.warn(
          "No address found for email:",
          value
        );
      }

      return;
    }








    // =======================================================
    // MOBILE
    // =======================================================

    // if (isMobileIdentifier(value)) {
    //   const mobile = normalizeMobile(value);

    //   console.log(
    //     "IDENTIFIER TYPE ------------------ MOBILE"
    //   );

    //   console.log(
    //     "NORMALIZED MOBILE ------------------",
    //     mobile
    //   );

    //   const addressRes =
    //     await findAddressByMob(mobile);

    //   console.log(
    //     "ADDRESS BY MOBILE ------------------",
    //     addressRes
    //   );

    //   if (addressRes) {
    //     setAddress(addressRes);

    //     if (addressRes.zipCode) {
    //       const zipInfo =
    //         await fetchdeliveryByZip(
    //           addressRes.zipCode
    //         );

    //       setdeliveryDis(zipInfo);
    //     }
    //   } else {
    //     // New customer using MOBILE
    //     setAddressReset({
    //       mobNo: mobile,
    //     });

    //     console.warn(
    //       "No address found for mobile:",
    //       mobile
    //     );
    //   }

    //   return;
    // }


    // =======================================================
    // INVALID IDENTIFIER
    // =======================================================

    console.warn(
      "Invalid customer identifier:",
      value
    );
  }











  



  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-5 font-sans">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Delivery Address
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Where should we send your order?
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("FORM ERRORS ❌", errors);
        })}
        className="space-y-5"
      >
        {/* ================= REQUIRED SECTION ================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Contact & Location
            </span>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                {...register("mobNo")}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="10 digit mobile number"
                inputMode="numeric"
                autoComplete="tel"
                onChange={async (e) => {
                  let digits = e.target.value
                    .replace(/\D/g, "")
                    .replace(/^0+/, "")
                    .replace(/^91/, "");

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
            </div>
            {errors.mobNo?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.mobNo?.message}
              </p>
            )}
          </div>

          {/* Name Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  {...register("firstName")}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="First name"
                />
              </div>
              {errors.firstName?.message && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.firstName?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName")}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="Last name"
              />
              {errors.lastName?.message && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.lastName?.message}
                </p>
              )}
            </div>
          </div>

          {/* Village / Locality with Auto-complete */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Village / Locality / Town <span className="text-red-500">*</span>
            </label>

            {(() => {
              const { onChange, onBlur, ref, name } = register("addressLine1");

              return (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    name={name}
                    ref={ref}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="Search village or area..."
                    autoComplete="off"
                    onChange={(e) => {
                      onChange(e);
                      const value = e.target.value;
                      handleLocationInput(value);
                      handleVillageTownCostCheck(value);
                    }}
                    onFocus={(e) => handleLocationInput(e.target.value)}
                    onBlur={(e) => {
                      onBlur(e);
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                </div>
              );
            })()}

            {errors.addressLine1?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.addressLine1?.message}
              </p>
            )}

            {/* Dropdown Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-30 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-52 overflow-y-auto mt-1.5 py-1 divide-y divide-gray-50">
                {suggestions.map((loc) => (
                  <li
                    key={loc.id}
                    className="px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 cursor-pointer text-sm flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setValue("addressLine1", loc.name, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("city", loc.city || "Jalandhar");
                      setValue("state", loc.state || "Punjab");

                      handleVillageTownCostCheck(loc.name);
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">
                        {loc.name}
                      </span>
                      {loc.city && (
                        <span className="text-xs text-gray-400">
                          , {loc.city}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                City
              </label>
              <input
                {...register("city")}
                className="w-full px-3 py-2 bg-gray-100/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none cursor-not-allowed"
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                State
              </label>
              <input
                {...register("state")}
                className="w-full px-3 py-2 bg-gray-100/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* ================= OPTIONAL SECTION ================= */}
        <div className="space-y-4 pt-3">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Additional Details (Optional)
            </span>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                {...register("email")}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* House / Street & Pincode */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Flat / House / Building
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Home className="w-4 h-4" />
                </div>
                <input
                  {...register("addressLine2")}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="Apt 4B, Street 12"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Pincode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <input
                  {...register("zipCode")}
                  className="w-full pl-8 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="144001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Save Address & Continue</span>
            {customerAddressIsComplete && (
              <Check className="w-5 h-5 text-emerald-400" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
 




}
