import { z } from "zod";

export type ProductType = {
  id: string ;
  name: string;
  price: number;
  stockQty: number;
  discountPrice: number | undefined;
  categoryId: string;
  productCat: string | undefined;
  baseProductId: string;
  productDesc: string;
  sortOrder: number;
  image: string;
  isFeatured: boolean;
  purchaseSession: string | null;
  quantity: number | null;
  flavors: boolean;
  publishStatus: 'published' | 'draft';
  stockStatus: 'in_stock' | 'out_of_stock';

  // NEW FIELDS
  taxRate: number | undefined;
  taxType: 'inclusive' | 'exclusive' | undefined;

  parentId?: string;
  hasVariants?: boolean;
  type?: 'parent' | 'variant';
};





export const newProductSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().optional(),
  hasVariants: z.boolean().optional(),
  type: z.enum(["parent", "variant"]).optional(),

  // --------------------------
  // MANDATORY
  // --------------------------

  name: z.string().min(1, { message: "Product name is required" }),

  price: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num =
        typeof val === "string" ? parseFloat(val.replace(",", ".")) : val;
      return !isNaN(num) && num >= 0;
    }, { message: "Invalid product price" }),

  sortOrder: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const num = typeof val === "string" ? parseInt(val) : val;
      return !isNaN(num);
    }, { message: "Invalid sort order" }),

  categoryId: z.string().min(1, { message: "Please select category" }),

  // --------------------------
  // ✅ NEW STATUS FIELDS (CLEAN)
  // --------------------------

  publishStatus: z
  .enum(["published", "draft"])
  .default("published"),

  stockStatus: z
    .enum(["in_stock", "out_of_stock"])
    .optional()
    .nullable(), // ✅ allows null or undefined

  // --------------------------
  // OPTIONAL
  // --------------------------

  discountPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === ""
        ? undefined
        : Number(val.toString().replace(",", "."))
    )
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      { message: "Invalid discount price" }
    ),

  stockQty: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === "" ? undefined : Number(val)
    )
    .refine(
      (val) => val === undefined || !isNaN(val),
      { message: "Invalid stock quantity" }
    ),

  productDesc: z.string().optional(),
  isFeatured: z.boolean().optional(),
  image: z.any().optional(),
  baseProductId: z.string().optional(),
  flavors: z.boolean().optional(),

  // --------------------------
  // TAX
  // --------------------------

  taxRate: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === ""
        ? undefined
        : Number(val.toString().replace(",", "."))
    )
    .refine(
      (val) => val === undefined || (!isNaN(val) && val >= 0),
      { message: "Invalid tax rate" }
    ),

  taxType: z.enum(["inclusive", "exclusive"]).optional(),
});


export type TnewProductSchema = z.infer<typeof newProductSchema>;

export const editProductSchema = z.object({
  id: z.string().optional(),
  parentId: z.string().optional(),
  hasVariants: z.boolean().optional(),
  type: z.enum(["parent", "variant"]).optional(),

  // --------------------------
  // REQUIRED
  // --------------------------

  name: z.string().min(1, { message: "Product name is required" }),

  price: z
    .string()
    .refine(
      (value) => /^\d*[.,]?\d*$/.test(value),
      "Invalid product price"
    ),

  sortOrder: z.string().min(1, { message: "Invalid sort order" }),

  // --------------------------
  // OPTIONAL PRICING
  // --------------------------

  discountPrice: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid discount price"
    ),

  stockQty: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid stock quantity"
    ),

  // --------------------------
  // CATEGORY
  // --------------------------

  categoryId: z.string().optional(),
  categoryIdOld: z.string().optional(),

  // --------------------------
  // CONTENT
  // --------------------------

  productDesc: z.string().optional(),
  isFeatured: z.boolean().optional(),

  image: z.any().optional(),
  oldImageUrl: z.string().optional(),

  // --------------------------
  // ✅ NEW STATUS FIELDS (CLEAN)
  // --------------------------

publishStatus: z
  .enum(["published", "draft"])
  .default("published"),

  stockStatus: z
    .enum(["in_stock", "out_of_stock"])
    .optional()
    .nullable(), // ✅ can be null / undefined

  // --------------------------
  // TAX
  // --------------------------

  taxRate: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid tax rate"
    ),

  taxType: z
    .enum(["inclusive", "exclusive"])
    .optional(),
});

export type TeditProductSchema = z.infer<typeof editProductSchema>;






 
