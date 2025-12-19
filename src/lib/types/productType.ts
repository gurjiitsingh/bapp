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
  status: 'published' | 'draft' | 'out_of_stock' | undefined;

  // NEW FIELDS
  taxRate: number | undefined;
  taxType: 'inclusive' | 'exclusive' | undefined;

  parentId?: string;
  hasVariants?: boolean;
  type?: 'parent' | 'variant';
};

export type ProductBase = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  productCat?: string;
  baseProductId: string;
  productDesc: string;
  sortOrder: number;
  image: string;
  isFeatured: boolean;
  purchaseSession: string | null;
  stockQty: number;
  flavors: boolean;
  status: 'published' | 'draft' | 'out_of_stock';
  taxRate?: number;
  taxType?: 'inclusive' | 'exclusive';
};


export const newPorductSchema = z.object({
  id: z.string().optional(),
parentId: z.string().optional(),
 hasVariants: z.boolean().optional(),
  type: z.enum(["parent", "variant"]).optional(),
  // Mandatory
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

  status: z.enum(["published", "draft", "out_of_stock"]),

  // Optional
  discountPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === undefined || val === "" ? undefined : Number(val.toString().replace(",", "."))
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
  // NEW OPTIONAL FIELDS
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

  taxType: z
    .enum(["inclusive", "exclusive"])
    .optional(),
});

export type TnewProductSchema = z.infer<typeof newPorductSchema>;

export const editPorductSchema = z.object({
  id: z.string().optional(),
parentId: z.string().optional(),
 hasVariants: z.boolean().optional(),
  type: z.enum(["parent", "variant"]).optional(),

  name: z.string().min(1, { message: "Product name is required" }),

  price: z
    .string()
    .refine((value) => /^\d*[.,]?\d*$/.test(value), "Invalid product price"),

  discountPrice: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid discount price"
    ),

  stockQty: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid stock quantity"
    ),

  sortOrder: z.string().min(1, { message: "Please select category" }),

  categoryId: z.string().optional(),
  categoryIdOld: z.string().optional(),

  productDesc: z.string().optional(),

  isFeatured: z.boolean().optional(),

  image: z.any().optional(),
  oldImageUrl: z.string().optional(),

  status: z
    .enum(["published", "draft", "out_of_stock"])
    .optional()
    .nullable(),

  // --------------------------
  // NEW OPTIONAL FIELDS
  // --------------------------

  taxRate: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || /^\d*[.,]?\d*$/.test(value),
      "Invalid tax rate"
    ),

  taxType: z.enum(["inclusive", "exclusive",""]).optional(),
});

export type TeditProductSchema = z.infer<typeof editPorductSchema>;






 
