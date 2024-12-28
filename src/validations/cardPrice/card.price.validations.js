import Joi from "joi";

export const cardPriceAddingValidationSchema = Joi.object({
  cardName: Joi.string().required().messages({
    "string.empty": "Card name is required and cannot be empty.",
    "any.required": "Card name is a mandatory field.",
  }),
  cardPrice: Joi.number().required().messages({
    "number.base": "Card price must be a valid number.",
    "any.required": "Card price is required.",
  }),
  addedBy: Joi.number().required().messages({
    "number.empty": "Added by is required. Please ensure the token is passed.",
    "any.required": "Added by is a mandatory field.",
  }),
});


export const cardPriceUpdateValidationSchema = Joi.object({
  cardName: Joi.string().optional().messages({
    "string.empty": "Card name cannot be empty.",
  }),
  cardPrice: Joi.number().optional().messages({
    "number.base": "Card price must be a valid number.",
  }),
  addedBy: Joi.number().optional().messages({
    "number.empty": "Added by cannot be empty.",
  }),
}).min(1).messages({
  "object.min":"At least one field must be updated"
})
