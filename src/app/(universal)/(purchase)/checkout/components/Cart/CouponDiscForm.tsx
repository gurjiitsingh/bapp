import { fetchcouponByCode } from "@/app/(universal)/action/coupon/dbOperation";
import {
  couponCodeSchema,
  TcouponCodeSchema,
} from "@/lib/types/couponDiscType";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";


export default function CouponDiscount() {
  const { setCouponDisc, couponDisc } = UseSiteContext();
  const [couponSuccess, setCouponSuccess] = useState("");

  useEffect(() => {
    //console.log("couponDisc-----------", couponDisc?.code)
  }, [couponDisc]);

  const {
    register,
    formState: { errors },
    //setValue,
    // control,
    // watch,
    handleSubmit,
    // setError,
    formState: {}, //dirtyFields
  } = useForm<TcouponCodeSchema>({
    resolver: zodResolver(couponCodeSchema),
  });

  async function onSubmit(data: TcouponCodeSchema) {
    const couponCode = data.coupon.toUpperCase();

    const result = await fetchcouponByCode(couponCode);
  
    if (result.length !== 0) {
      setCouponSuccess("Gutschein angewendet");
    } else {
      setCouponSuccess("Falscher Gutschein");
    }

    setCouponDisc(result[0]);
    //  if (!result?.errors) {
    //    // router.push('/admin/coupons')

    //  } else {
    //    alert("Some thing went wrong");
    //  }

    //  if (result.errors) {
    //    // not network error but data validation error
    //    const errors: Terror = result.errors;

    //    if (errors.coupon) {
    //      setError("coupon", {
    //        type: "server",
    //        message: errors.coupon,
    //      });
    //    }
    //  }

   // console.log("response in create coupon form ", result);
  }

  return (
    <>
      <div className="w-full border rounded-xl py-2 px-2 shadow-md">
        <div className="flex flex-col gap-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start gap-1">
              <div className="flex  gap-1 justify-start ">
                <label className="text-left label-style text-[.5rem] ">
                  Gutschein ausfüllen und Button klicken*
                  {/* Fill coupon and click button */}
                  <span className="text-red-500">*</span>{" "}
                </label>
              
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col">
              <input {...register("coupon")} className="input-style" />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.coupon?.message && (
                    <span>{errors.coupon?.message}</span>
                  )}
                </span>
                </div>
                {couponDisc === undefined ? (
                  <button
                    className="w-[200px] py-1 h-8 text-center bg-red-300 text-white font-semibold rounded-2xl text-[1rem]"
                    onClick={() => {}}
                    name="button_1"
                  >
                    Anwenden
                  </button>
                ) : (
                  <button
                    className="w-[200px] py-1 h-8 text-center bg-green-300 text-white font-semibold rounded-2xl text-[1rem]"
                    onClick={() => {}}
                    name="button_1"
                  >
                    Anwenden
                  </button>
                )}
              </div>
            
            </div>
          </form>
        </div>
        <div className="text-red-300 text-sm">  {couponSuccess}</div>
         <div className="text-slate-400 text-sm">  {couponDisc?.message}</div>
      </div>
    </>
  );
}

{
  /* Anwenden -- Apply */
}
