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

role: z
.enum(["user", "admin"]),

status: z
.enum(["active", "inactive"]),
});

export type TCreatePosUserSchema = z.infer<
typeof createPosUserSchema

> ;
