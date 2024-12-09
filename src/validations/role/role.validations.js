import Joi from 'joi';

export const createRoleValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'string.empty': 'Role name is required',
    }),
  type: Joi.string()
    .valid('user', 'vip', 'staff', 'manager', 'owner')
    .default('user')
    .messages({
      'any.only': 'Role type must be one of: user, vip, staff, manager, owner',
    }),
  level: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Level must be a number',
      'any.required': 'Level is required',
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'deleted')
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, inactive, deleted',
    }),
});


export const updateRoleValidationSchema = Joi.object({
  name: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Role name cannot be empty',
    }),
  type: Joi.string()
    .valid('user', 'vip', 'staff', 'manager', 'owner')
    .optional()
    .messages({
      'any.only': 'Role type must be one of: user, vip, staff, manager, owner',
    }),
  level: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.base': 'Level must be a number',
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'deleted')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, inactive, deleted',
    }),
});