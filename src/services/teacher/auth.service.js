// /src/services/teacehr/auth.service.js 
import Teacher from '../../models/Teacher.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { generateToken } from '../../utils/generateToken.util.js';
import { generateOtp } from '../../utils/generateOtp.util.js';
import  { sendEmail } from '../../utils/sendEmail.util.js';
import { createAuditLog } from '../system/auditLog.service.js';

/**
 * @desc Login Teacher
 * @param { string } email & password
 * @param { string } deviceId
 * @param { object } req
*/
export const teacherLoginService = async ( req, email, password, deviceId ) => {
  console.log('test')
  // Fetch Teacher
  const teacher = await Teacher.findOne({ email })
    .select('+password +otpCode +otpExpires');
  if( !teacher ) {
    throw new ErrorResponse( '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 401 );
  };

  // Check Account Is Locked 
  if( teacher.lockUntil && teacher.lockUntil > Date.now() ){
    await createAuditLog({
      actor: {
        id: teacher._id,
        model: teacher.role,
        type: 'TEACHER'
      },
      action: 'AUTH.LOGIN.BLOCKED.LOCKED',
      target: {
        model: 'Teacher',
        id: teacher._id
      },
      reason: 'Account temporarily locked due to failed attempts',
      context: req.context?.context || {}
    });
  
    throw new ErrorResponse( '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 401 );
  };


  // Compare Password 
  const isMatch = await teacher.comparePassword( password );
  if( !isMatch ){
    // Record Failed Attempts
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000;
    teacher.failedLoginAttempts = ( teacher.failedLoginAttempts || 0 ) + 1;

    // Check If Arriave Max Login Attempts, Lock Account 
    if( teacher.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS ){
      teacher.lockUntil = new Date( Date.now() + LOCK_TIME );
    };

    // Create Audit Log - Login Failed 
    await createAuditLog({
      actor: {
        id: teacher._id,
        model: teacher.role,
        type: 'TEACHER'
      },
      action: 'AUTH.LOGIN.CREDENTIALS.FAIL',
      target: {
        model: 'Teacher',
        id: teacher._id
      },
      reason: 'Incorrect password',
      context: req.context?.context || {}
    });

    // Save Changes
    await teacher.save();

    throw new ErrorResponse('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
  };

  // Check Account Status 
  if( teacher.status !== 'active' ){
    await createAuditLog({
      actor: {
        id: teacher._id,
        model: teacher.role,
        type: 'TEACHER'
      },
      action: 'AUTH.LOGIN.BLOCKED.STATUS',
      target: {
        model: 'Teacher',
        id: teacher._id
      },
      reason: `Account Status: ${teacher.status}`,
      context: req.context?.context || {}
    });

    throw new ErrorResponse('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 401);
  };

  // Check Device Id
  const hasStoredDevice = 
  typeof teacher.deviceId === 'string' && teacher.deviceId.trim() !== '';

  const isSameDevice =
  hasStoredDevice && deviceId && teacher.deviceId === deviceId;

  // Case One: First Login => Trust Device 
  if( !hasStoredDevice && deviceId ) {
    const token = generateToken({
      id: teacher._id,
      role: teacher.role
    });
    // Save Device Id & Last Login And Reset Default Values About Failed Attempts 
    teacher.deviceId = deviceId;
    teacher.lastLogin = Date.now();
    teacher.failedLoginAttempts = 0;
    teacher.lockUntil = null;
    teacher.otpCode = null;
    teacher.otpExpires = null;
    teacher.otpVerified = false;
    await teacher.save();

    // Create Audit Log - Success Login First Device Trusted  
    await createAuditLog({
      actor: {
        id: teacher._id,
        model: teacher.role,
        type: 'TEACHER'
      },
      action: 'AUTH.LOGIN.FIRST_DEVICE.TRUSTED',
      target: {
        model: 'Teacher',
        id: teacher._id
      },
      reason: 'First login, device trusted',
      context: req.context?.context || {}
    });

    return {
      token,
      requiresOtp : false,
      otpSent: false
    };
  };
  // Case Two: Different Device => OTP Required
  if( hasStoredDevice && !isSameDevice ){
    // Check If Already Exist Valid OTP 
    if ( teacher.otpCode && teacher.otpExpires && teacher.otpExpires > Date.now() ){
      return {
        requiresOtp: true,
        otpSent: false // already sent
      };
    };
    // Generate Otp With Expiration
    const otp = generateOtp();
    const otpExpires = new Date( Date.now() + 15 * 60 * 1000 );

    // Save Otp ( Code & Expires & varified ) 
    teacher.otpCode = otp;
    teacher.otpExpires = otpExpires;
    teacher.otpVerified = false;
    await teacher.save();
  
    // Save Teacher Email In Session 
    req.session.teacherEmail = teacher.email;
    req.session.save();

    // Send OTP To Email
    await sendEmail( teacher.email, 'رمز التحقق - Prof Academy', otp );
    // Create Audit Log - Required New Device
    await createAuditLog({
      actor: {
        id: teacher._id,
        model: teacher.role,
        type: 'TEACHER'
      },
      action: 'AUTH.LOGIN.OTP.REQUIRED.NEW_DEVICE',
      target: {
        model: 'Teacher',
        id: teacher._id,
      },
      reason: 'Login attempts from untrusted device',
      context: req.context?.context || {}
    });
    return {
      requiresOtp: true,
      otpSent: true
    };
  };

  // Generate Token
  const token = generateToken({
    id: teacher._id,
    role: teacher.role
  });

  // Save Last Login And Reset Default Values About Failed Attempts 
  teacher.lastLogin = Date.now();
  teacher.failedLoginAttempts = 0;
  teacher.lockUntil = null;
  teacher.otpCode = null;
  teacher.otpExpires = null;
  teacher.otpVerified = false;
  await teacher.save();

  // Create Audit Log - Success Login Trusted Device  
  await createAuditLog({
    actor: {
      id: teacher._id,
      model: teacher.role,
      type: 'TEACHER'
    },
    action: 'AUTH.LOGIN.CREDENTIALS.SUCCESS',
    target: {
      model: 'Teacher',
      id: teacher._id
    },
    reason: 'Login From Trusted Device',
    context: req.context?.context || {}
  });
  return {
    token,
    requiresOtp: false,
    otpSent: false
  };
};

/**
 * @desc Auth Me Service
 * @param { string } teacherId
 * @returns { object } { teacher }
*/
export const authMeService = async ( adminId ) => {
  try{
    // Check IF Student Exists
    const teacher = await Teacher.findOne({
      _id: teacherId,
      status: 'active',
      isDeleted: false
    });
    if( !teacher ) throw new ErrorResponse( '❌ المستخدم غير موجود!', 404 );

    // Return Student Data 
    return {
      teacher: {
        name: teacher.name,
        avatar: teacher.avatar
      }
    };
  }catch( err ){
    throw err;
  };
};