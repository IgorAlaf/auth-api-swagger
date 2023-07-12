import bcrypt from 'bcrypt'
import { UserDto } from '../dtos/user-dto.js'
import tokenService from './token-service.js'
import { ApiError } from '../exceptions/api-error.js'
import User from '../models/User.js'
const { generateTokens, saveToken, validateRefreshToken } = tokenService
class UserService {
  async registration(email, password, firstName, lastName, city) {
    const candidate = await User.findOne({ where: { email: email } })
    if (candidate) {
      throw ApiError.badRequest(
        `Candidate is already exists with the same email ${email}`,
        [
          {
            type: 'field',
            location: 'email',
            msg: 'Candidate is already exists with the same email ${email}',
            path: `${process.env.API_URL}/api/registration`,
          },
        ]
      )
    }
    const hashPassword = await bcrypt.hash(password, 3)
    const user = await User.create({
      email,
      password: hashPassword,
      firstName,
      lastName,
      city,
    })
    const userDto = new UserDto(user) // id, email
    const tokens = generateTokens({ ...userDto })
    await saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto,
    }
  }
  async login(email, password) {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      throw ApiError.badRequest('User with the same email not founded', [
        {
          type: 'field',
          location: 'email',
          msg: 'User with the same email not founded',
          path: `${process.env.API_URL}/api/login`,
        },
      ])
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) {
      throw ApiError.badRequest('Wrong password', [
        {
          type: 'field',
          location: 'password',
          msg: 'Wrong password',
          path: `${process.env.API_URL}/api/login`,
        },
      ])
    }
    const userDto = new UserDto(user)
    const tokens = generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken)
    return token
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError()
    }
    const userData = validateRefreshToken(refreshToken)
    const tokenFromDb = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb) {
      throw ApiError.unauthorizedError()
    }
    const user = await User.findOne({ where: { userId: userData.id } })
    const userDto = new UserDto(user)
    const tokens = generateTokens({ ...userDto })
    await saveToken(userDto.id, tokens.refreshToken)
    return { ...tokens, user: userDto }
  }
  async edit(firstName, lastName, city, email, id, password, newPass) {
    const newUser = await User.findOne({ where: { userId: id } })
    if (!newUser) {
      throw ApiError.notFounded('Not found user', [
        {
          type: 'field',
          location: 'userId',
          msg: 'Not found this user',
          path: `${process.env.API_URL}/api/account/${id}/edit`,
        },
      ])
    }
    if (email != newUser.dataValues.email) {
      const checkUser2 = await User.findOne({
        where: { email },
      })
      if (checkUser2) {
        throw ApiError.badRequest(
          `Candidate with email ${email} already exists`,
          [
            {
              type: 'field',
              location: 'email',
              msg: `Candidate with email ${email} already exists`,
              path: `${process.env.API_URL}/api/account/${id}/edit`,
            },
          ]
        )
      }
    }
    if (password === '' && newPass === '') {
      await User.update(
        { firstName, lastName, city, email },
        { where: { userId: id } }
      )
      const finishUser = await User.findOne({ where: { userId: id } })
      const userDto = new UserDto(finishUser)
      return { user: userDto }
    }
    const isPassEquals = await bcrypt.compare(
      password,
      newUser.dataValues.password
    )
    if (!isPassEquals) {
      throw ApiError.badRequest('Password is wrong', [
        {
          type: 'field',
          location: 'password',
          msg: 'Password is wrong',
          path: `${process.env.API_URL}/api/account/${id}/edit`,
        },
      ])
    }
    const newPassHash = await bcrypt.hash(newPass, 3)
    await User.update(
      { firstName, lastName, city, email, password: newPassHash },
      { where: { userId: id } }
    )
    const finishUser = await User.findOne({ where: { userId: id } })
    const userDto = new UserDto(finishUser)
    return { user: userDto }
  }
}

export default new UserService()
