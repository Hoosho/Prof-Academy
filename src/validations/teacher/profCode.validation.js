// validations/profCode.validation.js
import { celebrate, Joi, Segments } from 'celebrate';

export const createProfCodesValidation = celebrate({
  [Segments.BODY]: Joi.object({
    count: Joi.number()
      .integer()
      .min(1)
      .max(250)
      .required()
      .messages({
        'number.base': '❌ عدد الأكواد يجب أن يكون رقم',
        'number.integer': '❌ عدد الأكواد يجب أن يكون رقم صحيح',
        'number.min': '❌ أقل عدد كود هو 1',
        'number.max': '❌ لا يمكن إنشاء أكثر من 250 كود دفعة واحدة',
        'any.required': '❌ عدد الأكواد مطلوب',
      }),

    value: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.base': '❌ قيمة الكود يجب أن تكون رقم',
        'number.min': '❌ قيمة الكود يجب أن تكون أكبر من 0',
        'any.required': '❌ قيمة الكود مطلوبة',
      }),

    expiresAt: Joi.date()
      .greater('now')
      .required()
      .messages({
        'date.base': '❌ تاريخ الانتهاء غير صحيح',
        'date.greater': '❌ تاريخ الانتهاء يجب أن يكون في المستقبل',
        'any.required': '❌ تاريخ الانتهاء مطلوب',
      }),
  }),
});

export const getProfCodesValidation = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .messages({
        'number.base': '❌ رقم الصفحة يجب أن يكون رقم',
        'number.min': '❌ رقم الصفحة لا يمكن أن يقل عن 1',
      }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .messages({
        'number.base': '❌ limit يجب أن يكون رقم',
        'number.min': '❌ limit لا يمكن أن يقل عن 1',
        'number.max': '❌ الحد الأقصى للعرض هو 100',
      }),

    search: Joi.string()
      .trim()
      .allow('')
      .messages({
        'string.base': '❌ البحث يجب أن يكون نص',
      }),

    status: Joi.string()
      .valid('active', 'used', 'expired')
      .messages({
        'any.only': '❌ حالة الكود غير صحيحة',
      }),
  }),
});

export const deleteProfCodesValidation = celebrate({
  [Segments.BODY]: Joi.object({
    profCodeIds: Joi.array()
      .items(
        Joi.string().hex().length(24).messages({
          'string.hex': '❌ ID غير صالح',
          'string.length': '❌ ID غير صالح',
        })
      )
      .min(1)
      .required()
      .messages({
        'array.base': '❌ يجب إرسال مصفوفة من IDs',
        'array.min': '❌ يجب تحديد كود واحد على الأقل',
        'any.required': '❌ profCodeIds مطلوبة',
      }),
  }),
});
