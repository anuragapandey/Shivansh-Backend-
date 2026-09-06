import { supabase, supabaseAdmin } from '../config/supabase.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone },
    },
  })

  if (error) {
    error.statusCode = 400
    throw error
  }

  if (data.user) {
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      name,
      email,
      phone: phone || null,
    })
  }

  res.status(201).json({
    user: data.user,
    session: data.session,
    message: data.session ? 'Signup successful' : 'Signup successful. Check email if confirmation is enabled.',
  })
})

export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    error.statusCode = 401
    throw error
  }

  res.json({ user: data.user, session: data.session })
})

export const getMe = asyncHandler(async (req, res) => {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle()

  res.json({ user: req.user, profile })
})

export const signOut = asyncHandler(async (req, res) => {
  await supabase.auth.admin?.signOut?.(req.accessToken)
  res.json({ message: 'Signed out locally. Clear token on client.' })
})
