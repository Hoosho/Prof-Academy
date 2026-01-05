// /src/validations/admin/teacher.validation.js
import { Joi, celebrate, Segments } from "celebrate";

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
    email: Joi.string().email().required().messages({
      "string.email": "❌ البريد الإلكتروني غير صالح",
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
    subject: Joi.string().required().messages({
      "any.required": "❌ المادة مطلوبة"
    }),
    avatar: Joi.string().uri().messages({
      "string.uri": "❌ رابط الصورة غير صالح"
    }),
    bio: Joi.string().max(500).messages({
      "string.max": "❌ السيرة الذاتية طويلة جدًا"
    }),
    status: Joi.string().valid("نشط", "معلق", "محظور").default("نشط").messages({
      "any.only": "❌ الحالة يجب أن تكون نشط أو معلق أو محظور"
    })
  })
});

/**
 * ✅ Update Teacher Validation
 */
export const updateTeacherValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(50).trim().messages({
      "string.base": "❌ الاسم يجب أن يكون نص",
      "string.min": "❌ الاسم قصير جدًا",
      "string.max": "❌ الاسم طويل جدًا"
    }),
    email: Joi.string().email().messages({
      "string.email": "❌ البريد الإلكتروني غير صالح"
    }),
    phone: Joi.string().pattern(/^\d{11}$/).messages({
      "string.pattern.base": "❌ رقم الهاتف يجب أن يكون 11 رقم"
    }),
    password: Joi.string().min(6).messages({
      "string.min": "❌ كلمة المرور قصيرة جدًا"
    }),
    subject: Joi.string(),
    avatar: Joi.string().uri().messages({
      "string.uri": "❌ رابط الصورة غير صالح"
    }),
    bio: Joi.string().max(500).messages({
      "string.max": "❌ السيرة الذاتية طويلة جدًا"
    }),
    status: Joi.string().valid("نشط", "معلق", "محظور").messages({
      "any.only": "❌ الحالة يجب أن تكون نشط أو معلق أو محظور"
    })
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
