import sequelize from '../db/db.config.js'
import { Model, DataTypes } from 'sequelize'
class Token extends Model {}

Token.init(
  {
    tokenId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    refreshToken: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, modelName: 'refreshToken' }
)

export default Token
