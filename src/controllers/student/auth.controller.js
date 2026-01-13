// /src/controllers/student/auth.controller.js
import {
  studentLoginService
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