// /src/validations/student/exam.validation.js
import { Joi, celebrate, Segments } from 'celebrate';


/**
 * ============================
 * ✅ Month ID Validation
 * ============================
 */
export const examIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    examId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': '❌ معرف الإختبار غير صحيح',
        'string.length': '❌ معرف الإختبار غير صحيح',
        'any.required': '❌ معرف الإختبار مطلوب',
      }),
  }),
});