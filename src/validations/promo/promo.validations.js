import Joi from "joi";

export const addPromoValidationSchema = Joi.object({
  promo: Joi.string().required().messages({
    "string.empty": "Promo name is required",
  }),
  type: Joi.string().valid("total", "card").default("total").messages({
    "any.only": "Type must be either 'total' or 'card'.",
  }),
  max: Joi.number().min(0).required().messages({
    "number.base": "Max value must be a number",
    "any.required": "Max value is required",
    "number.min": "Max value cannot be negative",
  }),
  percent: Joi.number().min(0).max(100).required().messages({
    "number.base": "Percent must be a number",
    "any.required": "Percent value is required",
    "number.min": "Percent cannot be negative",
    "number.max": "Percent cannot be greater than 100",
  }),
  addedBy: Joi.number().required().messages({
    "number.empty": "AddedBy field is required",
  }),
});


export const updatePromoValidationSchema = Joi.object({
  promo: Joi.string().optional().messages({
    "string.empty": "Promo name cannot be empty",
  }),
  type: Joi.string().valid("total", "card").optional().messages({
    "any.only": "Type must be either 'total' or 'card'.",
  }),
  max: Joi.number().min(0).optional().messages({
    "number.base": "Max value must be a number",
    "number.min": "Max value cannot be negative",
  }),
  percent: Joi.number().min(0).max(100).optional().messages({
    "number.base": "Percent must be a number",
    "number.min": "Percent cannot be negative",
    "number.max": "Percent cannot be greater than 100",
  }),
  addedBy: Joi.number().optional().messages({
    "number.empty": "AddedBy field cannot be empty",
  }),
});
