import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';

// Import Controllers
import {
  adminLogin, getOtpStatus, verifyAdminOtp
} from '../../controllers/admin/auth.controller.js'

// Import Validations
import {
  adminLoginValidation, verifyAdminOtpValidation
} from '../../validations/admin/auth.validation.js';

/**
 * @desc Admin Login Route
 * @route POST api/admin/login 
*/
router.post(
  '/api/admin/login',
  contextMiddleware,
  adminLoginValidation,
  adminLogin
);

/**
 * @desc Get Otp Status 
 * @route GET /api/admin/verify-otp 
*/
router.get(
  '/api/admin/verify-otp',
  contextMiddleware,
  getOtpStatus
);

/**
 * @desc Verify Admin OTP Page
 * @route POST /api/admin/verify-otp
*/
router.post(
  '/api/admin/verify-otp',
  contextMiddleware,
  verifyAdminOtpValidation,
  verifyAdminOtp
);
  
export default router;