// controllers/admin/auth.controller.js
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { adminLoginService } from '../../services/admin/auth.service.js';


/**
 * @desc Render Admin Login
 * @route GET /admin/login
 * @access Public
*/
export const renderAdminLogin = async ( req, res, next ) => {
  try{
    return res.status(200).render('admin/auth/login');
  }catch(err){
    console.log(err);
    next(err);
  };
};

/**
 * @desc Admin Login
 * @route POST /api/admin/login
 * @access Public
*/
export const adminLogin = async ( req, res, next ) => {
  try{
    // Take Data From Req Body 
    const { username, password } = req.body || {}; 
    
    // Check If Field Exists Or No 
    if( !username || !password ) throw new ErrorResponse( '❌ يجب ادخال جميع البينات المطلوبة!', 404 );

    // Call Service
    const { token } = await adminLoginService(username, password);

    // Save Token In Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000
    }); 

    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: '✅ تم تسجيل الدخول بنجاح.'
    });
  }catch(err){
    console.log(err);
    next(err);
  };
};