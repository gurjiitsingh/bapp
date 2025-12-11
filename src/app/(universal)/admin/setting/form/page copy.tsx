"use client";

import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingSchema, settingSchemaType } from "@/lib/types/settingType";
import {
  addNewsetting,
  fetchSettings,
} from "@/app/(universal)/action/setting/dbOperations";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [name, setname] = useState<settingSchemaType[]>([]);
  const [settingId, setSettingId] = useState<string>("");
  useEffect(() => {
    async function prefetch() {
      const settingsData = await fetchSettings();
      // console.log("cat id --------", categoriesData)
      //   const brandData = await fetchbrands();
      setname(settingsData);
      // setBrand(brandData);
    }
    prefetch();
  }, []);

  const {
    register,
    formState: { errors },
    setValue,
    // control,
    // watch,
    handleSubmit,
    // setError,
    formState: {}, //dirtyFields
  } = useForm<settingSchemaType>({
    resolver: zodResolver(settingSchema),
  });

  //const images = watch("images");

  async function onsubmit(data: settingSchemaType) {
    //typeof(data.featured)
    console.log("formdata in client----- ", data);
    const formData = new FormData();
    formData.append("name", data.name!.toLowerCase());
    formData.append("value", data.value!);

    const result = await addNewsetting(formData);

    if (!result?.errors) {
      // router.push('/admin/products')
    } else {
      alert("Some thing went wrong");
    }

    console.log("response  ", result);
  }
  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedSettingId = e.target.value;
  //   setSettingId(selectedSettingId);
  //   setValue("id", selectedSettingId); // Update the form field with the selected setting ID
  // };
  return (
    <>
      <form onSubmit={handleSubmit(onsubmit)}>
        <div className="flexflex flex-col gap-4 p-5">
          <h1>Create Setting values</h1>

          <div className="flex flex-col lg:flex-row gap-5 ">
            {/* left box */}
            <div className="flex-1 flex flex-col gap-y-5">
              <div className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
                <h1 className="font-semibold">Setting</h1>
                <div className="flex w-full flex-col gap-2   ">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="label-style" htmlFor="product-title">
                      Name<span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                      {...register("name")}
                      className="input-style"
                      placeholder="Enter Title"
                    />

                    <span className="text-[0.8rem] font-medium text-destructive">
                      {errors.name?.message && (
                        <p>{errors.name?.message}</p>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <label className="label-style" htmlFor="product-title">
                      Value<span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                      {...register("value")}
                      className="input-style"
                      placeholder="Enter Title"
                    />
                    <span className="text-[0.8rem] font-medium text-destructive">
                      {errors.value?.message && (
                        <span>{errors.value?.message}</span>
                      )}
                    </span>
                  </div>
                  <button className="form-btn-style" type="submit">
                    Save{" "}
                  </button>
                </div>
              </div>
            </div>
            {/* End of left box */}
          </div>
        </div>
      </form>
    </>
  );
};

export default Page;
