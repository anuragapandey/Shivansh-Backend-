import { z } from 'zod'

export const inquirySchema = z.object({
  type: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(20),
  message: z.string().trim().min(5).max(1000),
})

export const newsletterSchema = z.object({
  email: z.string().trim().email(),
})

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(40),
  subtotal: z.coerce.number().nonnegative(),
})
