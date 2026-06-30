import { z } from "zod";

export const createUserSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    username: z.string().min(3, "Username is required"),
    email: z.string().email("Invalid email"),
    mobile: z.string().min(10, "Invalid mobile number"),

    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),

    role: z.enum([
      "admin",
      "manager",
      "shopkeeper",
      "cashier",
      "sales",
      "storekeeper",
      "driver",
      "delivery",
      "accountant",
      "customer",
      "supplier",
      "user",
    ]),

    status: z.enum(["active", "inactive"]),

    employeeId: z.string().optional(),

    department: z.enum([
      "management",
      "sales",
      "inventory",
      "accounts",
      "production",
      "delivery",
    ]).optional(),

    address: z.string().optional(),

    notes: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type TCreateUserSchema = z.infer<typeof createUserSchema>;