import { Router } from 'express'
import { createOrder, listMyOrders } from '../controllers/order.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../utils/validate.js'
import { createOrderSchema } from '../validators/order.validators.js'

const router = Router()

router.post('/', validate(createOrderSchema), createOrder)
router.get('/mine', requireAuth, listMyOrders)

export default router
