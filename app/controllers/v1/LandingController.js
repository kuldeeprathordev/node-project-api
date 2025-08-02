/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { Op } from 'sequelize'; // Import the Op module for SQL operations
import { LandingPage } from "../../models/index.js"; // Import database models
import { BadRequest, ValidationError } from "../../../utils/errors.js"; // Import error handling functions
import {
  trimObject, // Import a function to remove unnecessary spaces from an object
  setError // Import a function to format error messages
} from "../../../utils/utils.js";
import Debug from 'debug'; // Import the debug module
import { StringHelper } from 'node-simplify';
import uploadModule from '../../middlewares/uploadFile.js';
const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger
import sequelize from '../../../config/database.js';
import { storeRequest, updateRequest } from '../../request/landingRequest.js';

/**
 * Display a listing of the resource.
 */
async function index(req, res) {
  try {
    const landing = await LandingPage.findAll();
    return res.status(200).send({
      ack: true,
      data: landing,
      message: 'List of landing page resources'
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
        const payload = trimObject(req.body);
        const validated = storeRequest.validate(payload, { abortEarly: false });
        // Validation failed
        if (validated.error) {
            errorLog(`Validation error: ${validated.error.details}`);
            throw new ValidationError(validated.error.details, true);
        }

        const requestData = validated.value;
        console.log(requestData);

    // Check if a landing page record already exists
    const existingLanding = await LandingPage.findOne();

    let landing;
    let message;

    if (existingLanding) {
      // Update existing landing page
      await LandingPage.update(
        { banner_image: requestData.banner_image },
        { where: { id: existingLanding.id } }
      );
      landing = await LandingPage.findByPk(existingLanding.id); // Fetch updated record
      message = 'Banner image updated successfully';
    } else {
      // Create a new landing page
      landing = await LandingPage.create({
        banner_image: requestData.banner_image
      });
      message = 'Banner image created successfully';
    }

    return res.status(200).send({
      ack: true,
      data: landing,
      message: message
    });

  } catch (e) {
    errorLog(`Banner image creation/update error: ${e.message}`);
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
    // TODO: Implement database query
    return res.status(200).send({
      ack: true,
      data: {},
      message: 'Details of landing page resource'
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
    const { error, value } = updateRequest.validate(req.body);
    if (error) {
      return res.status(400).send({
        ack: false,
        message: error.details[0].message
      });
    }
    const updatedResource = await LandingPage.update(value, { where: { id } });
    return res.status(200).send({
      ack: true,
      data: updatedResource,
      message: 'Landing page resource updated successfully'
    });
  } catch (e) {
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
    const id = req.params.id;
    const deleted = await LandingPage.destroy({ where: { id } });
    // TODO: Implement database deletion
    return res.status(200).send({
      ack: true,
      data: {},
      message: 'Landing page resource deleted successfully'
    });
  } catch (e) {
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

async function upload(req, res) {
  uploadModule(req, res, async (err) => {
    if (err) {
      errorLog(`File upload error: ${err.message}`);
      return res.status(400).send({
        ack: false,
        message: err.message
      });
    }
    // Check if the 'file' field has been uploaded
    if (req.files['file']) {
      return res.status(200).send({
        ack: true,
        data: {
          file_url: req._publicFileUrl,
          file_type: req.body.file_type
        },
        message: 'File uploaded successfully'
      });
    } else {
      return res.status(400).send({
        ack: false,
        message: 'No file uploaded'
      });
    }
  });
}

export {
  index,
  store,
  show,
  update,
  destroy,
  upload
}
