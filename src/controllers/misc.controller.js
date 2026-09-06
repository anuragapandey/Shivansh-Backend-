import { supabaseAdmin } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createInquiry = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert(req.body)
    .select()
    .single()

  if (error) throw error
  res.status(201).json({ inquiry: data, message: 'Inquiry submitted' })
})

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .upsert({ email: req.body.email }, { onConflict: 'email' })
    .select()
    .single()

  if (error) throw error
  res.status(201).json({ subscriber: data, message: 'Subscribed' })
})

export const validateCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code.toUpperCase()
  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!coupon) return res.status(404).json({ valid: false, message: 'Coupon not found' })
  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    return res.status(400).json({ valid: false, message: 'Coupon expired' })
  }
  if (Number(coupon.min_order_value || 0) > req.body.subtotal) {
    return res.status(400).json({ valid: false, message: `Minimum order value is Rs. ${coupon.min_order_value}` })
  }

  const discount =
    coupon.discount_type === 'percent'
      ? Math.round((req.body.subtotal * Number(coupon.discount_value)) / 100)
      : Number(coupon.discount_value)

  res.json({ valid: true, coupon, discount: Math.min(discount, req.body.subtotal) })
})
