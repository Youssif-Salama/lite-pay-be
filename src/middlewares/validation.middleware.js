/**
 * Validate a request body against a given schema.
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against.
 * @returns {import('express').RequestHandler} - An Express middleware function.
 * @throws {Error} - 400 Bad Request, with an error message describing the validation errors.
 */
export const validate = (schema) => {
  return (req, res, next) => {
      try {
          const values = req.body;
          const { error } = schema.validate(values, { abortEarly: false });
          if (error) {
              const errorMessage = error.details.map(detail => detail.message).join(', ');
              throw new Error(errorMessage);
          }
          next();
      } catch (error) {
          res.status(400).json({ message: error.message });
      }
  };
};