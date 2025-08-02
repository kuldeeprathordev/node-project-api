/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
import {trimObject,setError} from '../../../../utils/utils.js';
import { Op } from 'sequelize'; // Import the Op module for SQL operations
import { CustomerDetail} from "../../../models/index.js"; // Import database models
import sequelize from '../../../../config/database.js'; // Import sequelize instance
import Debug from 'debug'; // Import the debug module
import { customerRequest } from '../../../request/web/CustomerRequest.js';
const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger

/**
 * Display a listing of the resource.
 */

async function customerList (req, res) {
	try {
	   const page = parseInt(req.query.page) || 1;
	   const limit = parseInt(req.query.limit) || 10;
	   const offset = (page - 1) * limit;

	   const { count, rows: customers } = await CustomerDetail.findAndCountAll({
	     order: [['id', 'DESC']],
	     limit: limit,
	     offset: offset,
	   });

		return res.status(200).send({
	     ack: true,
	     data: {
	       customers: customers,
	       totalItems: count,
	       totalPages: Math.ceil(count / limit),
	       currentPage: page,
	     },
	     message: 'list of resources'
	   });
	} catch (e) {
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
	}
}

/**
 * Store a newly created resource in storage.
 */
async function store(req, res) {
  try {
    const payload = trimObject(req.body);

    // Validate the request data using Joi
    const validated = customerRequest.validate(payload, { abortEarly: false });

    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      throw new ValidationError(validated.error.details, true);
    }

    // Get the validated request data
    const requestData = validated.value;

    // Check if email already exists in the database
    // if (await CustomerDetail.findOne({ where: { email: requestData.email } })) {
    //   errorLog(`Email already exists: ${requestData.email}`);
    //   return res.status(400).send({
    //     ack: false,
    //     message: req.t('auth.emailAlreadyExist')
    //   });
    // }

    const result = await CustomerDetail.create(requestData);

    // If user creation is successful
    if (result) {
      return res.status(201).send({
        ack: true,
        data: result,
        message: req.t('auth.userCreated')
      });
    } else {
      errorLog('User registration failed');
      return res.status(500).send({
        ack: false,
        message: req.t('auth.userCreateFailed')
      });
    }
  } catch (e) {
    errorLog(`User registration error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

/**
 * Display the specified resource.
 */
async function show (req, res) {
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

/**
 * Update the specified resource in storage.
 */
async function update (req, res) {
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
async function destroy (req, res) {
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

export {
  customerList,
  store,
  show,
  update,
  destroy
}
