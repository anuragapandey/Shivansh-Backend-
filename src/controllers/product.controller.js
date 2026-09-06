import { fallbackProducts } from '../data/products.js'
import { supabaseAdmin } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listProducts = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return res.json({ products: fallbackProducts, source: 'fallback' })
  }

  res.json({ products: data?.length ? data : fallbackProducts, source: data?.length ? 'supabase' : 'fallback' })
})

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  if (!data) {
    const notFound = new Error('Product not found')
    notFound.statusCode = 404
    throw notFound
  }

  res.json({ product: data })
})

export const listCategories = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  res.json({ categories: data || [] })
})

export const listProductsByCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params
  const { data: category, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle()

  if (categoryError) throw categoryError
  if (!category) {
    const notFound = new Error('Category not found')
    notFound.statusCode = 404
    throw notFound
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  res.json({ category, products: data || [] })
})
