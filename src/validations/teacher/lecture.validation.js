// /src/validations/teacher/month.validation.js
import { Joi, celebrate, Segments } from 'celebrate';

/**
 * ============================
 * ✅ Create Lecture Validation
 * ============================
 */
export const createLectureValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(150)
      .optional()
      .messages({
        'string.min': '❌ عنوان الحصة قصير جدا',
        'string.max': '❌ عنوان الحصة طويل جدا',
      }),

    description: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        'string.max': '❌ وصف الحصة طويل جدا',
      }),

    thumbnail: Joi.string()
      .trim()
      .uri()
      .optional()
      .messages({
        'string.uri': '❌ رابط الصورة المصغرة غير صالح',
      }),

    videoUrl: Joi.string()
      .trim()
      .uri()
      .required()
      .messages({
        'string.uri': '❌ رابط الفيديو غير صالح',
        'any.required': '❌ رابط الفيديو مطلوب',
      }),

    durationMinutes: Joi.number()
      .min(1)
      .optional()
      .messages({
        'number.base': '❌ مدة الحصة يجب أن تكون رقم',
        'number.min': '❌ مدة الحصة غير صحيحة',
      }),

    attachmentCodes: Joi.array()
      .items(
        Joi.string().trim().min(3)
      )
      .optional()
      .messages({
        'array.base': '❌ أكواد الملفات يجب أن تكون Array',
      }),

    examCode: Joi.string()
      .trim()
      .optional()
      .messages({
        'string.base': '❌ كود الامتحان غير صحيح',
      }),
  }),
});

/**
 * ============================
 * ✅ Get Lectures Query Validation
 * ============================
 */
export const getLecturesQueryValidation = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number()
      .min(1)
      .default(1)
      .messages({
        'number.base': '❌ رقم الصفحة يجب أن يكون رقم',
        'number.min': '❌ رقم الصفحة يجب أن يكون أكبر من 0',
      }),

    limit: Joi.number()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        'number.base': '❌ الحد يجب أن يكون رقم',
        'number.min': '❌ الحد الأدنى 1',
        'number.max': '❌ الحد الأقصى 50',
      }),

    search: Joi.string()
      .trim()
      .min(1)
      .optional()
      .messages({
        'string.min': '❌ قيمة البحث غير صحيحة',
      }),

    status: Joi.string()
      .valid('نشط', 'غير نشط', 'مخفي', 'all')
      .optional()
      .messages({
        'any.only': '❌ حالة الحصة غير صحيحة',
      }),
  }),
});

/**
 * ============================
 * ✅ Month ID Validation
 * ============================
 */
export const monthIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    monthId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': '❌ معرف الشهر غير صحيح',
        'string.length': '❌ معرف الشهر غير صحيح',
        'any.required': '❌ معرف الشهر مطلوب',
      }),
  }),
});

/**
 * ============================
 * ✅ Lecture ID Validation
 * ============================
 */
export const lectureIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    lectureId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        'string.hex': '❌ معرف الحصة غير صحيح',
        'string.length': '❌ معرف الحصة غير صحيح',
        'any.required': '❌ معرف الحصة مطلوب',
      }),
  }),
});
