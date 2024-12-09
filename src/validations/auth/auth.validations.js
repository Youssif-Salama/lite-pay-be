import joi from "joi";

export const signupValidationSchema=joi.object({
  "email":joi.string().email().required()
  .messages({
    "string.empty":"email must not be empty",
    "any.required":"email is required",
    "string.email":"Invalid email format"
  }),
  "password":joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/).required()
  .messages({
    "string.empty":"password must not be empty",
    "any.required":"password is required",
    "string.pattern":"password must be at least 8 characters long contains upper and lower case and special chars"
  })
})