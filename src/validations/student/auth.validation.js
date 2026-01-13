// /src/validations/student/auth.validation.js
import { Joi, celebrate, Segments } from "celebrate";

// Student Login Validation
export const studentLoginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    code: Joi.string().trim().min(1).max(20).required().messages({
      "string.base": "❌ الكود يجب أن يكون نص",
      "string.empty": "❌ الكود مطلوب",
      "string.min": "❌ الكود قصير جدًا",
      "string.max": "❌ الكود طويل جدًا",
      "any.required": "❌ الكود مطلوب",
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
