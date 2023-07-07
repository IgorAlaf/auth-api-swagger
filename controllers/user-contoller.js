import userService from '../services/user-service.js'
import { validationResult } from 'express-validator'
import { ApiError } from '../exceptions/api-error.js'
class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.badRequest('Error validation', errors.array()))
      }
      const { email, password, firstName, lastName, city } = req.body
      const userData = await userService.registration(
        email,
        password,
        firstName,
        lastName,
        city
      )
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      })
      return res.status(201).json(userData)
    } catch (e) {
      next(e)
    }
  }
  async login(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.badRequest('Error validation', errors.array()))
      }
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      })
      return res.status(201).json(userData)
    } catch (e) {
      next(e)
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json({ success: true })
    } catch (e) {
      next(e)
    }
  }
  async refresh(req, res, next) {
    try {
      console.log(req.cookies)
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }

  async editAccount(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiError.badRequest('Error validation', errors.array()))
      }
      const id = req.params.id
      const { firstName, lastName, city, email } = req.body
      const userData = await userService.edit(
        firstName,
        lastName,
        city,
        email,
        id
      )
      res.json(userData)
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController()
