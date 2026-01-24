// /src/routes/teacher/profCode.route.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { authTeacher } from '../../middlewares/auth.middleware.js'
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  createProfCodes
} from '../../controllers/teacher/profCode.controller.js'

// Import Validations
// import {
// } from '../../validations/teacher/student.validation.js'

/**
 * @desc Create Prof Code
 * @route POST /api/teacher/prof-code 
*/
router.post(
  '/api/teacher/prof-code',
  authTeacher,
  contextMiddleware,
  createProfCodes
);

export default router;