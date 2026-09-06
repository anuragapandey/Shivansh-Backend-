import { Router } from 'express'
import {
  getProductBySlug,
  listCategories,
  listProducts,
  listProductsByCategory,
} from '../controllers/product.controller.js'

const router = Router()

router.get('/', listProducts)
router.get('/categories', listCategories)
router.get('/categories/:slug/products', listProductsByCategory)
router.get('/:slug', getProductBySlug)

export default router
