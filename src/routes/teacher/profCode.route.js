// /src/routes/teacher/profCode.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createProfCodes, getAllProfCodes, deleteProfCode
} from '../../controllers/teacher/profCode.controller.js'

// Import Validations
import {
  createProfCodesValidation, getProfCodesValidation, deleteProfCodesValidation
} from '../../validations/teacher/profCode.validation.js'

/**
 * @desc Create Prof Code Route
 * @route POST /api/teacher/prof-code 
*/
router.post(
  '/api/teacher/prof-code',
  authTeacher,
  contextMiddleware,
  createProfCodesValidation,
  createProfCodes
);

/**
 * @desc Create Prof Codes Route
 * @route POST /api/teacher/prof-codes
*/
router.get(
  '/api/teacher/prof-codes',
  authTeacher,
  contextMiddleware,
  getProfCodesValidation,
  getAllProfCodes
);

/**
 * @desc Delete Prof Codes Route 
 * @route DELETE /api/teacher/prof-code
*/
router.delete(
  '/api/teacher/prof-code',
  authTeacher,
  contextMiddleware,
  deleteProfCodesValidation,
  deleteProfCode
);

export default router;