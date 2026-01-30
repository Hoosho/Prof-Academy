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
      .max(50)
      .required()
      .messages({
        "string.base": "❌ اسم الطالب يجب أن يكون نص",
        "string.empty": "❌ اسم الطالب مطلوب",
        "string.min": "❌ اسم الطالب قصير جدا",
        "string.max": "❌ اسم الطالب طويل جدا",
        "any.required": "❌ اسم الطالب مطلوب",
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
      .max(2000)
      .required()
      .messages({
        "number.base": "❌ الرصيد يجب أن يكون رقم",
        "number.min": "❌ الرصيد لا يمكن أن يقل عن 0",
        "number.max": "❌ الرصيد لا يمكن أن يزيد عن 2000",
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
      .valid("active", "hidden", "inactive")
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
      .max(50)
      .required()
      .messages({
        "string.base": "❌ اسم الطالب يجب أن يكون نص",
        "string.empty": "❌ اسم الطالب مطلوب",
        "string.min": "❌ اسم الطالب قصير جدا",
        "string.max": "❌ اسم الطالب طويل جدا",
        "any.required": "❌ اسم الطالب مطلوب",
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
      .max(2000)
      .required()
      .messages({
        "number.base": "❌ الرصيد يجب أن يكون رقم",
        "number.min": "❌ الرصيد لا يمكن أن يقل عن 0",
        "number.max": "❌ الرصيد لا يمكن أن يزيد عن 2000",
        "any.required": "❌ الرصيد مطلوب",
      }),
    status: Joi.string()
      .valid( 'active', 'hidden', 'active' )
      .optional()
      .messages({
        "any.only": "❌ حالة الطالب غير صحيحة",
      }),
    deviceId: Joi.string()
      .alphanum()
      .length(32)
      .allow('') // يسمح بالـ empty string
      .messages({
        "string.base": "❌ Device ID يجب أن يكون نص",
        "string.empty": "❌ Device ID مطلوب أو فارغ",
        "string.length": "❌ Device ID يجب أن يكون 32 حرف بالضبط",
      }),
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
