import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import router from './routes/index.js'
import sequelize from './db/db.config.js'
import YAML from 'yamljs'
import path from 'path'
import { errorMiddleware } from './middlewares/error-middleware.js'
import { fileURLToPath } from 'url'
import swaggerUi from 'swagger-ui-express'
config()
const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  })
)
app.get('/users', (req, res) => {
  res.send('hello')
})

app.use('/api', router)
app.use(errorMiddleware)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'docs.yaml'))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

async function start() {
  try {
    await sequelize.sync().then(() => console.log('db is ready'))
    app.listen(process.env.PORT || 5000, () =>
      console.log('Server is connection')
    )
  } catch (e) {
    console.log('Cannot connect to the server')
  }
}

start()
