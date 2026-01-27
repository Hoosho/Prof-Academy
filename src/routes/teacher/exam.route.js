//// /src/routes/teacher/lecture.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createExam, GetAllExams
} from '../../controllers/teacher/exam.controller.js'

// Import Validations
import {
  createExamValidation, getExamsValidation
} from '../../validations/teacher/exam.validation.js';

/**
 * @desc Create Exam
 * @route POST /api/teacher/exam 
*/
router.post(
  '/api/teacher/exam',
  authTeacher,
  contextMiddleware,
  createExamValidation,
  createExam
);

/**
 * @desc Get All Exams 
 * @route GET /api/teacher/exams
*/
router.get(
  '/api/teacher/exams',
  authTeacher,
  getExamsValidation,
  GetAllExams
);

export default router;