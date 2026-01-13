// /src/routes/student/auth.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  studentLogin
} from '../../controllers/student/auth.controller.js'

// Import Validations
// import {

// } from '../../validations/student/auth.validation.js';

/**
 * @desc Student Login Route
 * @route POST api/admin/login 
*/
router.post(
  '/api/student/login',
  contextMiddleware,
  studentLogin
);

export default router;