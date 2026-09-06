import { Router } from 'express'
import { createInquiry, subscribeNewsletter, validateCoupon } from '../controllers/misc.controller.js'
import { validate } from '../utils/validate.js'
import { couponSchema, inquirySchema, newsletterSchema } from '../validators/misc.validators.js'

const router = Router()

router.post('/inquiries', validate(inquirySchema), createInquiry)
router.post('/newsletter/subscribe', validate(newsletterSchema), subscribeNewsletter)
router.post('/coupons/validate', validate(couponSchema), validateCoupon)

export default router
