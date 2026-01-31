// /src/validations/student/exam.validation.js
import { Joi, celebrate, Segments } from 'celebrate';

/**
 * ============================
 * ✅ Exam ID Validation
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

/**
 * ============================
 * ✅ Submit Exam Validation
 * ============================
*/
export const submitExamValidation = celebrate({
  [Segments.BODY]: Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string()
            .hex()
            .length(24)
            .required()
            .messages({
              'string.hex': '❌ معرف السؤال غير صالح',
              'string.length': '❌ معرف السؤال غير صالح',
              'any.required': '❌ معرف السؤال مطلوب',
            }),
          answerIndex: Joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
              'number.base': '❌ الإجابة يجب أن تكون رقم',
              'number.integer': '❌ الإجابة يجب أن تكون عدد صحيح',
              'number.min': '❌ الإجابة غير صحيحة',
              'any.required': '❌ الإجابة مطلوبة',
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.base': '❌ الإجابات يجب أن تكون مصفوفة',
        'array.min': '❌ يجب إرسال إجابة واحدة على الأقل',
        'any.required': '❌ الإجابات مطلوبة',
      }),
  }),
});
