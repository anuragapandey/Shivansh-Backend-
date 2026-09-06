import { Router } from 'express'
import { createAdminRow, listAdminRows, updateAdminRow } from '../controllers/admin.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(requireAuth, requireAdmin)
router.get('/:table', listAdminRows)
router.post('/:table', createAdminRow)
router.patch('/:table/:id', updateAdminRow)

export default router
