// /src/routes/teacher/month.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createMonth, getAllMonth, updateMonth, deleteMonth
} from '../../controllers/teacher/month.controller.js'

// Import Validations
import {
  createMonthValidation, getMonthsQueryValidation, monthIdValidation, updateMonthValidation
} from '../../validations/teacher/month.validation.js';
/**
 * @desc Create Month
 * @route POST /api/teacher/month 
*/
router.post(
  '/api/teacher/month',
  authTeacher,
  contextMiddleware,
  createMonthValidation,
  createMonth
);

/**
 * @desc Get All Months
 * @route GET /api/teacher/months
*/
router.get(
  '/api/teacher/months',
  authTeacher,
  contextMiddleware,
  getMonthsQueryValidation,
  getAllMonth
);

/**
 * @desc Update Month
 * @route PUT /api/teacher/month/:id
*/
router.put(
  '/api/teacher/month/:id',
  authTeacher,
  contextMiddleware,
  monthIdValidation,
  updateMonthValidation,
  updateMonth
);

/**
 * @desc Delete Month
 * @route Delete /api/teacher/month/:id
*/
router.delete(
  '/api/teacher/month/:id',
  authTeacher,
  contextMiddleware,
  monthIdValidation,
  deleteMonth
);

export default router;