import Joi from "joi";

export const categoriesRequest = Joi.object({
  name_en: Joi.string()
    .required()
    .messages({
      'any.required': 'Name is required'
    }),
  name_ar: Joi.string()
    .required()
    .messages({
      'any.required': 'Name is required'
    }),
  slug: Joi.string()
    .required()
    .messages({
      'any.required': 'Slug is required'
    }),
  description_en: Joi.string().optional(),
  description_ar: Joi.string().optional(),
  status: Joi.string().optional(),
  parent_id: Joi.string().optional(),
  cover_image: Joi.string().optional(),
  banner_image: Joi.string().optional()
});