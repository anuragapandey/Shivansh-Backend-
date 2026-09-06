import { supabase, supabaseAdmin } from '../config/supabase.js'

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      const error = new Error('Login token missing')
      error.statusCode = 401
      throw error
    }

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      const authError = new Error('Invalid or expired login token')
      authError.statusCode = 401
      throw authError
    }

    req.user = data.user
    req.accessToken = token
    next()
  } catch (error) {
    next(error)
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) return next()

    const { data } = await supabase.auth.getUser(token)
    req.user = data.user || null
    req.accessToken = token
    return next()
  } catch {
    return next()
  }
}

export async function requireAdmin(req, _res, next) {
  try {
    const metadataRole = req.user?.user_metadata?.role
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle()

    if (error) throw error

    if (metadataRole !== 'admin' && profile?.role !== 'admin') {
      const forbidden = new Error('Admin access required')
      forbidden.statusCode = 403
      throw forbidden
    }

    next()
  } catch (error) {
    next(error)
  }
}
