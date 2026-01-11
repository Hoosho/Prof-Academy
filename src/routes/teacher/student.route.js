// /src/routes/teacher/student.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createStudent, getAllStudents, updateTeacher, deleteStudent 
} from '../../controllers/teacher/student.controller.js'

// Import Validations
import {
  createStudentValidation, getStudentsQueryValidation, studentIdValidation, updateStudentValidation
} from '../../validations/teacher/student.validation.js'
/**
 * @desc Create Student
 * @route POST /api/teacher/student 
*/
router.post(
  '/api/teacher/student',
  authTeacher,
  contextMiddleware,
  createStudentValidation,
  createStudent
);

/**
 * @desc Get All Students
 * @route GET /api/teacher/students
*/
router.get(
  '/api/teacher/student',
  authTeacher,
  contextMiddleware,
  getStudentsQueryValidation,
  getAllStudents
);

/**
 * @desc Update Student
 * @route PUT /api/teacher/student/:id
*/
router.put(
  '/api/teacher/student/:id',
  authTeacher,
  contextMiddleware,
  studentIdValidation,
  updateStudentValidation,
  updateTeacher
);

/**
 * @desc Delete Student
 * @route Delete /api/teacher/student/:id
*/
router.delete(
  '/api/teacher/student/:id',
  authTeacher,
  contextMiddleware,
  studentIdValidation,
  deleteStudent
);

export default router;