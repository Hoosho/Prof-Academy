// /src/validations/student/student.validation.js
import { Joi, celebrate, Segments } from "celebrate";

export const chargeWalletValidation = celebrate({
  [Segments.BODY]: Joi.object({
    profCode: Joi.string()
      .trim()
      .uppercase()
      .min(6)
      .max(50)
      .required()
      .messages({
        'string.base': '❌ كود الشحن يجب أن يكون نص',
        'string.empty': '❌ كود الشحن مطلوب',
        'string.min': '❌ كود الشحن قصير جدًا',
        'string.max': '❌ كود الشحن طويل جدًا',
        'any.required': '❌ كود الشحن مطلوب',
      }),
  }),
});

// Custom ObjectId validator
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("❌ monthId غير صالح");
  }
  return value;
};

// Student Buy Month Validation
export const buyMonthValidation = celebrate({
  [Segments.BODY]: Joi.object({
    monthId: Joi.string()
      .trim()
      .required()
      .custom(objectId)
      .messages({
        "string.base": "❌ معرف الشهر يجب أن يكون نص",
        "string.empty": "❌ معرف الشهر مطلوب",
        "any.required": "❌ معرف الشهر مطلوب",
      }),
  }),
});