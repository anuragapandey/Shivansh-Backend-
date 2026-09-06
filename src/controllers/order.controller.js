import { supabaseAdmin } from '../config/supabase.js'
import { sendOrderEmails } from '../services/email.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createOrder = asyncHandler(async (req, res) => {
  const { items, subtotal, currency, customer, source } = req.body
  const userId = req.user?.id || null

  const computedSubtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  if (computedSubtotal !== subtotal) {
    const error = new Error('Subtotal mismatch')
    error.statusCode = 400
    throw error
  }

  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      subtotal,
      currency,
      customer,
      source,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    error.statusCode = 500
    throw error
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.qty,
    weight: item.weight,
    image_url: item.image || null,
  }))

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems)
  if (itemsError) {
    itemsError.statusCode = 500
    throw itemsError
  }

  sendOrderEmails(order, orderItems).catch((error) => {
    console.error('Order email failed:', error)
  })

  res.status(201).json({
    order: {
      ...order,
      items: orderItems,
    },
    message: 'Order saved. Connect Razorpay/Stripe here for payment capture.',
  })
})

export const listMyOrders = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    error.statusCode = 500
    throw error
  }

  res.json({ orders: data })
})
