import pkg from 'pg'
import { config } from 'dotenv'
import { Sequelize } from 'sequelize'
config()
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: 'sqlite',
    host: process.env.DB_HOST
  }
)

export default sequelize
