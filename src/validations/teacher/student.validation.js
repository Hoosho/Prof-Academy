// /src/validations/teacher/student.validation.js
import { Joi, celebrate, Segments } from "celebrate";

/**
 * ✅ Create Student Validation
 */
export const createStudentValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .required()
      .messages({
        "string.base": "❌ اسم الطالب يجب أن يكون نص",
        "string.empty": "❌ اسم الطالب مطلوب",
        "string.min": "❌ اسم الطالب لا يمكن أن يقل عن 3 أحرف",
        "any.required": "❌ اسم الطالب مطلوب",
      }),

    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        "string.email": "❌ البريد الإلكتروني غير صحيح",
        "string.empty": "❌ البريد الإلكتروني مطلوب",
        "any.required": "❌ البريد الإلكتروني مطلوب",
      }),

    phone: Joi.string()
      .pattern(/^\d{11}$/)
      .required()
      .messages({
        "string.pattern.base": "❌ رقم هاتف الطالب يجب أن يكون 11 رقم",
        "string.empty": "❌ رقم هاتف الطالب مطلوب",
        "any.required": "❌ رقم هاتف الطالب مطلوب",
      }),

    guardianPhone: Joi.string()
      .pattern(/^\d{11}$/)
      .required()
      .messages({
        "string.pattern.base": "❌ رقم هاتف ولي الأمر يجب أن يكون 11 رقم",
        "string.empty": "❌ رقم هاتف ولي الأمر مطلوب",
        "any.required": "❌ رقم هاتف ولي الأمر مطلوب",
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
        "any.only": "❌ الصف الدراسي غير صحيح",
        "any.required": "❌ الصف الدراسي مطلوب",
      }),

    cash: Joi.number()
      .min(0)
      .required()
      .messages({
        "number.base": "❌ الرصيد يجب أن يكون رقم",
        "number.min": "❌ الرصيد لا يمكن أن يقل عن 0",
        "any.required": "❌ الرصيد مطلوب",
      }),
  }),
});

/**
 * ✅ Get Students Query Validation
 */
export const getStudentsQueryValidation = celebrate({
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
        "any.only": "❌ الصف الدراسي غير صحيح",
      }),

    status: Joi.string()
      .valid("نشط", "محظور")
      .optional()
      .messages({
        "any.only": "❌ حالة الطالب غير صحيحة",
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

/**
 * ✅ Update Student Validation
 */
export const updateStudentValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .optional()
      .messages({
        "string.min": "❌ اسم الطالب لا يمكن أن يقل عن 3 أحرف",
      }),

    phone: Joi.string()
      .pattern(/^\d{11}$/)
      .optional()
      .messages({
        "string.pattern.base": "❌ رقم هاتف الطالب يجب أن يكون 11 رقم",
      }),

    guardianPhone: Joi.string()
      .pattern(/^\d{11}$/)
      .optional()
      .messages({
        "string.pattern.base": "❌ رقم هاتف ولي الأمر يجب أن يكون 11 رقم",
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
        "any.only": "❌ الصف الدراسي غير صحيح",
      }),

    status: Joi.string()
      .valid("نشط", "محظور")
      .optional()
      .messages({
        "any.only": "❌ حالة الطالب غير صحيحة",
      }),

    cash: Joi.number()
      .min(0)
      .optional()
      .messages({
        "number.base": "❌ الرصيد يجب أن يكون رقم",
        "number.min": "❌ الرصيد لا يمكن أن يقل عن 0",
      }),
  })
    .min(1)
    .messages({
      "object.min": "❌ يجب إرسال حقل واحد على الأقل للتحديث",
    }),
});

/**
 * ✅ Student ID Validation (Params)
 */
export const studentIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      "string.base": "❌ المعرف غير صحيح",
      "string.length": "❌ المعرف غير صحيح",
      "any.required": "❌ المعرف مطلوب",
    }),
  }),
});
