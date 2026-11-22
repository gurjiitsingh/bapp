import { z } from "zod";

export const createPosUserSchema = z.object({
fullName: z
.string()
.min(2, "Full name is required"),

username: z
.string()
.min(3, "Username must be at least 3 characters"),

mobile: z
.string()
.min(10, "Mobile number is required"),

pin: z
.string()
.min(4, "PIN must be at least 4 digits")
.max(6, "PIN cannot be more than 6 digits")
.regex(/^\d+$/, "PIN must contain only numbers"),

role: z.enum([
  "accountant",
  "admin",
  "captain",
  "cashier",
  "chef",
  "confectioner",
  "customer",
  "delivery",
  "dispatch_operator",
  "driver",
  "employee",
  "head_chef",
  "host",
  "manager",
  "production_manager",
  "production_supervisor",
  "purchase_manager",
  "quality_control",
  "restaurant_manager",
  "sales_executive",
  "sales_manager",
  "shopkeeper",
  "steward",
  "storekeeper",
  "supplier",
  "user",
  "waiter",
  "warehouse_assistant",
]),

status: z
.enum(["active", "inactive"]),
});

export type TCreatePosUserSchema = z.infer<
typeof createPosUserSchema

> ;
