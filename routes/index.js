import { Router } from 'express'
import userContoller from '../controllers/user-contoller.js'
import { body } from 'express-validator'
import { authMiddleware } from '../middlewares/auth-middleware.js'

const router = new Router()
const { registration, login, logout, refresh, editAccount } = userContoller

router.post(
  '/registration',
  body('email')
    .isEmail()
    .isLength({ min: 6, max: 50 })
    .matches(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
  body('firstName')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z]*$/),
  body('lastName')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z]*$/),
  body('city')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z]*$/),
  body('password').isLength({ min: 6, max: 50 }),
  registration
)
router.post(
  '/login',
  body('email')
    .isEmail()
    .isLength({ min: 6, max: 50 })
    .matches(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
  body('password').isLength({ min: 6, max: 50 }),
  login
)
router.get('/logout', logout)
router.post('/refresh', refresh)
router.put(
  '/account/:id/edit',
  body('email')
    .isEmail()
    .isLength({ min: 6, max: 50 })
    .matches(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/),
  body('firstName')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z]*$/),
  body('lastName')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z]*$/),
  body('city')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[A-Za-z]*$/),
  authMiddleware,
  editAccount
)

export default router
