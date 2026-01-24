// /src/validations/student/student.validation.js
import { Joi, celebrate, Segments } from "celebrate";

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
        "string.base": "❌ الكود يجب أن يكون نص",
        "string.empty": "❌ الكود مطلوب",
        "any.required": "❌ الكود مطلوب",
      }),
  }),
});