// /src/routes/student/student.rotue.js
import express from "express";
const router = express.Router();

// Import Middlewares
import { contextMiddleware } from '../../middlewares/context.middleware.js';
import { authStudent } from '../../middlewares/auth.middleware.js'
import { uploadProfile } from '../../middlewares/uploadImages.middleware.js';

// Import Controllers
import {
  getStudentMonths, chargeWallet, buyMonth, getProfile, updateStudent
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
 * @desc Update Student Route
 * @route PUT /api/student/student
*/
router.put(
  '/api/student/student',
  authStudent,
  uploadProfile,
  updateStudent
);

export default router;