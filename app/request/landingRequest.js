import Joi from "joi";

/**
 * Validation schema for creating a new landing page resource
 */
export const storeRequest = Joi.object({
  banner_image: Joi.string()
    .required()
    .messages({
      'any.required': 'Banner Image is required'
    })
});

/**
 * Validation schema for updating a landing page resource
 */
export const updateRequest = Joi.object({
    banner_image: Joi.string()
    .optional()
});
