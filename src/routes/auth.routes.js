import { Router } from 'express'
import { getMe, signIn, signOut, signUp } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../utils/validate.js'
import { signInSchema, signUpSchema } from '../validators/auth.validators.js'

const router = Router()

router.post('/signup', validate(signUpSchema), signUp)
router.post('/login', validate(signInSchema), signIn)
router.get('/me', requireAuth, getMe)
router.post('/logout', requireAuth, signOut)

export default router
