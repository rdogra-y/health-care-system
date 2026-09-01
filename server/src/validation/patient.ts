import { z } from "zod";

export const patientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must have at least 2 characters")
    .max(50, "First name is too long")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Enter a valid first name"
    ),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must have at least 2 characters")
    .max(50, "Last name is too long")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Enter a valid last name"
    ),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .refine(
      (value) => {
        const digits = value.replace(/\D/g, "");

        return (
          digits.length >= 7 &&
          digits.length <= 15
        );
      },
      {
        message:
          "Enter a valid phone number"
      }
    ),

  dateOfBirth: z
    .string()
    .min(
      1,
      "Date of birth is required"
    )
    .refine(
      (value) => {
        const date = new Date(value);

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date <= new Date()
        );
      },
      {
        message:
          "Enter a valid date of birth"
      }
    ),

  gender: z
    .string()
    .trim()
    .optional(),

  address: z
    .string()
    .trim()
    .min(
      5,
      "Address is required and must contain at least 5 characters"
    )
    .max(
      200,
      "Address is too long"
    )
});