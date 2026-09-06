import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal('')),
})

export const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})
