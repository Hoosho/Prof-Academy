import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authTeacher } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  teacherLogin, authMe, teacherLogout
} from '../../controllers/teacher/auth.controller.js';

// Import Validations
import {
  teacherLoginValidation
} from '../../validations/teacher/auth.validation.js';
/**
 * @desc Admin Login Route
 * @route POST /api/teacher/login 
*/
router.post(
  '/api/teacher/login',
  contextMiddleware,
  teacherLoginValidation,
  teacherLogin
);

/**
 * @desc Teacher Auth Me Route
 * @route GET /api/auth/me/teacher
*/
router.get(
  '/api/auth/me/teacher',
  authTeacher,
  authMe
);

/**
 * @desc Teacher Logout Route
 * @route GET /api/teacher/logout
*/
router.post(
  '/api/teacher/logout',
  authTeacher,
  teacherLogout
);

export default router;