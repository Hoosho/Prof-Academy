// /src/routes/student/auth.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  studentLogin, authMe, studentLogout 
} from '../../controllers/student/auth.controller.js'

// Import Validations
import {
  studentLoginValidation
} from '../../validations/student/auth.validation.js';

/**
 * @desc Student Login Route
 * @route POST api/admin/login 
*/
router.post(
  '/api/student/login',
  contextMiddleware,
  studentLoginValidation,
  studentLogin
);

/**
 * @desc Student Auth Me Route
 * @route GET /api/auth/me/student
*/
router.get(
  '/api/auth/me/student',
  authStudent,
  authMe
);

/**
 * @desc Student Logout Route
 * @route GET /api/student/logout
*/
router.post(
  '/api/student/logout',
  authStudent,
  studentLogout
);

export default router;