import { celebrate, Joi, Segments } from 'celebrate';

/* ----------------------------------
  Create Exam Validation
----------------------------------- */
export const createExamValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(150)
      .required()
      .messages({
        'string.base': '❌ عنوان الاختبار يجب أن يكون نص',
        'string.empty': '❌ عنوان الاختبار مطلوب',
        'string.min': '❌ عنوان الاختبار قصير جدًا',
        'string.max': '❌ عنوان الاختبار طويل جدًا',
        'any.required': '❌ عنوان الاختبار مطلوب',
      }),

    grade: Joi.string()
      .valid(
        'First Preparatory',
        'Second Preparatory',
        'Third Preparatory',
        'First Secondary',
        'Second Secondary',
        'Third Secondary'
      )
      .required()
      .messages({
        'any.only': '❌ الصف غير صحيح',
        'any.required': '❌ الصف مطلوب',
      }),

    status: Joi.string()
      .valid('active', 'inactive')
      .required()
      .messages({
        'any.only': '❌ حالة الاختبار يجب أن تكون active أو inactive',
        'any.required': '❌ حالة الاختبار مطلوبة',
      }),

    durationMinutes: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': '❌ مدة الاختبار يجب أن تكون رقم',
        'number.min': '❌ مدة الاختبار لا يمكن أن تقل عن دقيقة واحدة',
        'any.required': '❌ مدة الاختبار مطلوبة',
      }),

    totalMarks: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': '❌ مجموع الدرجات يجب أن يكون رقم',
        'number.min': '❌ مجموع الدرجات يجب أن يكون أكبر من صفر',
        'any.required': '❌ مجموع الدرجات مطلوب',
      }),

    questions: Joi.array()
      .items(
        Joi.object({
          text: Joi.string()
            .trim()
            .min(3)
            .max(300)
            .required()
            .messages({
              'string.base': '❌ نص السؤال يجب أن يكون نص',
              'string.empty': '❌ نص السؤال مطلوب',
              'string.min': '❌ نص السؤال قصير جدًا',
              'string.max': '❌ نص السؤال طويل جدًا',
              'any.required': '❌ نص السؤال مطلوب',
            }),
          type: Joi.string()
            .valid('mcq') // دلوقتي MCQ only
            .required()
            .messages({
              'any.only': '❌ نوع السؤال غير مدعوم',
              'any.required': '❌ نوع السؤال مطلوب',
            }),
          options: Joi.array()
            .items(Joi.string().trim().required())
            .length(4)
            .required()
            .messages({
              'array.base': '❌ خيارات السؤال يجب أن تكون مصفوفة',
              'array.length': '❌ السؤال يجب أن يحتوي على 4 خيارات',
              'any.required': '❌ خيارات السؤال مطلوبة',
            }),
          correctIndex: Joi.number()
            .integer()
            .min(0)
            .max(3)
            .required()
            .messages({
              'number.base': '❌ المؤشر الصحيح يجب أن يكون رقم',
              'number.min': '❌ المؤشر الصحيح غير صالح',
              'number.max': '❌ المؤشر الصحيح غير صالح',
              'any.required': '❌ المؤشر الصحيح مطلوب',
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.base': '❌ يجب أن يحتوي الاختبار على أسئلة',
        'array.min': '❌ يجب أن يحتوي الاختبار على سؤال واحد على الأقل',
        'any.required': '❌ الأسئلة مطلوبة',
      }),
  }),
});

/* ----------------------------------
  Get Exams Validation (Query)
----------------------------------- */
export const getExamsValidation = celebrate({
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
        'number.base': '❌ الحد الأقصى للصفحة يجب أن يكون رقم',
        'number.min': '❌ الحد الأدنى للصفحة 1',
        'number.max': '❌ الحد الأقصى للصفحة 100',
      }),

    status: Joi.string()
      .valid('active', 'inactive')
      .messages({
        'any.only': '❌ حالة الاختبارات غير صحيحة',
      }),

    search: Joi.string()
      .trim()
      .allow('')
      .messages({
        'string.base': '❌ البحث يجب أن يكون نص',
      }),
  }),
});