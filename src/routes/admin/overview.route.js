import express from "express";
const router = express.Router();

// Import Middlewares
import {
  authAdmin, authTeacher
} from '../../middlewares/auth.middleware.js';

// Import Controllers
import {
  renderOverview
} from '../../controllers/admin/overview.controller.js'

/**
 * @desc Render Admin Overview Page
 * @route GET /admin/overview 
*/
router.get(
  '/admin/dashboard/overview',
  authTeacher,
  renderOverview
);

export default router;