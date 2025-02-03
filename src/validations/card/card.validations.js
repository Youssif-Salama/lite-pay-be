import Joi from "joi";
/*
  * card new schema
*/
export const cardValidationSchema = Joi.object({
  bankId: Joi.string().required().messages({
    "string.empty":"bankId cannot be empty"
  }),
  requestId: Joi.string().required().messages({
    "string.empty":"requestId cannot be empty"
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
  type: Joi.string().optional(),
  cardBalance: Joi.number().min(0).required().messages({
    "string.empty":"balance cannot be empty"
  }),
  expiryDate:Joi.string().required().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).messages({
    "string.empty":"expiryDate cannot be empty",
    "string.pattern":"expiryDate must be in MM/YY format"
  })
});



export const cardValidationSchemaPut = Joi.object({
  requestId: Joi.string().optional().messages({
    "string.empty": "requestId cannot be empty"
  }),
  cardNumber: Joi.string().min(16).max(16).optional().messages({
    "string.empty": "cardNumber cannot be empty",
    "string.string": "cardNumber must be text",
    "string.max": "cardNumber cannot be more than 16 characters",
    "string.min": "cardNumber cannot be less than 16 characters"
  }),
  cvv: Joi.string().min(3).max(3).optional().messages({
    "string.empty": "cvv cannot be empty",
    "string.string": "cvv must be text",
    "string.max": "cvv cannot be more than 3 characters",
    "string.min": "cvv cannot be less than 3 characters"
  }),
  type: Joi.string().optional(),
  balance: Joi.number().min(0).optional().messages({
    "string.empty": "balance cannot be empty"
  }),
  expiryDate: Joi.string()
    .optional()
    .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .messages({
      "string.empty": "expiryDate cannot be empty",
      "string.pattern": "expiryDate must be in MM/YY format"
    })
});
