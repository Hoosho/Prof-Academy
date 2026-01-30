// /src/validations/admin/teacher.validation.js
import { Joi, celebrate, Segments } from 'celebrate';
/**
 * ✅ Create Teacher Validation
 */
export const createTeacherValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(50).required().trim().messages({
      "string.base": "❌ الاسم يجب أن يكون نص",
      "string.empty": "❌ الاسم مطلوب",
      "string.min": "❌ الاسم قصير جدًا",
      "string.max": "❌ الاسم طويل جدًا",
      "any.required": "❌ الاسم مطلوب"
    }),
    email: Joi.string().min(5).max(60).email().required().messages({
      "string.base": "❌ البريد الإلكتروني غير صالح",
      "string.min": "❌ الإيميل قصير جدًا",
      "string.max": "❌ الإيميل طويل جدًا",
      "any.required": "❌ البريد الإلكتروني مطلوب"
    }),
    phone: Joi.string().pattern(/^\d{11}$/).required().messages({
      "string.pattern.base": "❌ رقم الهاتف يجب أن يكون 11 رقم",
      "any.required": "❌ رقم الهاتف مطلوب"
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "❌ كلمة المرور قصيرة جدًا",
      "any.required": "❌ كلمة المرور مطلوبة"
    }),
    subject: Joi.string().min(3).max(35).trim().required().messages({
      "string.base": "❌ المادة يجب أن يكون نص",
      "string.min": "❌ المادة قصيرة جدًا",
      "string.max": "❌ المادة طويلة جدًا",
      "any.required": "❌ المادة مطلوبة",
    }),
    bio: Joi.string().max(500).messages({
      "string.base": "❌ السيرة الذاتية يجب أن يكون نص",
      "string.max": "❌ السيرة الذاتية طويلة جدًا"
    }),
    status: Joi.string().valid("active", "hidden", "inactive").default("active").messages({
      "any.only": "❌ الحالة يجب أن تكون active أو معلق أو محظور"
    })
  })
});

/**
 * ✅ Get Teacher Queries Validation
*/
export const getTeachersQueryValidation = celebrate({
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

    status: Joi.string()
      .valid("active", "hidden", "inactive")
      .optional()
      .messages({
        "any.only": "❌ حالة المعلم غير صحيحة",
      }),

    search: Joi.string()
      .trim()
      .min(1)
      .optional()
      .messages({
        "string.min": "❌ قيمة البحث غير صحيحة",
      }),
  })
});
/**
 * ✅ Update Teacher Validation
*/
export const updateTeacherValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(50).required().trim().messages({
      "string.base": "❌ الاسم يجب أن يكون نص",
      "string.empty": "❌ الاسم مطلوب",
      "string.min": "❌ الاسم قصير جدًا",
      "string.max": "❌ الاسم طويل جدًا",
      "any.required": "❌ الاسم مطلوب"
    }),
    email: Joi.string().min(5).max(60).email().required().messages({
      "string.base": "❌ البريد الإلكتروني غير صالح",
      "string.min": "❌ الإيميل قصير جدًا",
      "string.max": "❌ الإيميل طويل جدًا",
      "any.required": "❌ البريد الإلكتروني مطلوب"
    }),
    phone: Joi.string().pattern(/^\d{11}$/).required().messages({
      "string.pattern.base": "❌ رقم الهاتف يجب أن يكون 11 رقم",
      "any.required": "❌ رقم الهاتف مطلوب"
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "❌ كلمة المرور قصيرة جدًا",
      "any.required": "❌ كلمة المرور مطلوبة"
    }),
    subject: Joi.string().min(3).max(35).trim().required().messages({
      "string.base": "❌ المادة يجب أن يكون نص",
      "string.min": "❌ المادة قصيرة جدًا",
      "string.max": "❌ المادة طويلة جدًا",
      "any.required": "❌ المادة مطلوبة",
    }),
    bio: Joi.string().max(500).messages({
      "string.base": "❌ السيرة الذاتية يجب أن يكون نص",
      "string.max": "❌ السيرة الذاتية طويلة جدًا"
    }),
    status: Joi.string().valid("active", "hidden", "inactive").default("active").messages({
      "any.only": "❌ الحالة يجب أن تكون active أو معلق أو محظور"
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
  })
});

/**
 * ✅ Teacher ID Validation (For Update/Delete)
*/
export const teacherIdValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      "string.base": "❌ معرف المعلم يجب أن يكون نص",
      "string.length": "❌ معرف المعلم غير صالح (يجب أن يكون 24 حرف)",
      "any.required": "❌ معرف المعلم مطلوب"
    })
  })
});
