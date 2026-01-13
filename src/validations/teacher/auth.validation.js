// /src/validations/teacher/auth.validation.js
import { Joi, celebrate, Segments } from "celebrate";

// Teacher Login Validation
export const teacherLoginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().trim().lowercase().email().required().messages({
      "string.base": "❌ البريد الإلكتروني يجب أن يكون نص",
      "string.empty": "❌ البريد الإلكتروني مطلوب",
      "string.email": "❌ البريد الإلكتروني غير صالح",
      "any.required": "❌ البريد الإلكتروني مطلوب",
    }),
    password: Joi.string().min(6).max(50).required().messages({
      "string.base": "❌ كلمة المرور يجب أن تكون نص",
      "string.empty": "❌ كلمة المرور مطلوبة",
      "string.min": "❌ كلمة المرور قصيرة جدًا",
      "string.max": "❌ كلمة المرور طويلة جدًا",
      "any.required": "❌ كلمة المرور مطلوبة",
    }),
    deviceId: Joi.string().trim().min(1).max(100).required().messages({
      "string.base": "❌ معرف الجهاز يجب أن يكون نص",
      "string.empty": "❌ معرف الجهاز مطلوب",
      "string.min": "❌ معرف الجهاز قصير جدًا",
      "string.max": "❌ معرف الجهاز طويل جدًا",
      "any.required": "❌ معرف الجهاز مطلوب",
    }),
  }),
});
