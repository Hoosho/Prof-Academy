import express from "express";
const router = express.Router();

// Import Controllers
import {
  renderOverview
} from '../../controllers/admin/overview.controller.js'

/**
 * @desc Render Admin Overview Page
 * @route GET /admin/overview 
*/
router.route('/admin/overview')
  .get( renderOverview )

export default router;