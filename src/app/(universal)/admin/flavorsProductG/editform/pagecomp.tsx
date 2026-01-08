"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
//import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
//import { fetchbrands } from "@/app/(universal)/action/brads/dbOperations";
import {  flavorsProductGSchema, flavorsProductGSchemaType, flavorsProductGType } from "@/lib/types/flavorsProductGType";
import {  useRouter, useSearchParams } from "next/navigation";
import { editProduct, fetchProductById } from "@/app/(universal)/action/flavorsProductG/dbOperation";


// type Terror = {
//   name: string | null;
//   price: string | null;
//   isFeatured: string | null;
//   company: string | null;
//   productCat: string | null;
//   productDesc: string | null;
//   image: string | null;
// };
const PageComp = () => {
  const searchParams = useSearchParams();
 const id = searchParams.get("id") || "";
  // const id = params.id as string;

  //const [categories, setCategory] = useState<categoryTypeArr>([]);
  //const [product, setProduct] = useState({});
  const router = useRouter();
  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    // setError,
  } = useForm<flavorsProductGSchemaType>({
    resolver: zodResolver(flavorsProductGSchema),
  });
  useEffect(() => {
    let productData;
    async function prefetch() {
      productData = await fetchProductById(id);
           
      const priceS = productData.price.toString().replace(/\./g, ',');
      setValue("id", id);
      setValue("name", productData.name);
      setValue("productDesc", productData.productDesc);
     // setValue("categoryId", "yishiwe");
    // setValue("oldImageUrl", productData.image);
      setValue("price", priceS);
     // setValue("productCat", productData.productCat);
     // setValue("isFeatured", productData.isFeatured);

    }

    prefetch();
  }, []);

  async function onsubmit(data: flavorsProductGSchemaType) {
       
    const formData = new FormData();
    //console.log("---------formdata", data)

     formData.append("name", data.name);
     formData.append("price", data.price);
     formData.append("productCat", data.productCat);
     formData.append("productDesc", data.productDesc);
    // formData.append("image", data.image[0]);
    //  formData.append("oldImageUrl",data.oldImageUrl!)
    // // formData.append("isFeatured",data.isFeatured)
     formData.append("id", data.id!);

     const result = await editProduct(formData);

    if (!result?.errors) {
      router.push("/admin/flavorsProductG");
    } else {
      alert("Some thing went wrong");
    }

    // if (result.errors) {
    //   // not network error but data validation error
    //   const errors:Terror = result.errors;

    //   if (errors.name) {
    //     setError("name", {
    //       type: "server",
    //       message: errors.name,
    //     });
    //   } else if (errors.price) {
    //     setError("price", {
    //       type: "server",
    //       message: errors.price,
    //     });
    //   } else if (errors.productCat) {
    //     setError("productCat", {
    //       type: "server",
    //       message: errors.productCat,
    //     });
    //   }
    //   if (errors.productDesc) {
    //     setError("productDesc", {
    //       type: "server",
    //       message: errors.productDesc,
    //     });
    //   }
    //   if (errors.image) {
    //     setError("image", {
    //       type: "server",
    //       message: errors.image,
    //     });
    //   }

    //    else {
    //   //  alert("Something went wrong");
    //   }
    // }

    // console.log(result);
  }
  //   function setSelectedIndex(s, i){
  // s.options[i-1].selected = true;
  // return;
  // }
  //setSelectedIndex(document.getElementById("ddl_example3"),5);

  return (
    <> 
      <form onSubmit={handleSubmit(onsubmit)}>
        <div className="flexflex flex-col gap-4 p-5">
          <h1>Edit Form</h1>

          <div className="flex flex-col lg:flex-row gap-5 ">
            {/* left box */}
            <div className="flex-1 flex flex-col gap-y-5">
              <div className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
                <h1 className="font-semibold">Product</h1>
                <div className="flex w-full flex-col gap-2  my-15 ">
                  <input {...register("id")} hidden />
                  {/* <input {...register("oldImageUrl")} /> */}
                  <div className="flex flex-col gap-1 w-full">
                    <label className="label-style" htmlFor="product-title">
                      Product Name<span className="text-red-500">*</span>{" "}
                    </label>
                    <input {...register("name")} className="input-style" />
                    <span className="text-[0.8rem] font-medium text-destructive">
                      {errors.name?.message && (
                        <span>{errors.name?.message}</span>
                      )}
                    </span>
                  </div>
                  <input {...register("productCat",  { value: "all" }) } hidden />
                  {/* <div className="flex flex-col gap-1 w-full">
                    <label className="label-style" htmlFor="product-title">
                      Category<span className="text-red-500">*</span>{" "}
                    </label>
                    <select {...register("productCat")} className="input-style">
                      <option key="wer" value="Mobile">
                        Select Product Category
                      </option>
                      {categories.map(
                        (category: { name: string }, i: number) => {
                          return (
                            <option key={i} value={category.name}>
                              {category.name}
                            </option>
                          );
                        }
                      )}
                    </select>
                    <span className="text-[0.8rem] font-medium text-destructive">
                      {errors.productCat?.message && (
                        <p>{errors.productCat?.message}</p>
                      )}
                    </span>
                  </div> */}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
                <h1 className="font-semibold">Price Details</h1>
                <div className="flex w-full flex-col gap-2  my-15 ">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="label-style" htmlFor="product-title">
                      Price<span className="text-red-500">*</span>{" "}
                    </label>
                    <input
                      {...register("price")}
                      className="input-style"
                      placeholder="Enter Title"
                    />
                    <span className="text-[0.8rem] font-medium text-destructive">
                      {errors.price?.message && (
                        <span>{errors.price?.message}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* End of left box */}

            <div className="flex-1 flex flex-col gap-5 h-full">
              {/* <div className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
                <h1 className="font-semibold">Pictures</h1>
                <div className="flex flex-col gap-1">
                  <label className="label-style">Product Image</label>
                  <input
                    {...register("image", { required: true })}
                    type="file"
                    className="input-image-style"
                  />

                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.image && <span>Select product image</span>}
                  </p>
                </div>
              </div> */}

              <div className="flex-1 flex flex-col gap-3 bg-white rounded-xl p-4 border">
                <h1 className="font-semibold">General Detail</h1>

                <div className="flex flex-col gap-1">
                  <label className="label-style">Product description</label>

                  <textarea
                    {...register("productDesc", {
                      // validate: {
                      //   pattern: (value: string) => !/[!]/.test(value),
                      // },
                    })}
                    className="textarea-style"
                  />
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.productDesc && (
                      <span>Product description is required</span>
                    )}
                  </p>
                </div>

                {/* <div className="flex  items-center gap-4 ">
                  <label className="label-style">Normal Product</label>
                  <input {...register("isFeatured")} type="radio" value="false" />
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.isFeatured?.message && (
                      <p>{errors.isFeatured?.message}</p>
                    )}
                  </p>
                </div> */}

                {/* <div className="flex    items-center gap-4">
                  <label className="label-style">Featured Product</label>
                  <input {...register("isFeatured")} type="checkbox" />
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {errors.isFeatured?.message && (
                      <p>{errors.isFeatured?.message}</p>
                    )}
                  </p>
                </div> */}

                <Button className="bg-red-500" type="submit">Edit </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default PageComp;
