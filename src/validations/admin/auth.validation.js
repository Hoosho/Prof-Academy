// /src/validations/admin/teacher.validation.js
// validations/admin/auth.validation.js
import { Joi, celebrate, Segments } from "celebrate";

/**
 * ✅ Admin Login Validation
 * - username & password required
 */
export const adminLoginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string().trim().required().messages({
      "string.base": "❌ اسم المستخدم يجب أن يكون نص",
      "string.empty": "❌ اسم المستخدم مطلوب",
      "any.required": "❌ اسم المستخدم مطلوب",
    }),
    password: Joi.string().min(6).required().messages({
      "string.base": "❌ كلمة المرور يجب أن تكون نص",
      "string.empty": "❌ كلمة المرور مطلوبة",
      "string.min": "❌ كلمة المرور قصيرة جدًا",
      "any.required": "❌ كلمة المرور مطلوبة",
    }),
  }),
});

/**
 * ✅ Admin Verify OTP Validation
 * - otp required & 6 digits
 */
export const verifyAdminOtpValidation = celebrate({
  [Segments.BODY]: Joi.object({
    otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
      "string.base": "❌ كود OTP يجب أن يكون نص",
      "string.empty": "❌ كود OTP مطلوب",
      "string.length": "❌ كود OTP يجب أن يكون 6 أرقام",
      "string.pattern.base": "❌ كود OTP يجب أن يحتوي على أرقام فقط",
      "any.required": "❌ كود OTP مطلوب",
    }),
  }),
});