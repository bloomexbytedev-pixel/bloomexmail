import { z } from "zod";

export const createNotificationSchema = z.object({
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "PUSH"]),
  recipient: z.string().trim().min(1),
  subject: z.string().optional(),

  message: z.string().optional(),

  template: z.string().optional(),

  variables: z.any().optional(),
});

export const createOtpEmailSchema = z.object({
  recipient: z.string().trim().email(),
  name: z.string().optional(),
  otp: z.string().min(1),
  subject: z.string().optional(),
});

export const createInquiryEmailSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    recipient: z.string().email().optional(),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1),
  })
  .refine((data) => data.email || data.recipient, {
    message: "Either email or recipient is required",
    path: ["email"],
  });
