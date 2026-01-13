import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  teacherLogin
} from '../../controllers/teacher/auth.controller.js'

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

export default router;