import { z } from "zod";

export const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CONTACT_PHONE_PATTERN = /^\+?[0-9()\s-]{5,30}$/;

export const contactEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5)
  .max(254)
  .regex(CONTACT_EMAIL_PATTERN, "invalid email");

export const contactPhoneSchema = z
  .string()
  .trim()
  .regex(CONTACT_PHONE_PATTERN, "invalid phone");

export function contactTextSchema(maxLength: number, minLength = 1) {
  return z.string().trim().min(minLength).max(maxLength);
}

export const contactFormSchema = z.object({
  full_name: contactTextSchema(120, 2),
  email: contactEmailSchema,
  phone: z.union([z.literal(""), contactPhoneSchema]).optional(),
  subject: contactTextSchema(160, 2),
  message: contactTextSchema(5000, 10),
  language: z.enum(["pl", "en"]).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const frontendContactFormSchema = z.object({
  fullName: z.string().trim().min(2, "contact.form.error.fullName").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "contact.form.error.email.required")
    .max(254)
    .regex(CONTACT_EMAIL_PATTERN, "contact.form.error.email.invalid"),
  phone: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(CONTACT_PHONE_PATTERN, "contact.form.error.phone"),
    ])
    .optional(),
  subject: z.string().trim().min(2, "contact.form.error.subject").max(160),
  message: z
    .string()
    .trim()
    .min(10, "contact.form.error.messageTooShort")
    .max(5000),
  consent: z.boolean().refine((value) => value === true, {
    message: "contact.form.error.consent",
  }),
});

export type FrontendContactFormInput = z.infer<
  typeof frontendContactFormSchema
>;
