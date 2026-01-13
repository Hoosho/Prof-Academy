    // controllers/admin/auth.controller.js
    import { ErrorResponse } from '../../utils/errorResponse.util.js';
    import { adminLoginService, verifyAdminOtpService } from '../../services/admin/auth.service.js';
    import Admin from '../../models/Admin.model.js';

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
        await adminLoginService(username, password, req);
        
        // Return Success Response
        return res.status(200).json({
          success: true,
        });
      }catch(err){
        console.log(err);
        next(err);
      };
    };

    /**
     * @desc Get Otp Status 
     * @route GET api/admin/verify-otp
     * @access Public
    */ 
    export const getOtpStatus = async ( req, res, next ) => { // ضفنا async هنا
      try {
        // Take Username From Session
        const username = req.session.username;
        if( !username ) return res.redirect('/admin/login');
        
        // Fetch Admin & Check If Exists
        const admin = await Admin.findOne({ username }).select('+otpCode +otpExpires');
        if (!admin || !admin.otpCode) return res.redirect('/admin/login');


        // Delecear Msg And Alert Type Variables  
        let msg = '';
        let alertType = '';

        // Check Otp Age
        const now = Date.now();
        const otpAge = now - (admin.otpExpires.getTime() - (5 * 60 * 1000)); 

        // Check Expireation 
        if (admin.otpExpires > now) {
          // If Otp Valid, And Generated Before 10 Seconds 
          if (otpAge < 10000) { 
            msg = '✅ تم إرسال كود OTP إلى بريدك الإلكتروني. الرجاء إدخاله لإكمال تسجيل الدخول.';
            alertType = 'success';
          } else {
            // If Otp Not Expired But Valid  
            msg = '⚠️ يوجد رمز تحقق فعال أرسل إليك بالفعل، يرجى استخدامه';
            alertType = 'info';
          }
        } else {
          // If Otp Expired 
          msg = '❌ انتهت صلاحية الرمز، يرجى تسجيل الدخول مجدداً';
          alertType = 'failed';
        };
        
        // Return Success Res With ( Msg - Alert Type ) 
        res.status(200).json({
          msg,
          type: alertType,
        });
      } catch (err) {
        console.log(err);
        next(err);
      };
    };
    /**
     * @desc Verify Admin OTP 
     * @route POST /api/admin/verify-otp
     * @access Public
    */ 
    export const verifyAdminOtp = async ( req, res, next ) => {
      try{
        // Take OTP From Req Body
        const { otp } = req.body || {};

        // Take Username From Session 
        const username = req.session.username;

        // Check Required Fields
        if( !username || !otp ){
          throw new ErrorResponse('❌ يجب ادخال اسم المستخدم و OTP', 400);
        };

        // Call Verify Admin Otp Service
        const { token } = await verifyAdminOtpService( username, otp, req );

        // Save Token In Cookie
        res.cookie('adminToken', token, {
          httpOnly: true,
          maxAge: 1 * 24 * 60 * 60 * 1000,
          secure: false,
          sameSite: 'Lax'
        });
        
        // Return Success Response
        return res.status(200).json({
          success: true,
          msg: '✅ تم التحقق من OTP وتسجيل الدخول بنجاح.'
        });
      }catch(err){
        console.log(err);
        next(err);
      };
    };

