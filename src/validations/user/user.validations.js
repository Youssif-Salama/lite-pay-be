import Joi from "joi";

export const updateUserValidationSchema = Joi.object({
  "email":Joi.string().email().optional()
  .messages({
    "string.empty":"email must not be empty",
    "string.email":"Invalid email format"
  }),
  "username":Joi.string().optional()
  .messages({
    "string.empty":"username must not be empty",
  }),
  "password":Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/).optional()
  .messages({
    "string.empty":"password must not be empty",
    "string.pattern":"password must be at least 8 characters long contains upper and lower case and special chars"
  })
}).min(1).messages({
  "object.min":"At least one field must be updated"
})