import Joi from "joi";

export const contentRequest = Joi.object({
  title_en: Joi.string().required().messages({
    'any.required': 'English Title is required'
  }),
  description_en: Joi.string().optional(),
  title_ar: Joi.string().required().messages({
    'any.required': 'Arabic Title is required'
  }),
  coach_name_en: Joi.string().optional(),
  coach_name_ar: Joi.string().optional(),
  description_ar: Joi.string().optional(),
  category_id: Joi.string().required().messages({
    'any.required': 'Category ID is required'
  }),
  subcategory_id: Joi.string().optional(),
  cover_image: Joi.string().required().messages({
    'any.required': 'Cover Image is required'   
  }),
  file_url: Joi.string().required().messages({
    'any.required': 'File URL is required'
  }),
  file_type: Joi.string().required().messages({
    'any.required': 'File Type is required'
  }),
  upload_method: Joi.string().required().messages({
    'any.required': 'Upload Method is required'
  }),
  video_length: Joi.string().pattern(/^([0-9]{1,2}):([0-9]{1,2})$/).optional(),
  status: Joi.string().optional(),
  slug: Joi.string().optional(),
  number_of_pages: Joi.string().optional()
});
export const contentUpdateRequest = Joi.object({
  title_en: Joi.string().optional(),
  description_en: Joi.string().optional(),
  title_ar:Joi.string().optional(),
  description_ar: Joi.string().optional(),
  category_id: Joi.string().optional(),
  subcategory_id: Joi.string().optional(),
  cover_image: Joi.string().optional(),
  file_url: Joi.string().optional(),
  file_type: Joi.string().optional(),
  upload_method: Joi.string().optional(),
  video_length: Joi.string().pattern(/^([0-9]{1,2}):([0-9]{1,2})$/).optional(),
  status: Joi.string().optional(),
  slug: Joi.string().optional(),
  number_of_pages: Joi.string().optional(),
  coach_name_en: Joi.string().optional(),
  coach_name_ar: Joi.string().optional(),
  is_featured: Joi.date().iso().allow(null).optional()
});


