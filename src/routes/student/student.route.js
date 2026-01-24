// /src/routes/student/student.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  getStudentMonths, buyMonth
} from '../../controllers/student/student.controller.js'

// Import Validations
import {
  buyMonthValidation
} from '../../validations/student/student.validation.js';

/**
 * @desc Get Student Months Route
 * @route GET /api/student/months 
*/
router.get(
  '/api/student/months',
  authStudent,
  getStudentMonths
);

/**
 * @desc Student Buy Month Route
 * @route POST /api/student/buy-month/:monthId
*/
router.post(
  '/api/student/buy-month/:monthId',
  authStudent,
  contextMiddleware,
  buyMonthValidation,
  buyMonth,
);

export default router;