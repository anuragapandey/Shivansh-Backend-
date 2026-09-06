import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import miscRoutes from './routes/misc.routes.js'
import orderRoutes from './routes/order.routes.js'
import productRoutes from './routes/product.routes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'a1-chips-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/checkout', orderRoutes)
app.use('/api', miscRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
