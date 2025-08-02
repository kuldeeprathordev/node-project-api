/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
import { Op, fn, col, where, literal } from 'sequelize'; // Import the Op module for SQL operations
import { User, UserToken, Category, CategoryTranslation } from "../../models/index.js"; // Import database models
import { BadRequest, NotAuthorizedError, ValidationError } from "../../../utils/errors.js"; // Import error handling functions
import {
  trimObject, // Import a function to remove unnecessary spaces from an object
  lowerCaseString, // Import a function to convert a string to lowercase
  passwordEncryption, // Import a function to encrypt a password
  verifyPassword, // Import a function to verify a password
  setError // Import a function to format error messages
} from "../../../utils/utils.js";
import {
  categoriesRequest,
} from "../../request/categoryRequest.js"; // Import validation schemas
import eventBus from "../../../config/eventBus.js"; // Import the event bus
import Debug from 'debug'; // Import the debug module
import { StringHelper } from 'node-simplify';

const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger
import sequelize from '../../../config/database.js';

/**
 * Display a listing of the resource.
 */
async function index(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const parent_id = req.query.parent_id;
    const lang = req.query.lang || 'en';
    const search = req.query.search || '';

    const offset = (page - 1) * limit;

    const whereClause = {};

    if (parent_id === undefined || parent_id === 'null') {
      whereClause.parent_id = null;
    } else if (parent_id) {
      whereClause.parent_id = parent_id;
    }

    const includeWhere = {
      lang: ['en', 'ar'],
    };

    if (search) {
      includeWhere.name = where(
        fn('LOWER', col('translations.name')),
        {
          [Op.like]: `%${search.toLowerCase()}%`
        }
      );
    }

    const rows = await Category.findAll({
      include: [
        {
          model: CategoryTranslation,
          as: 'translations',
          where: includeWhere,
          attributes: ['lang', 'name', 'description'],
          // required: false
        }
      ],
      where: whereClause,
      offset,
      limit,
      order: [['id', 'DESC']], // or ['id', 'DESC'] if created_at is missing
    });

    const count = await Category.count({
      where: whereClause,
      include: [
        {
          model: CategoryTranslation,
          as: 'translations',
          where: includeWhere,
          attributes: [], // No attributes needed for count
          // required: false
        }
      ],
      distinct: true, // Ensure distinct categories are counted
    });

    return res.status(200).json({
      ack: true,
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
      message: 'Category list fetched successfully',
    });

  } catch (e) {
    console.error(`Category listing error: ${e.message}`);
    return res.status(e.status || 500).json({
      ack: false,
      message: e.message || 'Internal Server Error',
    });
  }
}




/**
 * Store a newly created resource in storage.
 */
