import jwt from 'jsonwebtoken'
import pool from '../db/db.config.js'
import Token from '../models/Token.js'
class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m'
    })
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d'
    })
    return {
      accessToken,
      refreshToken
    }
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      return userData
    } catch (e) {
      return null
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
      return userData
    } catch (e) {
      return null
    }
  }

  async saveToken(userId, refreshToken) {
    const text = refreshToken
    const tokenData = await Token.findAll({ where: { userId } })
    if (tokenData[0]) {
      const refreshToken = await Token.update(
        { refreshToken: text },
        {
          where: {
            userId
          }
        }
      )
      return refreshToken
    }
    console.log(refreshToken, userId)
    const token = await Token.create({ refreshToken, userId })

    return token
  }
  async removeToken(refreshToken) {
    const tokenData = await Token.destroy({
      where: {
        refreshToken
      }
    })
    return tokenData
  }
  async findToken(refreshToken) {
    const tokenData = await Token.findOne({ where: { refreshToken } })
    return tokenData
  }
}

export default new TokenService()
