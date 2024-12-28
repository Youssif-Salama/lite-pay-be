const Joi = require("joi");

/*
  * card new schema
*/
export const cardValidationSchema = Joi.object({
  bankId: Joi.string().required().messages({
    "string.empty":"bankId cannot be empty"
  }),
  cardNumber: Joi.string().min(16).max(16).required().messages({
    "string.empty":"cardNumber cannot be empty",
    "string.string":"cardNumber must be text",
    "string.max":"cardNumber cannot be more than 16 characters",
    "string.min":"cardNumber cannot be less than 16 characters"
  }),
  cvv: Joi.string().min(3).max(3).required().messages({
    "string.empty":"cvv cannot be empty",
    "string.string":"cvv must be text",
    "string.max":"cvv cannot be more than 3 characters",
    "string.min":"cvv cannot be less than 3 characters"
  }),
  name: Joi.string().required().messages({
    "string.empty":"name cannot be empty"
  }),
  type: Joi.string().optional(),
  userId: Joi.number().integer().positive().optional().messages({
    "string.empty":"userId cannot be empty"
  }),
  balance: Joi.number().precision(2).min(0).required().messages({
    "string.empty":"balance cannot be empty"
  })
});
