import { z } from 'zod'

const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  weight: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  image: z.string().optional().or(z.literal('')),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  subtotal: z.coerce.number().positive(),
  currency: z.string().default('INR'),
  customer: z
    .object({
      name: z.string().trim().min(2).max(80).optional().or(z.literal('')),
      email: z.string().trim().email(),
      phone: z.string().trim().min(7).max(20),
      address: z.string().trim().min(5).max(300).optional().or(z.literal('')),
      location: z.string().trim().min(5).max(300),
    })
    .required(),
  source: z.string().default('web'),
})
