// /src/routes/student/student.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'

// Import Controllers
import {
  getStudentMonths, chargeWallet, buyMonth, getProfile, authMe
} from '../../controllers/student/student.controller.js'

// Import Validations
import {
  chargeWalletValidation, buyMonthValidation
} from '../../validations/student/student.validation.js';

/**
 * @desc Get Student Months Route
 * @route GET /api/student/months 
*/
router.get(
  '/api/student/months',
  authStudent,
  getStudentMonths
);


/**
 * @desc Student Charge Wallet Route
 * @route POST /api/student/charge-wallet
*/
router.post(
  '/api/student/charge-wallet',
  authStudent,
  contextMiddleware,
  chargeWalletValidation,
  chargeWallet,
);

/**
 * @desc Student Buy Month Route
 * @route POST /api/student/buy-month/:monthId
*/
router.post(
  '/api/student/buy-month/:monthId',
  authStudent,
  contextMiddleware,
  buyMonthValidation,
  buyMonth,
);

/**
 * @desc Get Student Profile Route
 * @route GET /api/student/profile
*/
router.get(
  '/api/student/profile',
  authStudent,
  getProfile
);

/**
 * @desc Auth Me Route
 * @route GET /api/auth/me
*/
router.get(
  '/api/auth/me',
  authStudent,
  authMe
);

export default router;