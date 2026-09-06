import { supabaseAdmin } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const allowedTables = new Set(['products', 'categories', 'orders', 'banners', 'coupons'])

const assertTable = (table) => {
  if (!allowedTables.has(table)) {
    const error = new Error('Admin table not allowed')
    error.statusCode = 400
    throw error
  }
}

export const listAdminRows = asyncHandler(async (req, res) => {
  const { table } = req.params
  assertTable(table)

  const { data, error } = await supabaseAdmin.from(table).select('*').limit(100)
  if (error) throw error
  res.json({ rows: data || [] })
})

export const createAdminRow = asyncHandler(async (req, res) => {
  const { table } = req.params
  assertTable(table)

  const { data, error } = await supabaseAdmin.from(table).insert(req.body).select().single()
  if (error) throw error
  res.status(201).json({ row: data })
})

export const updateAdminRow = asyncHandler(async (req, res) => {
  const { table, id } = req.params
  assertTable(table)

  const { data, error } = await supabaseAdmin.from(table).update(req.body).eq('id', id).select().single()
  if (error) throw error
  res.json({ row: data })
})
