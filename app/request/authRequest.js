import Joi from "joi";

/**
 * This file exports a number of Joi validation schemas for the AuthController.
 * Each schema is an object that specifies the rules for validating a particular
 * type of request. The rules are specified using the Joi API, which provides
 * a number of methods for specifying validation rules.
 */

/**
 * The registerRequest schema specifies the rules for validating a registration
 * request. The request must contain the following fields:
 * - email: a string that must be a valid email address
 * - password: a string that must be at least 8 characters long, and must
 *   include at least one uppercase letter, one lowercase letter, one number,
 *   and one special character.
 * - first_name: a string that must not be empty
 * - last_name: a string that must not be empty
 */
export const registerRequest = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email address is not valid',
      'any.required': 'Email address is required'
    }),
  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
  first_name: Joi.string()
    .required()
    .messages({
      'any.required': 'First name is required'
    }),
  last_name: Joi.string()
    .required()
    .messages({
      'any.required': 'Last name is required'
    }),
  role: Joi.string().optional()
});

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
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email address is not valid',
      'any.required': 'Email address is required'
    }),
  password: Joi.string()
    .required()
    .messages({ 'any.required': 'Password is required' }),
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    })
});

/**
 * The forgotPasswordRequest schema specifies the rules for validating a
 * forgot password request. The request must contain the following fields:
 * - email: a string that must be a valid email address
 * - role: a string that must not be empty
 */
export const forgotPasswordRequest = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email address is not valid',
      'any.required': 'Email address is required'
    }),
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    })
});

/**
 * The checkResetTokenRequest schema specifies the rules for validating a
 * check reset token request. The request must contain the following fields:
 * - forgot_password_code: a string that must not be empty
 * - role: a string that must not be empty
 */
export const checkResetTokenRequest = Joi.object({
  forgot_password_code: Joi.string()
    .required()
    .messages({
      'any.required': 'Forgot password code is required'
    }),
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    })
})

/**
 * The resetPasswordRequest schema specifies the rules for validating a
 * reset password request. The request must contain the following fields:
 * - forgot_password_code: a string that must not be empty
 * - password: a string that must be at least 8 characters long, and must
 *   include at least one uppercase letter, one lowercase letter, one number,
 *   and one special character.
 * - role: a string that must not be empty
 */
export const resetPasswordRequest = Joi.object({
  forgot_password_code: Joi.string()
    .required()
    .messages({
      'any.required': 'Forgot password code is required'
    }),
  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .required()
    .messages({
      'any.required': 'Role is required'
    })
});

/**
 * The changePasswordRequest schema specifies the rules for validating a
 * change password request. The request must contain the following fields:
 * - old_password: a string that must be at least 8 characters long, and must
 *   include at least one uppercase letter, one lowercase letter, one number,
 *   and one special character.
 * - password: a string that must be at least 8 characters long, and must
 *   include at least one uppercase letter, one lowercase letter, one number,
 *   and one special character.
 */
export const changePasswordRequest = Joi.object({
  old_password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    })
})
export const userRequest = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    }),
})
export const changeUserPasswordRequest = Joi.object({
  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    })
})
