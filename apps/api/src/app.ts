import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { apiRouter } from './routes.js'
import { errorHandler, notFound } from './middleware/error.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { corsOrigins, isProd } from './env.js'

export const app = express()

app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: corsOrigins, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
if (!isProd) app.use(morgan('dev'))

app.use('/api/v1', apiLimiter, apiRouter)

app.use(notFound)
app.use(errorHandler)
