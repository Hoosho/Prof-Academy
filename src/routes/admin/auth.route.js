import express from "express";
const router = express.Router();

// Import Controllers
import {
  renderAdminLogin, adminLogin
} from '../../controllers/admin/auth.controller.js'

/**
 * @desc Admin Render Admin Login Page
 * @route GET /admin/login 
*/
router.route('/admin/login')
  .get( renderAdminLogin )

/**
 * @desc Admin Login Route
 * @route POST api/admin/login 
*/
router.route('/api/admin/login')
  .post( adminLogin )

export default router;