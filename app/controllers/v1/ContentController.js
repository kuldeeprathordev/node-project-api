/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
import { Op } from 'sequelize'; // Import the Op module for SQL operations
import { content, ContentTranslation, Category, CategoryTranslation, videoViews, pdfDownload } from "../../models/index.js"; // Import database models
import { BadRequest, ValidationError } from "../../../utils/errors.js"; // Import error handling functions
import {
  trimObject, // Import a function to remove unnecessary spaces from an object
  lowerCaseString, // Import a function to convert a string to lowercase
  setError // Import a function to format error messages
} from "../../../utils/utils.js";
import {
  contentRequest,
  contentUpdateRequest
} from "../../request/contentRequest.js"; // Import validation schemas
import eventBus from "../../../config/eventBus.js"; // Import the event bus
import Debug from 'debug'; // Import the debug module
import { StringHelper } from 'node-simplify';
import sequelize from '../../../config/database.js';

const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger

/**
 * Display a listing of the resource.
 */

async function index(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const lang = req.query.lang || 'en';
    const search = req.query.search || '';
    const fileType = req.query.file_type || null;

    const whereTranslation = {
      lang
    };

    // Only apply title search if provided
    if (search) {
      whereTranslation.title = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('content_translations.title')),
        {
          [Op.like]: `%${search.toLowerCase()}%`
        }
      );
    }
    const whereContent = {};
    if (fileType) {
      whereContent.file_type = fileType;
    }

    const { rows, count } = await content.findAndCountAll({
      where: whereContent,
      offset,
      limit,
      order: [['id', 'desc']],
      include: [
        {
          model: ContentTranslation,
          as: 'content_translations',
          where: whereTranslation,
          attributes: ['lang', 'title', 'description','coach_name'],
          required: true
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id'],
          include: [
            {
              model: CategoryTranslation,
              as: 'category_translations',
              where: { lang },
              attributes: ['name'],
              required: false
            }
          ]
        },
        {
          model: Category,
          as: 'subcategory',
          attributes: ['id'],
          include: [
            {
              model: CategoryTranslation,
              as: 'subcategory_translations',
              where: { lang },
              attributes: ['name'],
              required: false
            }
          ]
        }
      ],
      distinct: true
    });

    // Get video views and PDF downloads for each content
    const contentIds = rows.map(row => row.id);

    const videoViewsCounts = await videoViews.findAll({
      attributes: [
        'video_id',
        [sequelize.fn('SUM', sequelize.col('click_count')), 'total_views']
      ],
      where: {
        video_id: {
          [Op.in]: contentIds
        }
      },
      group: ['video_id']
    });

    const pdfDownloadCounts = await pdfDownload.findAll({
      attributes: [
        'content_id',
        [sequelize.fn('SUM', sequelize.col('click_count')), 'total_downloads']
      ],
      where: {
        content_id: {
          [Op.in]: contentIds
        }
      },
      group: ['content_id']
    });

    // Create lookup maps for quick access
    const videoViewsMap = videoViewsCounts.reduce((acc, curr) => {
      acc[curr.video_id] = parseInt(curr.getDataValue('total_views') || 0);
      return acc;
    }, {});

    const pdfDownloadsMap = pdfDownloadCounts.reduce((acc, curr) => {
      acc[curr.content_id] = parseInt(curr.getDataValue('total_downloads') || 0);
      return acc;
    }, {});

    // Format the response to include view and download counts
    const formattedRows = rows.map(row => {
      const rowData = row.toJSON();
      return {
        ...rowData,
        total_video_views: videoViewsMap[row.id] || 0,
        total_pdf_downloads: pdfDownloadsMap[row.id] || 0
      };
    });

    return res.status(200).json({
      ack: true,
      data: formattedRows,
      meta: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
      message: 'Content list fetched successfully',
    });

  } catch (e) {
    errorLog(`Content listing error: ${e.message}`);
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
  let t;
  try {
    debugLog('content request');

    const payload = trimObject(req.body); // remove whitespace from strings
    payload.slug = StringHelper.generateRandomString(20);

    const validated = contentRequest.validate(payload, { abortEarly: false });

    // Validation failed
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      throw new ValidationError(validated.error.details, true);
    }

    const requestData = validated.value;

    // Check for duplicate title in English or Arabic
    const existingTitle = await ContentTranslation.findOne({
      where: {
        title: {
          [Op.in]: [requestData.title_en, requestData.title_ar]
        }
      }
    });

    if (existingTitle) {
      errorLog(`Title already exists: ${existingTitle.title}`);
      throw new BadRequest(req.t('content.titleAlreadyExist'));
    }

    // Begin transaction
    const t = await sequelize.transaction();

    // Create content
    const contents = await content.create({
      category_id: requestData.category_id,
      subcategory_id: requestData.subcategory_id,
      cover_image: requestData.cover_image,
      file_url: requestData.file_url,
      file_type: requestData.file_type,
      upload_method: requestData.upload_method || null,
      video_length: requestData.video_length || null,
      status: requestData.status,
      slug: requestData.slug,
      number_of_pages: requestData.number_of_pages
    }, { transaction: t });

    // Create translations for English and Arabic
    await ContentTranslation.bulkCreate([
      {
        content_id: contents.id,
        category_id: requestData.category_id,
        subcategory_id: requestData.subcategory_id,
        lang: 'en',
        title: requestData.title_en,
        coach_name: requestData.coach_name_en,
        description: requestData.description_en || null
      },
      {
        content_id: contents.id,
        category_id: requestData.category_id,
        subcategory_id: requestData.subcategory_id,
        lang: 'ar',
        title: requestData.title_ar,
        coach_name: requestData.coach_name_ar,
        description: requestData.description_ar || null
      }
    ], { transaction: t });

    await t.commit();

    return res.status(200).send({
      ack: true,
      data: contents,
      message: 'Content created successfully'
    });

  } catch (e) {
    if (t) await t.rollback(); // ❗ rollback only if transaction was started
    errorLog(`Content creation error: ${e.message}`);
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
    const slug = req.params.slug;
    const lang = req.query.lang || 'en';

    const contentDetails = await content.findOne({
      where: { slug },
      include: [
        {
          model: ContentTranslation,
          as: 'content_translations',
          attributes: ['lang', 'title', 'description', 'coach_name'],
          required: true
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id'],
          include: [
            {
              model: CategoryTranslation,
              as: 'category_translations',
              attributes: ['name'],
              required: false
            }
          ]
        },
        {
          model: Category,
          as: 'subcategory',
          attributes: ['id'],
          include: [
            {
              model: CategoryTranslation,
              as: 'subcategory_translations',
              attributes: ['name'],
              required: false
            }
          ]
        }
      ]
    });

    if (!contentDetails) {
      return res.status(404).send({
        ack: false,
        message: req.t('content.notFound') || 'Content not found'
      });
    }

    // Calculate total video views for the content
    const totalVideoViews = await videoViews.sum('click_count', {
      where: { video_id: contentDetails.id }
    });

    // Calculate total PDF downloads for the content
    const totalPdfDownloads = await pdfDownload.sum('click_count', {
      where: { content_id: contentDetails.id }
    });

    return res.status(200).send({
      ack: true,
      data: {
        ...contentDetails.toJSON(), // Include existing content details
        totalVideoViews: totalVideoViews || 0, // Add total video views (default to 0 if null)
        totalPdfDownloads: totalPdfDownloads || 0 // Add total PDF downloads (default to 0 if null)
      },
      message: 'Content details fetched successfully'
    });
  } catch (e) {
    errorLog(`Content show error: ${e.message}`);
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
  let t;

  try {
    debugLog('content update request');

    const payload = trimObject(req.body);
    const validated = contentUpdateRequest.validate(payload, { abortEarly: false });

    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      throw new ValidationError(validated.error.details, true);
    }

    const requestData = validated.value;

    // Get the content by slug (from route)
    const slug = req.params.slug;

    const existingContent = await content.findOne({ where: { slug } });
    if (!existingContent) {
      throw new BadRequest(req.t('content.notFound') || 'Content not found');
    }

    // Check for duplicate titles in translations (excluding current content)
    const duplicateTitle = await ContentTranslation.findOne({
      where: {
        title: {
          [Op.in]: [requestData.title_en, requestData.title_ar]
        },
        content_id: { [Op.ne]: existingContent.id }
      }
    });

    if (duplicateTitle) {
      errorLog(`Duplicate title found: ${duplicateTitle.title}`);
      throw new BadRequest(req.t('content.titleAlreadyExist') || 'Title already exists');
    }

    t = await sequelize.transaction();

    if (requestData.is_featured) {
      const featuredContents = await content.findAll({
        where: {
          is_featured: { [Op.ne]: null },
          id: { [Op.ne]: existingContent.id }
        },
        order: [['is_featured', 'ASC']],
        transaction: t
      });

      if (featuredContents.length >= 4) {
        const oldestFeatured = featuredContents[0];
        await oldestFeatured.update({ is_featured: null }, { transaction: t });
      }
    }

    // Update main content
    await existingContent.update({
      category_id: requestData.category_id,
      subcategory_id: requestData.subcategory_id,
      cover_image: requestData.cover_image,
      file_url: requestData.file_url,
      file_type: requestData.file_type,
      upload_method: requestData.upload_method || null,
      video_length: requestData.video_length || null,
      status: requestData.status || 'active',
      number_of_pages: requestData.number_of_pages,
      is_featured: requestData.is_featured || null
    }, { transaction: t });


    // Update translations (English & Arabic)
    await Promise.all([
      ContentTranslation.update(
        {
          title: requestData.title_en,
          description: requestData.description_en || null,
          coach_name: requestData.coach_name_en || null,
          category_id: requestData.category_id,
          subcategory_id: requestData.subcategory_id
        },
        {
          where: { content_id: existingContent.id, lang: 'en' },
          transaction: t
        }
      ),
      ContentTranslation.update(
        {
          title: requestData.title_ar,
          description: requestData.description_ar || null,
          coach_name: requestData.coach_name_ar || null,
          category_id: requestData.category_id,
          subcategory_id: requestData.subcategory_id
        },
        {
          where: { content_id: existingContent.id, lang: 'ar' },
          transaction: t
        }
      )
    ]);

    await t.commit();

    return res.status(200).send({
      ack: true,
      data: existingContent,
      message: 'Content updated successfully'
    });

  } catch (e) {
    if (t) await t.rollback();
    errorLog(`Content update error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}


/**
 * Remove the specified resource from storage.
 */
async function destroy(req, res) {
  try {
    const slug = req.params.slug;

    const contents = await content.findOne({ where: { slug } });

    if (!contents) {
      return res.status(404).send({
        ack: false,
        message: 'Content not found'
      });
    }

    await contents.destroy(); // Delete content

    return res.status(200).send({
      ack: true,
      message: 'Deleted content and its translations successfully'
    });

  } catch (e) {
    errorLog(`Content deletion error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: e.message || 'Internal Server Error'
    });
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

    const contents = await content.findOne({ where: { slug } });
    if (!contents) {
      return res.status(404).json({ ack: false, message: 'contents not found' });
    }

    await contents.update({ status });

    return res.json({
      ack: true,
      data: contents,
      message: `content status updated to ${status}`,
    });

  } catch (e) {
    errorLog(`Content status change error: ${e.message}`);
    return res.status(500).json({ ack: false, message: setError(e) });
  }
}



export {
  index,
  store,
  show,
  update,
  destroy,
  changeStatus,
}

