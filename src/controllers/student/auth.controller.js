// /src/controllers/student/auth.controller.js
import {
  studentLoginService, authMeService
} from '../../services/student/auth.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Student Login
 * @route POST /api/student/login
 * @access Public
*/
export const studentLogin = async ( req, res, next ) => {
  try{
    // Take Credentials From Req Body
    const { code, deviceId } = req.body || {};
    
    // Validate Required Fields
    if( !code || !deviceId ){
      throw new ErrorResponse( '❌ الرجاء إدخال جميع البيانات' );
    };

    // Call Student Login Service
    const { token, studentName } = await studentLoginService(
      req, {
        code, deviceId
      }
    );

    // Save Token In Cookie 
    res.cookie('studentToken', token, {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: 'Lax'
    });
    
    return res.status(200).json({
      success: true,
      msg: `مرحبا بعودتك, ${ studentName || ''}.`
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Student Auth Me 
 * @route GET /api/auth/me/student
 * @access Private ( Only Student )
*/
export const authMe = async ( req, res, next ) => {
  try{
    // Get Student Id From Cookies 
    const studentId = req.student.id;
    
    // Call Auth Me Service
    const { student } = await authMeService( studentId );

    // Return Success Response 
    return res.status(200).json({
      success: true,
      data: {
        student
      }
    })
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Student Logout
 * @route POST /api/student/logout
 * @access Private ( Only Student )
*/
export const studentLogout = async ( req, res, next ) => {
  res.clearCookie('studentToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  });
  
  return res.status(200).json({
    success: true,
    msg: '✅ تم تسجيل الخروج بنجاح!'
  });
};