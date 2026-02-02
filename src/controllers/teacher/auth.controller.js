// /src/services/teacher/auth.service.js
import {
  teacherLoginService, authMeService
} from '../../services/teacher/auth.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
/**
 * @desc Teacher Login
 * @route POST /api/teacher/login
 * @access Private ( Only Admin )
*/
export const teacherLogin = async ( req, res, next ) => {
  try{
    // Take Credentials From Req Body
    const {
      email, password, deviceId
    } = req.body || {};

    // Validate Require Fields
    if( !email || !password || !deviceId ){
      throw new ErrorResponse( '❌ الرجاء إدخال جميع البيانات' );
    };

    // Call Login Service
    const result = await teacherLoginService(
      req,
      email.trim().toLowerCase(),
      password,
      deviceId,
    );

    // Create Token IF Exist
    if( result?.token ){
      const token = result.token;
      // Save Token In Cookie
      res.cookie('teacherToken', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: 'Lax'
      });
    };

    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: result.requiresOtp? '🔐 مطلوب رمز تحقق': '✅ تم تسجيل الدخول بنجاح',
      data: result
    })
  }catch(err){
    console.log(err);
    next(err);
  };
};

/**
 * @desc teacher Auth Me 
 * @route GET /api/auth/me/teacher
 * @access Private ( Only teacher )
*/
export const authMe = async ( req, res, next ) => {
  try{
    // Get Student Id From Cookies 
    const teacherId = req.teacher.id;
    
    // Call Auth Me Service
    const { teacher } = await authMeService( teacherId );

    // Return Success Response 
    return res.status(200).json({
      success: true,
      data: {
        teacher
      }
    })
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Teacher Logout
 * @route POST /api/teacher/logout
 * @access Private ( Only Teacher )
*/
export const teacherLogout = async ( req, res, next ) => {
  res.clearCookie('teacherToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  });
  
  return res.status(200).json({
    success: true,
    msg: '✅ تم تسجيل الخروج بنجاح!'
  });
};