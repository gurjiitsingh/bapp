import { z } from "zod";



export type deliveryType = {
  id: string | undefined;
  name: string;
  price: string;
  minSpend: number;
  deliveryDesc: string;
  productCat: string;
  //image: string;
  deliveryDistance: string;
 // purchaseSession: string | null;
 // quantity: number | null;
 // status: string | null;
};



const deliverySchema = z.object({
  // id: z.number().optional(),
  name: z
    .string()
    .trim()
    .min(2, { message: "delivery name is very short" })
    .max(30, { message: "delivery name is very long" }),
  price: z
    .string()
    .refine((value) => /^\d+$/.test(value), "Invalid delivery price"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),

  deliveryDesc: z.string().min(1, { message: "Please select category" }),
  company: z.string().optional(),
  featured: z.string().optional(),
  image: typeof window === "undefined" ? z.any() : z.any(),
  minSpend: z.string().optional(),
  // image:z.object({
  //   size: z.number(),
  // type: z.string(),
  // name: z.string(),
  // lastModified: z.number(),
  //  }),
});
export type TdeliverySchema = z.infer<typeof deliverySchema>;

export type TdeliverySchemaArr = TdeliverySchema[];

export const newPorductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "delivery name is required" }),
  price: z
    .string(),
   // .refine((value) => /^\d+$/.test(value), "Invalid delivery price"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  deliveryDesc: z
    .string().optional(),
   // .min(2, { message: "delivery description is required" }),
  minSpend: z.string().optional(),
  //  offerType: z.string().min(1, { message: "Please select category" }),
  //  dimensions:z.string().optional(),
  //weight:z.string().optional(),
  deliveryDistance: z.string().optional(),

  //image: z.any().refine((file: File) => file?.length !== 0, "File is required"),
  image: z.any().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type TnewdeliverySchema = z.infer<typeof newPorductSchema>;

export type TnewdeliverySchemaArr = TnewdeliverySchema[];


export const editPorductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(4, { message: "delivery name is required" }),
  price: z
    .string()
    .refine((value) => /^\d+$/.test(value), "Invalid delivery price"), // Refinement
  productCat: z.string().min(1, { message: "Please select category" }),
  deliveryDesc: z
    .string()
    .min(2, { message: "delivery description is required" }),
  // offerType: z.string().optional(),
  // dimensions:z.string().optional(),
  // weight:z.string().optional(),
  deliveryDistance: z.string().optional(),
  minSpend: z.string().optional(),
  image: z.any().optional(),
  oldImageUrl: z.string().optional(),
  // .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
  // .refine(
  //   (file) => checkFileType(file),
  //   "Only .jpg, .jpeg formats are supported."
  // ),
});

export type TeditdeliverySchema = z.infer<typeof editPorductSchema>;

export default deliverySchema;

export type Tdelivery = {
  name: string;
  id: string;
  image: string;
  category: string;
};
