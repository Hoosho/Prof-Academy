// /src/validations/teacher/month.validation.js
import { Joi, celebrate, Segments } from "celebrate";

/**
 * ✅ Create Month Validation
 */
export const createMonthValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        "string.base": "❌ عنوان الشهر يجب أن يكون نص",
        "string.empty": "❌ عنوان الشهر مطلوب",
        "string.min": "❌ عنوان الشهر لا يمكن أن يقل عن 3 أحرف",
        "string.max": "❌ عنوان الشهر طويل جدا",
        "any.required": "❌ عنوان الشهر مطلوب",
      }),

    description: Joi.string()
      .trim()
      .max(500)
      .required()
      .messages({
        "string.base": "❌ وصف الشهر يجب أن يكون نص",
        "string.empty": "❌ وصف الشهر مطلوب",
        "string.max": "❌ وصف الشهر طويل جدا",
        "any.required": "❌ وصف الشهر مطلوب",
      }),

    grade: Joi.string()
      .valid(
        "الصف الاول الاعدادي",
        "الصف الثاني الاعدادي",
        "الصف الثالث الاعدادي",
        "الصف الاول الثانوي",
        "الصف الثاني الثانوي",
        "الصف الثالث الثانوي"
      )
      .required()
      .messages({
        "any.only": "❌ المرحلة الدراسية غير صحيحة",
        "any.required": "❌ المرحلة الدراسية مطلوبة",
      }),

    thumbnail: Joi.string()
      .trim()
      .uri()
      .optional()
      .messages({
        "string.uri": "❌ رابط الصورة المصغرة غير صالح",
      }),

    isFree: Joi.boolean()
      .required()
      .messages({
        "boolean.base": "❌ يجب تحديد ما إذا كان الشهر مجاني أم لا",
        "any.required": "❌ حقل isFree مطلوب",
      }),

    price: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "❌ السعر يجب أن يكون رقم",
        "number.min": "❌ السعر لا يمكن أن يقل عن 0",
        "any.required": "❌ السعر مطلوب",
      }),
  }),
});

/**
 * ✅ Update Month Validation
 */
export const updateMonthValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .optional()
      .messages({
        "string.min": "❌ عنوان الشهر لا يمكن أن يقل عن 3 أحرف",
        "string.max": "❌ عنوان الشهر طويل جدا",
      }),

    description: Joi.string()
      .trim()
      .max(500)
      .optional()
      .messages({
        "string.max": "❌ وصف الشهر طويل جدا",
      }),

    grade: Joi.string()
      .valid(
        "الصف الاول الاعدادي",
        "الصف الثاني الاعدادي",
        "الصف الثالث الاعدادي",
        "الصف الاول الثانوي",
        "الصف الثاني الثانوي",
        "الصف الثالث الثانوي"
      )
      .optional()
      .messages({
        "any.only": "❌ المرحلة الدراسية غير صحيحة",
      }),

      status: Joi.string()
        .valid("active", "hidden", "inactive")
        .optional()
        .messages({
          "any.only": "❌ حالة الطالب غير صحيحة",
        }),

    thumbnail: Joi.string()
      .trim()
      .uri()
      .optional()
      .messages({
        "string.uri": "❌ رابط الصورة المصغرة غير صالح",
      }),

    isFree: Joi.boolean()
      .optional()
      .messages({
        "boolean.base": "❌ يجب تحديد ما إذا كان الشهر مجاني أم لا",
      }),

    price: Joi.number()
      .min(0)
      .optional()
      .messages({
        "number.base": "❌ السعر يجب أن يكون رقم",
        "number.min": "❌ السعر لا يمكن أن يقل عن 0",
      }),
  }).min(1)
    .messages({
      "object.min": "❌ يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

/**
 * ✅ Month ID Validation (Params)
 */
export const monthIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      "string.base": "❌ المعرف غير صحيح",
      "string.length": "❌ المعرف غير صحيح",
      "any.required": "❌ المعرف مطلوب",
    }),
  }),
});

/**
 * ✅ Get Months Query Validation
 */
export const getMonthsQueryValidation = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number()
      .min(1)
      .default(1)
      .messages({
        "number.base": "❌ رقم الصفحة يجب أن يكون رقم",
        "number.min": "❌ رقم الصفحة يجب أن يكون أكبر من 0",
      }),
    limit: Joi.number()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        "number.base": "❌ الحد يجب أن يكون رقم",
        "number.min": "❌ الحد الأدنى 1",
        "number.max": "❌ الحد الأقصى 100",
      }),
    grade: Joi.string()
      .valid(
        "الصف الاول الاعدادي",
        "الصف الثاني الاعدادي",
        "الصف الثالث الاعدادي",
        "الصف الاول الثانوي",
        "الصف الثاني الثانوي",
        "الصف الثالث الثانوي"
      )
      .optional()
      .messages({
        "any.only": "❌ المرحلة الدراسية غير صحيحة",
      }),
    status: Joi.string()
      .valid("active", "hidden", "inactive")
      .optional()
      .messages({
        "any.only": "❌ حالة الشهر غير صحيحة",
      }),
    search: Joi.string()
      .trim()
      .min(1)
      .optional()
      .messages({
        "string.min": "❌ قيمة البحث غير صحيحة",
      }),
  }),
});