async function store(req, res) {
  const t = await sequelize.transaction();  // Start transaction

  try {
    debugLog('category request');

    const payload = trimObject(req.body);
    payload.slug = StringHelper.generateSlug(payload.name_en);

    const validated = categoriesRequest.validate(payload, { abortEarly: false });
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      throw new ValidationError(validated.error.details, true);
    }
    const requestData = validated.value;
    

    // Check duplicate Arabic name inside transaction for consistency
    const existingArabic = await CategoryTranslation.findOne({
      where: {
        name: requestData.name_ar,
        lang: 'ar',
      },
      transaction: t
    });
    if (existingArabic) {
      errorLog(`Category name already exists: ${requestData.name_ar}`);
      if (requestData.parent_id) {
        throw new BadRequest(req.t('auth.subcategoryArabicNameExist'));
      } else {
        throw new BadRequest(req.t('auth.categoryArabicNameExist'));
      }
    }

    // Check duplicate English name inside transaction for consistency
    const existingEnglish = await CategoryTranslation.findOne({
      where: {
        name: requestData.name_en,
        lang: 'en',
      },
      transaction: t
    });
    if (existingEnglish) {
      errorLog(`Category name already exists: ${requestData.name_en}`);
      if (requestData.parent_id) {
        throw new BadRequest(req.t('auth.subcategoryEnglishNameExist'));
      } else {
        throw new BadRequest(req.t('auth.categoryEnglishNameExist'));
      }
    }

    // Check duplicate slug inside transaction for consistency
    const existing = await Category.findOne({ where: { slug: requestData.slug }, transaction: t });
    if (existing) {
      errorLog(`Category slug already exists: ${requestData.slug}`);
      if (requestData.parent_id) {
        throw new BadRequest('subcategory already exist');
      } else {
        throw new BadRequest('category already exist');
      }
    }

    // Create category inside transaction
    const category = await Category.create({
      slug: requestData.slug,
      parent_id: requestData.parent_id || null,
      status: requestData.status || 'active',
      cover_image: requestData.cover_image || null ,
      banner_image: requestData.banner_image || null
    }, { transaction: t });

    // Create translations inside transaction
    const translations = await CategoryTranslation.bulkCreate([
      {
        category_id: category.id,
        lang: 'en',
        name: requestData.name_en,
        description: requestData.description_en || null
      },
      {
        category_id: category.id,
        lang: 'ar',
        name: requestData.name_ar,
        description: requestData.description_ar || null
      }
    ], { transaction: t });

    // Ensure both translations created
    if (!translations || translations.length !== 2) {
      throw new Error('Failed to create category translations');
    }

    // Commit the transaction only after all are successful
    await t.commit();

    return res.status(200).send({
      ack: true,
      data: category,
      message: 'Category created successfully'
    });

  } catch (e) {
    // Rollback on error so no partial data persists
    await t.rollback();

    errorLog(`Category creation error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}



/**
 * Display the specified resource.
 */
async function show(req, res) {
  try {
    const id = req.params.id;
    return res.status(200).send({
      ack: true,
      data: {},
      message: 'details of resource'
    });
  } catch (e) {
    // If an error occurs during user registration
    // This catch block handles any errors that occur during user registration.
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
  }
}

// Update category by ID
async function update(req, res) {
  try {
    // Find the category by slug
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    if (!category) {
      return res.status(404).json({ ack: false, message: 'Category not found' });
    }

    const payload = trimObject(req.body);

    // Regenerate slug if name_en is updated
    if (payload.name_en) {
      const newSlug = StringHelper.generateSlug(payload.name_en);

      const existing = await Category.findOne({
        where: {
          slug: newSlug,
          id: { [Op.ne]: category.id }
        }
      });

      if (existing) {
        return res.status(400).json({
          ack: false,
          message: 'Slug already exists for another category'
        });
      }

      payload.slug = newSlug;
    }

    // Validate input
    const validated = categoriesRequest.validate(payload, { abortEarly: false });
    if (validated.error) {
      return res.status(422).json({
        ack: false,
        message: validated.error.details.map(err => err.message).join(', ')
      });
    }

    const requestData = validated.value;

    // Check for duplicate English name (excluding current category)
    const existingEnglish = await CategoryTranslation.findOne({
      where: {
        name: requestData.name_en,
        lang: 'en',
        category_id: { [Op.ne]: category.id }
      }
    });
    if (existingEnglish) {
      errorLog(`Category name already exists: ${requestData.name_en}`);
      if (requestData.parent_id) {
        return res.status(400).json({
          ack: false,
          message: 'Subcategory English name already exist'
        });
      } else {
        return res.status(400).json({
          ack: false,
          message: 'Category English name already exist'
        });
      }
    }

    // Check for duplicate Arabic name (excluding current category)
    const existingArabic = await CategoryTranslation.findOne({
      where: {
        name: requestData.name_ar,
        lang: 'ar',
        category_id: { [Op.ne]: category.id }
      }
    });
    if (existingArabic) {
      errorLog(`Category name already exists: ${requestData.name_ar}`);
      if (requestData.parent_id) {
        return res.status(400).json({
          ack: false,
          message: 'Subcategory Arabic name already exist'
        });
      } else {
        return res.status(400).json({
          ack: false,
          message: 'Category Arabic name already exist'
        });
      }
    }

    // Update category table
    await category.update({
      slug: payload.slug || category.slug,
      parent_id: requestData.parent_id ?? category.parent_id,
      status: requestData.status ?? category.status,
      cover_image: requestData.cover_image ?? category.cover_image,
      banner_image: requestData.banner_image ?? category.banner_image
    });

    // Update English translation
    await CategoryTranslation.update({
      name: requestData.name_en,
      description: requestData.description_en || null,
    }, {
      where: {
        category_id: category.id,
        lang: 'en'
      }
    });

    // Update Arabic translation
    await CategoryTranslation.update({
      name: requestData.name_ar,
      description: requestData.description_ar || null,
    }, {
      where: {
        category_id: category.id,
        lang: 'ar'
      }
    });

    return res.status(200).json({
      ack: true,
      data: category,
      message: 'Category updated successfully'
    });

  } catch (e) {
    errorLog(`Category update error: ${e.message}`);
    return res.status(500).json({ ack: false, message: setError(e) });
  }
}



/**
 * Remove the specified resource from storage.
 */
async function destroy(req, res) {
  try {
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    if (!category) {
      return res.status(404).json({ ack: false, message: 'Category not found' });
    }

    // Delete associated translations
    await CategoryTranslation.destroy({
      where: { category_id: category.id }
    });

    // Delete the main category
    await category.destroy();

    return res.json({ ack: true, message: 'Category deleted successfully' });
  } catch (e) {
    return res.status(500).json({ ack: false, message: e.message });
  }
}
async function changeStatus(req, res) {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        ack: false,
        message: 'Invalid status. Allowed values are "active" or "inactive".',
      });
    }

    const category = await Category.findOne({ where: { slug } });
    if (!category) {
      return res.status(404).json({ ack: false, message: 'Category not found' });
    }

    await category.update({ status });

    return res.json({
      ack: true,
      data: category,
      message: `Category status updated to ${status}`,
    });

  } catch (e) {
    return res.status(500).json({ ack: false, message: e.message });
  }
}


export {
  index,
  store,
  show,
  update,
  destroy,
  changeStatus
}
