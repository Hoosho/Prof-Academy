  import express from "express";
  const router = express.Router();

  // Import Middlewares
  import { authAdmin } from '../../middlewares/auth.middleware.js';
  import { contextMiddleware } from '../../middlewares/context.middleware.js';

  // Import Validations
  import {
    createTeacherValidation, getTeachersQueryValidation, teacherIdValidation, updateTeacherValidation
  } from '../../validations/admin/teacher.validatoin.js';

  // Import Controllers
  import {
    createTeacher, getAllTeachersWithStats, updateTeacher, deleteTeacher
  } from '../../controllers/admin/teacher.controller.js';

  /**
   * @desc Create New Teacher
   * @route POST /api/admin/teacher
  */
  router.post(
    '/api/admin/teacher',
    authAdmin,
    contextMiddleware,
    createTeacherValidation,
    createTeacher,
  );

  /**
   * @desc Get All Teacher With Stats
   * @route GET /api/admin/teachers
  */
  router.get(
    '/api/admin/teachers',
    authAdmin,
    getTeachersQueryValidation,
    getAllTeachersWithStats
  );

  /**
   * @desc Update Teacher 
   * @route PUT api/admin/teacher
  */
  router.put(
    '/api/admin/teacher/:id',
    authAdmin,
    contextMiddleware,
    teacherIdValidation,
    updateTeacherValidation,
    updateTeacher
  );

  /**
   * @desc Delete Teacher 
   * @route DELETE api/admin/teacher/:id
  */
  router.delete(
    '/api/admin/teacher/:id',
    authAdmin,
    contextMiddleware,
    teacherIdValidation,
    deleteTeacher
  );

  export default router;