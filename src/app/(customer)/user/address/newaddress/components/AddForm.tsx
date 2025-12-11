"use client";
import React, {  useEffect } from "react";
import { useForm } from "react-hook-form"; //, Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchimaCheckout, TaddressSchemaCheckout } from "@/lib/types/addressType";
import { Button } from "@/components/ui/button";
//import { useSearchParams } from "next/navigation";
import { newCustomerAddress } from "@/app/(universal)/action/checkout/dbOperations";
import {  searchUserById, } from "@/app/(universal)/action/user/dbOperation";

import { useSession } from "next-auth/react";

const AddForm = () => {
  const { data: session } = useSession();//, status
  
   useEffect(()=>{
      async function getUserDataById(userId:string) {
        console.log("addressRes", userId);
      const  userRes = await searchUserById(userId) ;
     
        if (userRes !== null) {
       
          setValue("email", userRes.email);
        //  setValue("firstName", addressRes.firstName);
         // setValue("lastName", addressRes.lastName);
          setValue("userId", userId);
          // setValue("email", addressRes.email);
       //   setValue("mobNo", addressRes.mobNo);
       //   setValue("addressLine1", addressRes.addressLine1);
        //  setValue("addressLine2", addressRes.addressLine2);
        //  setValue("city", addressRes.city);
        //  setValue("state", addressRes.state);
       //   setValue("zipCode", addressRes.zipCode);
        } 
    }  
    
    //  if(session?.user?.id !== undefined){
    //   const idUser: string = session?.user?.id;
    //   getUserDataById(idUser)
    // }  
    },[])//session


    const {
    register,
    formState: { errors },//, isSubmitting
    handleSubmit,
   // reset,
    setValue,
   // getValues,
   // setError,
  } = useForm<TaddressSchemaCheckout>({
    resolver: zodResolver(addressSchimaCheckout),
  });

  //setValue("userId", session?.user?.id);

  async function onSubmit(data: TaddressSchemaCheckout) {
  console.log("onsubmit -------------",data)
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("userId", data.userId!);
    formData.append("email", data.email);
    formData.append("mobNo", data.mobNo);
    formData.append("password", data.password!);
    formData.append("addressLine1", data.addressLine1!);
    formData.append("addressLine2", data.addressLine2!);
    formData.append("city", data.city!);
    formData.append("state", data.state!);
    formData.append("zipCode", data.zipCode!);

    await newCustomerAddress(formData);
  
  }
 
  return (
    <div className="w-full md:w-[400px]">
      <div className="flex flex-col">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-5 text-slate-600 font-semibold py-3">
          Add Shipping address
          </h2>
          <p className="text-sm">
            
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("userId")} hidden />
            <div className="flex w-full flex-col gap-2  my-15 ">
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Email<span className="text-red-500">*</span>{" "}
              </label>
              <input
                {...register("email")}
                className="input-style"
              />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.email?.message && <span>{errors.email?.message}</span>}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                Mob no.<span className="text-red-500">*</span>{" "}
              </label>
              <input {...register("mobNo")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.mobNo?.message && <span>{errors.mobNo?.message}</span>}
              </span>
            </div>

            {/* <div className="flex flex-col gap-1">
              <label className="label-style">
                Password.<span className="text-red-500">Optional</span>{" "}
              </label>
              <input {...register("password")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.password?.message && <span>{errors.password?.message}</span>}
              </span>
            </div> */}

            <div className="w-full flex flex-row gap-2">
              <div className="flex flex-col gap-1">
                <label className="label-style">
                  First name<span className="text-red-500">*</span>{" "}
                </label>
                <input {...register("firstName")} className="input-style" />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.firstName?.message && (
                    <span>{errors.firstName?.message}</span>
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-style">
                  Last name<span className="text-red-500">*</span>{" "}
                </label>
                <input {...register("lastName")} className="input-style" />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.lastName?.message && (
                    <span>{errors.lastName?.message}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="label-style">
                Address line 1<span className="text-red-500">*</span>{" "}
              </label>
              <input {...register("addressLine1")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.addressLine1?.message && (
                  <span>{errors.addressLine1?.message}</span>
                )}
              </span>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="label-style">
                Address line 2<span className="text-red-500">*</span>{" "}
              </label>
              <input {...register("addressLine2")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.addressLine2?.message && (
                  <span>{errors.addressLine2?.message}</span>
                )}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                City<span className="text-red-500">*</span>{" "}
              </label>
              <input {...register("city")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.city?.message && <span>{errors.city?.message}</span>}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                State<span className="text-red-500">*</span>{" "}
              </label>
              <input {...register("state")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.state?.message && <span>{errors.state?.message}</span>}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                Zip<span className="text-red-500">*</span>{" "}
              </label>
              <input {...register("zipCode")} className="input-style" />
              <span className="text-[0.8rem] font-medium text-destructive">
                {errors.zipCode?.message && (
                  <span>{errors.zipCode?.message}</span>
                )}
              </span>
            </div>

            <Button className="bg-slate-100 " type="submit">
              Edit Address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddForm;

