// /services/admin/auth.service.js
import Admin from '../../models/Admin.model.js';
import { generateToken } from '../../utils/generateToken.util.js';
import { generateOtp } from '../../utils/generateOtp.util.js';
import { sendEmail } from '../../utils/sendEmail.util.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../system/auditLog.service.js';

/**
 * @desc Admin Login Step 1: Validate Credentials & Generate OTP
 * @param { string } username 
 * @param { string } password
 * @param { object } req
 * @returns { string } adminName
*/
export const adminLoginService = async ( req, username, password ) => {

  // Check If Admin Found 
  const admin =  await Admin.findOne({ username })
    .select('+password +otpCode +otpExpires');
  if( !admin ) throw new ErrorResponse( '❌ اسم المستخدم أو الباسورد غلط', 401 );
  
  // Check If Admin Accound Is Locked
  if (admin.lockUntil){
    if(admin.lockUntil > Date.now()){
      throw new ErrorResponse( '🔒 الحساب تم قفله مؤقتًا بسبب محاولات تسجيل دخول خاطئة متكررة', 423 );
    };
  };
  

  const isMatch = await admin.comparePassword(password);
  if( !isMatch ){
    // Lock Account If Max Attempts reached
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

    // Increment Login Failed Attempts With Remaining Attempts 
    admin.failedLoginAttempts = ( admin.failedLoginAttempts || 0 ) + 1;
    const remainingAttempts = Math.max( 0, MAX_LOGIN_ATTEMPTS - admin.failedLoginAttempts );

    // If User Get Max Failed Attempts, Lock Account 15 Minutes
    if( admin.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS ){
      admin.lockUntil = new Date( Date.now() + LOCK_TIME );
    };

    // Create Audit Log - Login Failed 
    await createAuditLog({
      actor: {
        id: admin._id,
        role: admin.role,
        type: 'ADMIN'
      },
      action: 'AUTH.LOGIN.CREDENTIALS.FAIL',
      target: {
        model: 'Admin',
        id: admin._id
      },
      reason: 'Incorrect password or account locked',
      context: req.context?.context || {}
    });

    // Save New Updates
    await admin.save();
    throw new ErrorResponse( `❌ اسم المستخدم أو الباسورد غلط. متبقي ${ remainingAttempts } محاولات`, 401 );
  };
  
  // Reset failed login attempts on successful login
  admin.failedLoginAttempts = 0;
  admin.lockUntil = null;

  // Add Username In Session, And Save Session
  req.session.username = username; 
  req.session.save();

  // Check If OTP Exists 
  if (admin.otpCode && admin.otpExpires && admin.otpExpires > Date.now()) {
    await admin.save()
    return;
  };
  // Generate OTP + And Add Expire Time
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000 ) // 5 Minutes
  
  // Save OTP In DB
  admin.otpCode = otp;
  admin.otpExpires = otpExpires;
  admin.otpVerified = false;
  await admin.save();

  // Send OTP Via Email  
  await sendEmail(admin.email, 'رمز التحقق - Prof Academy', otp);

  // Create Audit Log - OTP Send Successfully
  await createAuditLog({
    actor: {
      id: admin._id,
      role: admin.role,
      type: 'ADMIN'
    },
    action: 'AUTH.LOGIN.CREDENTIALS.SUCCESS',
    target: {
      model: 'Admin',
      id: admin._id
    },
    reason: 'OTP sent to email',
    context: req.context?.context || {}
  });
};
/**
 * @desc Admin Login Step2: Verify OTP & Issue Token
 * @param { string } username 
 * @param { string } otp
 * @returns { object } { token }
*/
export const verifyAdminOtpService = async ( username, otp, req ) => {
  // Fetch Admin From DB
  const admin = await Admin.findOne({ username })
    .select('+password +otpCode +otpExpires +failedOtpAttempts +otpLockedUntil');

    if( !admin ) throw new ErrorResponse( '❌ المستخدم غير موجود', 401 );

  // Check If OTP Attempts Are Locked
  if (admin.otpLockedUntil && admin.otpLockedUntil > Date.now()) {
    throw new ErrorResponse('🔒 تم إيقاف إدخال OTP مؤقتًا، حاول لاحقًا', 423);
  };  

  // Check If OTP Exists, And Not Expired
  if (!admin.otpCode || !admin.otpExpires || admin.otpVerified) {
    // Reset OTP Status
    admin.otpVerified = false;
    admin.failedOtpAttempts = 0;
    await admin.save();
    throw new ErrorResponse('❌ لا يوجد OTP صالح للتوثيق', 400); 
  };

  // If OTP Expired
  if (Date.now() > admin.otpExpires.getTime()) {
    admin.otpCode = null;
    admin.otpExpires = null;
    admin.failedOtpAttempts = 0;
    admin.otpLockedUntil = null;
    await admin.save();
    
    throw new ErrorResponse('❌ انتهت صلاحية OTP', 400);
  };

  // Determind Max Otp Attempts, Otp Look Time
  const MAX_OTP_ATTEMPTS = 5;
  const OTP_LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  // OTP Wrong
  const isOtpValid = await admin.compareOtpCode( otp )
  if ( !isOtpValid ) {
    admin.failedOtpAttempts = (admin.failedOtpAttempts || 0) + 1;
    const remainingAttempts = Math.max( 0, MAX_OTP_ATTEMPTS - admin.failedOtpAttempts );

    // If User Get Max Failed Otp Attempts, Lock Account 15 Minutes
    if (admin.failedOtpAttempts >= MAX_OTP_ATTEMPTS) {
      admin.otpLockedUntil = new Date(Date.now() + OTP_LOCK_TIME);
    };

    // Audit Log
    await createAuditLog({
      actor: {
        id: admin._id,
        role: admin.role,
        type: 'ADMIN'
      },      action: 'AUTH.OTP.FAIL',
      target: { model: 'Admin', id: admin._id },
      reason: 'Invalid OTP',
      context: req.context?.context || {}
    });

    await admin.save();
    throw new ErrorResponse( `❌ كود OTP غير صحيح. متبقي ${ remainingAttempts } محاولات`, 401 );
  };
  
  // OTP Correct
  const token = generateToken({ id: admin._id, role: admin.role });
  
  // Return Default Value Of OTP
  admin.otpVerified = true;
  admin.otpCode = null;
  admin.otpExpires = null;
  admin.failedOtpAttempts = 0;
  admin.otpLockedUntil = null;
  admin.lastLogin = Date.now();
  await admin.save();
  
  // Create Audit Log - OTP Verified Successfully 
  await createAuditLog({
    actor: {
      id: admin._id,
      role: admin.role,
      type: 'ADMIN'
    },
    action: 'AUTH.OTP.VERIFIED',
    target: { model: 'Admin', id: admin._id },
    reason: 'OTP verified, token issued',
    context: req.context?.context || {}
  });

  // Delete Username From Session
  if (req.session?.username) {
    delete req.session.username;
  };
  
  // Return Token
  return { token };
};

/**
 * @desc Auth Me Service
 * @param { string } adminId
 * @returns { object } { admin }
*/
export const authMeService = async ( adminId ) => {
  try{
    // Check IF Student Exists
    // isDeleted: false
    const admin = await Admin.findOne({
      _id: adminId,
      status: 'active',
    }).select(' _id username').lean();
    if( !admin ) throw new ErrorResponse( '❌ المستخدم غير موجود!', 404 );

    // Return Student Data 
    return {
      admin: {
        username: admin.username,
      }
    };
  }catch( err ){
    throw err;
  };
};