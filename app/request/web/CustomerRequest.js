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
export const customerRequest = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Email address is not valid',
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required',
    }),
    description: Joi.string().optional()
});

