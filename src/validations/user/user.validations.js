import Joi from "joi";

export const updateUserValidationSchema = Joi.object({
  "email":Joi.string().email().optional()
  .messages({
    "string.empty":"email must not be empty",
    "string.email":"Invalid email format"
  }),
  "age":Joi.string().optional(),
  "gender":Joi.string().optional().valid("male", "female", "other"),
  "phoneNumber":Joi.string().optional(),
  "telegram":Joi.string().optional(),
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
});

export const changeUserRoleSchema=Joi.object({
  roleId:Joi.string()
  .required()
  .messages({
    "string.empty":"roleId shouldn't be empty",
    "any.required":"roleId is required"
  })
  ,userId:Joi.string()
  .required()
  .messages({
    "string.empty":"roleId shouldn't be empty",
    "any.required":"roleId is required"
  })
})

export const addUserRatingSchema=Joi.object({
  ratingValue:Joi.number()
  .required()
  .messages({
    "number.empty":"roleId shouldn't be empty",
    "any.required":"roleId is required"
  })
  ,userId:Joi.string()
  .required()
  .messages({
    "string.empty":"roleId shouldn't be empty",
    "any.required":"roleId is required"
  })
})


export const changeRoleAutoSchema=Joi.object({
  userId:Joi.string()
  .required()
  .messages({
    "string.empty":"roleId shouldn't be empty",
    "any.required":"roleId is required"
  })
})