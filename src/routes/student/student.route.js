// /src/routes/student/student.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  getStudentMonths
} from '../../controllers/student/student.controller.js'

// Import Validations
// import {
// } from '../../validations/student/auth.validation.js';

/**
 * @desc Get Student Months Route
 * @route GET /api/student/months 
*/
router.get(
  '/api/student/months',
  authStudent,
  getStudentMonths
);

export default router;