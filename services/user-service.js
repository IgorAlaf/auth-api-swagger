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
        `Candidate is already exists with the same email ${email}`
      )
    }
    const hashPassword = await bcrypt.hash(password, 3)
    const user = await User.create({
      email,
      password: hashPassword,
      firstName,
      lastName,
      city
    })
    const userDto = new UserDto(user) // id, email
    const tokens = generateTokens({ ...userDto })
    await saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto
    }
  }
  async login(email, password) {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      throw ApiError.badRequest('User with the same email not founded')
    }
    const isPassEquals = await bcrypt.compare(password, user.password)
    if (!isPassEquals) {
      throw ApiError.badRequest('Wrong password')
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
  async edit(firstName, lastName, city, email, id) {
    await User.update(
      { firstName, lastName, city, email },
      { where: { userId: id } }
    )
    const newUser = await User.findOne({ where: { userId: id } })
    if (!newUser) {
      throw ApiError.notFounded('Not found user')
    }
    const userDto = new UserDto(newUser)
    return { user: userDto }
  }
}

export default new UserService()
