import Joi from "joi";

export const addRatingValidationSchema = Joi.object({
  title: Joi.string()
    .valid("instapay", "vodafone","norm","vip")
    .required()
    .messages({
      "string.empty": "Title is required",
      "any.only": "Title must be either 'instapay' or 'vodafone'.",
    }),
  value: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Value must be a number",
      "any.required": "Value is required",
      "number.min": "Value cannot be negative",
    }),
  addedBy: Joi.number()
    .required()
    .messages({
      "number.base": "AddedBy must be a number",
      "any.required": "AddedBy field is required",
    }),
});


export const updateRatingValidationSchema = Joi.object({
  title: Joi.string()
    .valid("instapay", "vodafone","norm","vip")
    .optional()
    .messages({
      "string.empty": "Title cannot be empty",
      "any.only": "Title must be either 'instapay' or 'vodafone'.",
    }),
  value: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Value must be a number",
      "number.min": "Value cannot be negative",
    }),
  addedBy: Joi.number()
    .optional()
    .messages({
      "number.base": "AddedBy must be a number",
    }),
}).min(1).message("At least one field must be updated");
