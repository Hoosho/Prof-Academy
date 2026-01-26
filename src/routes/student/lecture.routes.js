// /src/routes/student/lecture.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  getLecturesForMonth
} from '../../controllers/student/lecture.controller.js'

// Import Validations
// import {
// } from '../../validations/student/student.validation.js';

/**
 * @desc Get Student Months Route
 * @route GET /api/student/months 
*/
router.get(
  '/api/student/:monthId/lectures',
  authStudent,
  getLecturesForMonth
);

export default router;