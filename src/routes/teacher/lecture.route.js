// /src/routes/teacher/lecture.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createLecture, getAllLectures
} from '../../controllers/teacher/lecture.controller.js'

// Import Validations
import {
  monthIdValidation, createLectureValidation,getLecturesQueryValidation, lectureIdValidation
} from '../../validations/teacher/lecture.validation.js';

/**
 * @desc Create Lecture
 * @route POST /api/teacher/:monthId/lecture 
*/
router.post(
  '/api/teacher/:monthId/lecture',
  authTeacher,
  contextMiddleware,
  monthIdValidation,
  createLectureValidation,
  createLecture
);

/**
 * @desc Get All Lectures 
 * @route GET /api/teacher/:monthId/lectures
*/
router.get(
  '/api/teacher/:monthId/lectures',
  authTeacher,
  contextMiddleware,
  monthIdValidation,
  getLecturesQueryValidation,
  getAllLectures
);

export default router;