/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { Op } from 'sequelize'; // Import the Op module for SQL operations
import { content, videoViews, pdfDownload, ContentTranslation, Category, CategoryTranslation, LandingPage } from "../../../models/index.js"; // Import database models
import sequelize from '../../../../config/database.js'; // Import sequelize instance
import {
  setError // Import a function to format error messages
} from "../../../../utils/utils.js";
import Debug from 'debug'; // Import the debug module

const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger

/**
 * Display a listing of the resource.
 */

async function index(req, res) {
  try {
    const subCategoryId = req.params.id;
    const fileTypes = req.query.file_type
      ? Array.isArray(req.query.file_type)
        ? req.query.file_type
        : [req.query.file_type]
      : null;

    const acceptLanguage = req.headers['accept-language'] || 'en';

    let whereCondition = {
      status: 'active'
    };

    const isFeatured = req.query.is_featured;

    if (subCategoryId !== undefined && subCategoryId !== 'null') {
      whereCondition.subcategory_id = subCategoryId;
    }

    if (fileTypes && fileTypes.length > 0) {
      whereCondition.file_type = {
        [Op.in]: fileTypes
      };
    }

    if (isFeatured == 'true') {
      whereCondition.is_featured = { [Op.ne]: null };
    }

    const contents = await content.findAll({
      where: whereCondition,
      include: [
        {
          model: ContentTranslation,
          as: 'content_translations',
          where: {
            lang: {
              [Op.in]: ['en', 'ar']
            }
          },
          required: false
        },
        {
          model: Category,
          as: 'category',
          where: { status: 'active' }, // Ensure main category is active
          include: [
            {
              model: CategoryTranslation,
              as: 'translations',
              where: {
                lang: {
                  [Op.in]: ['en', 'ar']
                }
              },
              required: false
            }
          ]
        },
        {
          model: Category,
          as: 'subcategory',
          where: { status: 'active' }, // Ensure subcategory is active
          include: [
            {
              model: CategoryTranslation,
              as: 'translations',
              where: {
                lang: {
                  [Op.in]: ['en', 'ar']
                }
              },
              required: false
            }
          ]
        }
      ],
      order: [
        [sequelize.literal('CASE WHEN is_featured IS NOT NULL THEN 0 ELSE 1 END'), 'asc'],
        ['is_featured', 'desc'],
        ['id', 'desc']
      ]
    });

    const formattedContents = [];

    for (const item of contents) {
      const englishContentTranslation = item.content_translations.find(t => t.lang === 'en');
      const arabicContentTranslation = item.content_translations.find(t => t.lang === 'ar');

      let title = englishContentTranslation ? englishContentTranslation.title : item.title;
      let description = englishContentTranslation ? englishContentTranslation.description : item.description;
      let contentBody = englishContentTranslation ? englishContentTranslation.content : item.content;
      let coach_name = englishContentTranslation ? englishContentTranslation.coach_name : item.coach_name;

      if (acceptLanguage.includes('ar') && arabicContentTranslation) {
        title = arabicContentTranslation.title;
        description = arabicContentTranslation.description;
        contentBody = arabicContentTranslation.content;
        coach_name = arabicContentTranslation.coach_name;
      }

      const englishCategoryTranslation = item.category?.translations?.find(t => t.lang === 'en');
      const arabicCategoryTranslation = item.category?.translations?.find(t => t.lang === 'ar');
      let categoryName = englishCategoryTranslation ? englishCategoryTranslation.name : item.category?.name;
      if (acceptLanguage.includes('ar') && arabicCategoryTranslation) {
        categoryName = arabicCategoryTranslation.name;
      }

      const englishSubcategoryTranslation = item.subcategory?.translations?.find(t => t.lang === 'en');
      const arabicSubcategoryTranslation = item.subcategory?.translations?.find(t => t.lang === 'ar');
      let subcategoryName = englishSubcategoryTranslation ? englishSubcategoryTranslation.name : item.subcategory?.name;
      if (acceptLanguage.includes('ar') && arabicSubcategoryTranslation) {
        subcategoryName = arabicSubcategoryTranslation.name;
      }

      const videoViewsCount = await videoViews.sum('click_count', {
        where: { video_id: item.id }
      });

      const pdfDownloadsCount = await pdfDownload.sum('click_count', {
        where: { content_id: item.id }
      });

      formattedContents.push({
        ...item.get({ plain: true }),
        title,
        description,
        content: contentBody,
        coach_name,
        created_at: item.createdAt.toISOString(),
        updated_at: item.updatedAt.toISOString(),
        category_name: categoryName,
        subcategory_name: subcategoryName,
        subcategory_banner_image: item.subcategory?.banner_image || null,
        total_video_views: videoViewsCount || 0,
        total_pdf_downloads: pdfDownloadsCount || 0,
        content_translations: undefined,
        category: undefined,
        subcategory: undefined
      });
    }

    // Always include category_name, subcategory_name, and subcategory_banner_image
    let categoryName = null;
    let subcategoryName = null;
    let subcategoryBannerImage = null;
    let categoryId = null;
    let subcategoryId = null;

    if (formattedContents.length > 0) {
      // Use the first content's info
      categoryName = formattedContents[0].category_name;
      subcategoryName = formattedContents[0].subcategory_name;
      subcategoryBannerImage = formattedContents[0].subcategory_banner_image;
      categoryId = formattedContents[0].category_id || (formattedContents[0].category ? formattedContents[0].category.id : null);
      subcategoryId = formattedContents[0].subcategory_id || (formattedContents[0].subcategory ? formattedContents[0].subcategory.id : null);
    } else if (subCategoryId && subCategoryId !== 'null') {
      // No content found, fetch subcategory and parent category
      const subcategory = await Category.findOne({
        where: { id: subCategoryId },
        include: [
          {
            model: CategoryTranslation,
            as: 'translations',
            where: { lang: { [Op.in]: ['en', 'ar'] } },
            required: false
          },
          {
            model: Category,
            as: 'parent',
            include: [
              {
                model: CategoryTranslation,
                as: 'translations',
                where: { lang: { [Op.in]: ['en', 'ar'] } },
                required: false
              }
            ],
            required: false
          }
        ]
      });
      if (subcategory) {
        // Get subcategory name
        const enSub = subcategory.translations?.find(t => t.lang === 'en');
        const arSub = subcategory.translations?.find(t => t.lang === 'ar');
        subcategoryName = acceptLanguage.includes('ar') && arSub ? arSub.name : (enSub ? enSub.name : subcategory.name);
        subcategoryBannerImage = subcategory.banner_image || null;
        subcategoryId = subcategory.id;
        // Get parent category name
        if (subcategory.parent) {
          const enCat = subcategory.parent.translations?.find(t => t.lang === 'en');
          const arCat = subcategory.parent.translations?.find(t => t.lang === 'ar');
          categoryName = acceptLanguage.includes('ar') && arCat ? arCat.name : (enCat ? enCat.name : subcategory.parent.name);
          categoryId = subcategory.parent.id;
        }
      }
    }

    return res.status(200).send({
      ack: true,
      data: formattedContents,
      category_name: categoryName,
      subcategory_name: subcategoryName,
      subcategory_banner_image: subcategoryBannerImage,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      message: 'List of resources'
    });
  } catch (e) {
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}




/**
 * Store a newly created resource in storage.
 */
async function store(req, res) {
  try {
    const requestData = req.body;

    return res.status(201).send({
      ack: true,
      data: requestData,
      message: 'list of resources'
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

/**
 * Display the specified resource.
 */
async function show(req, res) {
  try {
    const id = req.params.id;
    const acceptLanguage = req.headers['accept-language'] || 'en';

    // Fetch the content with only the requested language's translations
    const item = await content.findOne({
      where: { id },
      include: [
        {
          model: ContentTranslation,
          as: 'content_translations',
          where: { lang: acceptLanguage },
          required: false
        },
        {
          model: Category,
          as: 'category',
          include: [
            {
              model: CategoryTranslation,
              as: 'translations',
              where: { lang: acceptLanguage },
              required: false
            }
          ]
        },
        {
          model: Category,
          as: 'subcategory',
          include: [
            {
              model: CategoryTranslation,
              as: 'translations',
              where: { lang: acceptLanguage },
              required: false
            }
          ]
        }
      ]
    });

    if (!item) {
      return res.status(404).send({
        ack: false,
        message: 'Content not found'
      });
    }
    // Get video views and pdf downloads
    const videoViewsCount = await videoViews.sum('click_count', {
      where: { video_id: item.id }
    });
    const pdfDownloadsCount = await pdfDownload.sum('click_count', {
      where: { content_id: item.id }
    });

    const data = {
      item,
      total_video_views: videoViewsCount || 0,
      total_pdf_downloads: pdfDownloadsCount || 0
    };

    return res.status(200).send({
      ack: true,
      data,
      message: 'Content details fetched successfully'
    });
  } catch (e) {
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

/**
 * Update the specified resource in storage.
 */
async function update(req, res) {
  try {
    const id = req.params.id;
    const requestData = req.body;

    return res.status(200).send({
      ack: true,
      data: {},
      message: 'updated resource'
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

/**
 * Remove the specified resource from storage.
 */
async function destroy(req, res) {
  try {
    const id = req.params.id;

    return res.status(200).send({
      ack: true,
      data: {},
      message: 'Deleted resource'
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

async function categoryList(req, res) {
  try {
    const parent_id = req.query.parent_id;
    const acceptLanguage = req.query.lang || 'en';
    const search = req.query.search || '';

    const whereClause = {};
    let videoAlias = 'videos';
    let pdfAlias = 'pdfs';

    if (parent_id === undefined || parent_id === 'null') {
      whereClause.parent_id = null;
      whereClause.status = 'active';
    } else {
      whereClause.parent_id = parent_id;
      whereClause.status = 'active';
      videoAlias = 'sub_videos';
      pdfAlias = 'sub_pdfs';
    }

    const { rows, count } = await Category.findAndCountAll({
      where: whereClause,
      order: [['id', 'asc']],
      include: [
        {
          model: CategoryTranslation,
          as: 'translations',
          where: {
            lang: ['en', 'ar'],
            ...(search && {
              name: { [Op.iLike]: `%${search}%` },
            }),
          },
          attributes: ['lang', 'name', 'description'],
        },
        {
          model: content,
          as: videoAlias,
          where: { file_type: { [Op.ne]: 'pdf' }, status: 'active' },
          required: false,
          attributes: ['id', 'subcategory_id'],
          separate: true,
        },
        {
          model: content,
          as: pdfAlias,
          where: { file_type: 'pdf', status: 'active' },
          required: false,
          attributes: ['id', 'subcategory_id'],
          separate: true,
        },
        {
          model: Category,
          as: 'subcategories',
          where: { status: 'active' },
          required: false,
          attributes: ['id'],
          separate: true,
        },
        {
          model: Category,
          as: 'parent', // Assuming 'parent' association is defined in your model
          attributes: ['id', 'banner_image'],
          include: [
            {
              model: CategoryTranslation,
              as: 'translations',
              attributes: ['lang', 'name'],
              where: {
                lang: ['en', 'ar']
              },
              required: false
            }
          ],
          required: false
        }
      ]
    });

    const updatedRows = rows.map((category) => {
      const cat = category.toJSON();

      cat.video_count = cat[videoAlias]?.length || 0;
      cat.pdf_count = cat[pdfAlias]?.length || 0;
      cat.subcategory_count = cat.subcategories?.length || 0;

      cat.subcategory_id = cat[videoAlias]?.[0]?.subcategory_id || cat[pdfAlias]?.[0]?.subcategory_id || null;

      // Parent category fields
      cat.parent_cat_banner_image = cat.parent?.banner_image || null;

      // Set parent_cat_name_en and parent_cat_name_ar from translations
      const parentTranslations = cat.parent?.translations || [];
      cat.parent_cat_name_en = parentTranslations.find(t => t.lang === 'en')?.name || null;
      cat.parent_cat_name_ar = parentTranslations.find(t => t.lang === 'ar')?.name || null;

      // Remove extra nested fields
      delete cat.subcategories;
      delete cat.parent;

      return cat;
    });

    return res.status(200).json({
      ack: true,
      data: updatedRows,
      meta: {
        total: count
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

async function videoViewsCountAdd(req, res) {
  try {
    const { slug } = req.body;
    const userId = req.user.id; // Extracted from tokenAuth middleware

    if (!slug) {
      return res.status(400).json({ ack: false, message: 'Slug is required' });
    }

    // Find the video with the given slug and file_type not equal to 'pdf'
    const video = await content.findOne({
      where: {
        slug,
        file_type: { [Op.ne]: 'pdf' }
      }
    });

    if (!video) {
      return res.status(404).json({ ack: false, message: 'Video not found or is a PDF' });
    }

    // Check if the user has already viewed this video
    const existingView = await videoViews.findOne({
      where: {
        video_id: video.id,
        user_id: userId
      }
    });

    if (existingView) {
      // Increment click count
      existingView.click_count += 1;
      await existingView.save();
    } else {
      // Create new record with click_count = 1
      await videoViews.create({
        video_id: video.id,
        user_id: userId,
        click_count: 1
      });
    }

    return res.status(200).json({
      ack: true,
      message: 'Video view recorded successfully'
    });

  } catch (e) {
    console.error('videoViewsCountAdd error:', e.message);
    return res.status(500).json({
      ack: false,
      message: 'Internal Server Error'
    });
  }
}
async function pdfDownloadCountAdd(req, res) {
  try {
    const { slug } = req.body;
    const userId = req.user.id; // Extracted from tokenAuth middleware

    if (!slug) {
      return res.status(400).json({ ack: false, message: 'Slug is required' });
    }

    // Find the pdf with the given slug and file_type equal to 'pdf'
    const pdf = await content.findOne({
      where: {
        slug,
        file_type: 'pdf'
      }
    });

    if (!pdf) {
      return res.status(404).json({ ack: false, message: 'pdf not found' });
    }

    // Check if the user has already viewed this pdf
    const existingView = await pdfDownload.findOne({
      where: {
        content_id: pdf.id,
        user_id: userId
      }
    });

    if (existingView) {
      // Increment click count
      existingView.click_count += 1;
      await existingView.save();
    } else {
      // Create new record with click_count = 1
      await pdfDownload.create({
        content_id: pdf.id,
        user_id: userId,
        click_count: 1
      });
    }

    return res.status(200).json({
      ack: true,
      message: 'pdf view recorded successfully'
    });

  } catch (e) {
    console.error('pdfDownloadCountAdd error:', e.message);
    return res.status(500).json({
      ack: false,
      message: 'Internal Server Error'
    });
  }
}
async function landingBanner(req, res) {
  try {
    const banner = await LandingPage.findOne({ order: [['createdAt', 'DESC']] });

    return res.status(200).send({
      ack: true,
      data: banner,
      message: 'Latest landing page banner fetched successfully'
    });
  } catch (e) {
    console.error('landingBanner error:', e.message);
    return res.status(e.status || 500).send({
      ack: false,
      message: e.message || 'Internal Server Error'
    });
  }
}
export {
  index,
  store,
  show,
  update,
  destroy,
  videoViewsCountAdd,
  pdfDownloadCountAdd,
  categoryList,
  landingBanner
}
