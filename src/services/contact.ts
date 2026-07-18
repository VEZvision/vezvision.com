import { getApiClient } from "@/lib/api";

export interface ContactSubmissionPayload {
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  language: "pl" | "en";
  turnstile_token?: string;
}

export type ContactFormField =
  | "fullName"
  | "email"
  | "phone"
  | "subject"
  | "message"
  | "form";

interface ContactSubmissionResult {
  success?: boolean;
  error?: string;
  field?: string;
}

export class ContactFormError extends Error {
  readonly field?: ContactFormField | undefined;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ContactFormError";
    this.field = mapContactField(field);
  }
}

function mapContactField(field?: string): ContactFormField | undefined {
  switch (field) {
    case "full_name":
      return "fullName";
    case "email":
      return "email";
    case "phone":
      return "phone";
    case "subject":
      return "subject";
    case "message":
      return "message";
    case "form":
      return "form";
    default:
      return undefined;
  }
}

export async function submitContactForm(
  payload: ContactSubmissionPayload,
): Promise<void> {
  const response = await getApiClient().invoke("submit-contact", payload);

  if (response.error) {
    const err = response.error as { message?: string };
    throw new ContactFormError(err.message || "Contact form submission failed");
  }

  const result = response.data as ContactSubmissionResult | null;
  if (result && result.success === false) {
    throw new ContactFormError(
      result.error || "Contact form submission failed",
      result.field,
    );
  }
}
