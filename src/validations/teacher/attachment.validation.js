import { celebrate, Joi, Segments } from 'celebrate';

/* ----------------------------------
  Create Attachment Validation
----------------------------------- */
export const createAttachmentValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(150)
      .required()
      .messages({
        'string.base': '❌ عنوان الملف يجب أن يكون نص',
        'string.empty': '❌ عنوان الملف مطلوب',
        'string.min': '❌ عنوان الملف قصير جدًا',
        'string.max': '❌ عنوان الملف طويل جدًا',
        'any.required': '❌ عنوان الملف مطلوب',
      }),

    description: Joi.string()
      .trim()
      .max(150)
      .allow('')
      .messages({
        'string.base': '❌ وصف الملف يجب أن يكون نص',
        'string.max': '❌ وصف الملف طويل جدًا',
      }),

    fileType: Joi.string()
      .valid('pdf', 'doc', 'docx', 'image', 'xls', 'xlsx', 'csv')
      .default('pdf')
      .messages({
        'any.only': '❌ نوع الملف غير مدعوم',
      }),

    status: Joi.string()
      .valid('active', 'hidden', 'inactive')
      .default('active')
      .messages({
        'any.only': '❌ حالة الملف غير صحيحة',
      }),
  }),
});

/* ----------------------------------
  Get Attachments Validation
----------------------------------- */
export const getAttachmentsValidation = celebrate({
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
      .valid('active', 'hidden', 'inactive')
      .messages({
        'any.only': '❌ حالة الملف غير صحيحة',
      }),

    fileType: Joi.string()
      .valid('pdf', 'doc', 'docx', 'image', 'xls', 'xlsx', 'csv')
      .messages({
        'any.only': '❌ نوع الملف غير صحيح',
      }),
  }),
});
