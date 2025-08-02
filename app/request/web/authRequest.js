import Joi from "joi";

/**
 * The loginRequest schema specifies the rules for validating a login request.
 * The request must contain the following fields:
 * - email: a string that must be a valid email address
 * - password: a string that must be at least 8 characters long, and must
 *   include at least one uppercase letter, one lowercase letter, one number,
 *   and one special character.
 * - role: a string that must not be empty
 */
export const loginRequest = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Email address is not valid',
    }),
  password: Joi.string()
    .required()
    .messages({ 'any.required': 'Password is required' }),
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    })
}).or('email', 'username');

