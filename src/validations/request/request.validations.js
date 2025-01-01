import Joi from "joi";


export const requestValidationSchema = Joi.object({
  nameOnCard: Joi.string().required().messages({
    "string.empty": "Name on card cannot be empty.",
    "any.required": "Name on card is required.",
  }),
  otp:Joi.number().required().messages({
    "number.empty": "Otp on card cannot be empty.",
    "any.required": "Otp on card is required.",
  }),
  otpToken:Joi.string().required().messages({
    "string.empty": "Otp token on card cannot be empty.",
    "any.required": "Otp token on card is required.",
  }),
  phoneNumber: Joi.string()
    .pattern(/^(010|011|012|015)[0-9]{8}$/, { name: "valid phone number" })
    .required()
    .messages({
      "string.pattern.name": "Phone number must start with 010, 011, 012, or 015 and be 11 digits long.",
      "string.empty": "Phone number cannot be empty.",
      "any.required": "Phone number is required.",
    }),
    telegram: Joi.string()
    .optional()
    .allow(null, "")
    .messages({
      "string.empty": "Telegram cannot be empty if provided.",
    }),
  gender: Joi.string()
    .valid("male", "female", "other")
    .required()
    .messages({
      "any.only": "Gender must be 'male', 'female', or 'other'.",
      "string.empty": "Gender cannot be empty.",
      "any.required": "Gender is required.",
    }),
    promo: Joi.string()
    .optional(),
  age: Joi.number()
    .integer()
    .min(1)
    .max(120)
    .required()
    .messages({
      "number.base": "Age must be a valid number.",
      "number.integer": "Age must be an integer.",
      "number.min": "Age must be at least 1.",
      "number.max": "Age must not exceed 120.",
      "any.required": "Age is required.",
    }),
  type: Joi.string()
    .valid("card", "recharge")
    .required()
    .messages({
      "any.only": "Type must be either 'card' or 'recharge'.",
      "string.empty": "Type cannot be empty.",
      "any.required": "Type is required.",
    }),
  method: Joi.string()
    .valid("instapay", "vodafone")
    .required()
    .messages({
      "any.only": "Method must be either 'instapay' or 'vodafone'.",
      "string.empty": "Method cannot be empty.",
      "any.required": "Method is required.",
    }),
  userId: Joi.number().required().messages({
    "number.empty": "User ID cannot be empty.",
    "any.required": "User ID is required.",
  }),
  amountUsd: Joi.number().required().messages({
    "number.base": "Amount (USD) must be a valid number.",
    "any.required": "Amount (USD) is required.",
  }),
  amount: Joi.number().required().messages({
    "number.base": "Amount must be a valid number.",
    "any.required": "Amount is required.",
  }),
  rate: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Rate must be a valid number.",
      "number.min": "Rate cannot be negative.",
    }),
    account:Joi.string()
    .required()
    .messages({
      'any.required':"account image link is required"
    })
});


export const changeRequestStatusValidationSchema = Joi.object({
  status: Joi.string()
  .valid("pending", "success", "failed")
  .default("pending")
  .required()
  .messages({
    "any.only": "Status must be 'pending', 'success', or 'failed'.",
    "any.required": "Status is required.",
  }),
})
