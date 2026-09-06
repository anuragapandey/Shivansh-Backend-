import 'dotenv/config'
import { z } from 'zod'

const requiredSecret = (label) =>
  z
    .string({ error: `${label} missing in Backend/.env` })
    .trim()
    .min(1, `${label} missing in Backend/.env`)
    .refine((value) => !value.startsWith('your-'), `${label} still has placeholder value`)

const firstRealValue = (...values) =>
  values.find((value) => value && !value.startsWith('your-'))

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  CLIENT_URLS: z.string().trim().optional(),
  SUPABASE_URL: requiredSecret('SUPABASE_URL').url('SUPABASE_URL must be a valid Supabase project URL'),
  SUPABASE_ANON_KEY: z.string().trim().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().trim().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().trim().optional(),
  SUPABASE_SECRET_KEY: z.string().trim().optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().trim().optional(),
  SMTP_PASS: z.string().trim().optional(),
  SMTP_FROM: z.string().trim().optional(),
  SMTP_TLS_REJECT_UNAUTHORIZED: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value !== 'false'),
}).transform((value, context) => {
  const publicKey = firstRealValue(value.SUPABASE_ANON_KEY, value.SUPABASE_PUBLISHABLE_KEY)
  const serviceKey = firstRealValue(value.SUPABASE_SERVICE_ROLE_KEY, value.SUPABASE_SECRET_KEY)

  if (!publicKey || publicKey.startsWith('your-')) {
    context.addIssue({
      code: 'custom',
      path: ['SUPABASE_ANON_KEY'],
      message: 'Add SUPABASE_ANON_KEY or SUPABASE_PUBLISHABLE_KEY in Backend/.env',
    })
  }

  if (!serviceKey || serviceKey.startsWith('your-')) {
    context.addIssue({
      code: 'custom',
      path: ['SUPABASE_SERVICE_ROLE_KEY'],
      message: 'Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY in Backend/.env',
    })
  }

  return {
    ...value,
    SUPABASE_PUBLIC_KEY: publicKey,
    SUPABASE_SERVICE_KEY: serviceKey,
  }
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('\nBackend env setup needed.')
  console.error('Create/update Backend/.env with values from Supabase Project Settings > API.\n')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
