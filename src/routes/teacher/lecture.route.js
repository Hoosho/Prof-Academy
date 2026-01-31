// /src/routes/teacher/lecture.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createLecture, getAllLectures, updateLectuer, deleteLectuer
} from '../../controllers/teacher/lecture.controller.js'

// Import Validations
import {
  monthIdValidation, createLectureValidation,getLecturesQueryValidation, lectureIdValidation, updateLectureValidation
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

/**
 * @desc Update Lecture Route  
 * @route PUT /api/teacher/:monthId/lecture/:lectureId
*/
router.put(
  '/api/teacher/:monthId/lecture/:lectureId',
  authTeacher,
  contextMiddleware,
  monthIdValidation,
  lectureIdValidation,
  updateLectureValidation,
  updateLectureValidation
);

/**
 * @desc Delete Lecture Route  
 * @route DELETE /api/teacher/:monthId/lecture/:lectureId
*/
router.delete(
  '/api/teacher/:monthId/lecture/:lectureId',
  authTeacher,
  contextMiddleware,
  monthIdValidation,
  lectureIdValidation,
  deleteLectuer
);

export default router;