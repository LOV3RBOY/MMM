import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  isAdmin: z.boolean().default(false),
});

export const modelFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Please enter a valid image URL"),
  height: z.string().min(1, "Height is required"),
  measurements: z.string().min(1, "Measurements are required"),
  age: z.number().min(18, "Age must be at least 18"),
  status: z.enum(["Available", "Booked", "On Hold"]),
  location: z.string().min(1, "Location is required"),
  specialties: z.array(z.string()),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ModelFormData = z.infer<typeof modelFormSchema>;
