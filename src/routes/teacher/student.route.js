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

/**
 * @desc Create Student
 * @route POST /api/teacher/student 
*/
router.post(
  '/api/teacher/student',
  authTeacher,
  contextMiddleware,
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
  deleteStudent
);

export default router;