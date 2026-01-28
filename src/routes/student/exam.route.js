// /src/routes/student/exam.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  getExam
} from '../../controllers/student/exam.controller.js'

// Import Validations
import {
  examIdValidation
} from '../../validations/student/exam.validation.js';

/**
 * @desc Get Student Exam Route
 * @route GET /api/student/exam/:examId
*/
router.get(
  '/api/student/exam/:examId',
  authStudent,
  examIdValidation,
  getExam
);

export default router;