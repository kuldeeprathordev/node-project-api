/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
import { Op, fn, col, where, literal } from 'sequelize'; // Import the Op module for SQL operations
import { User, UserToken } from "../../models/index.js"; // Import database models
import { BadRequest, NotAuthorizedError, ValidationError } from "../../../utils/errors.js"; // Import error handling functions
import {
  trimObject, // Import a function to remove unnecessary spaces from an object
  lowerCaseString, // Import a function to convert a string to lowercase
  passwordEncryption, // Import a function to encrypt a password
  verifyPassword, // Import a function to verify a password
  setError // Import a function to format error messages
} from "../../../utils/utils.js";
import {
  userRequest,
  changeUserPasswordRequest
} from "../../request/authRequest.js"; // Import validation schemas
import eventBus from "../../../config/eventBus.js"; // Import the event bus
import Debug from 'debug'; // Import the debug module
const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger
/**
 * Display a listing of the resource.
 */

async function index(req, res) {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new NotAuthorizedError(req.t('auth.notAuthorized'));
    }

    // Get pagination and filter parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status; // 'active' or 'inactive'
    const search = req.query.search; // keyword for username

    // Build dynamic where clause
    const whereClause = {
      role: { [Op.ne]: 'admin' }
    };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.username = where(
        fn('LOWER', col('username')),
        {
          [Op.like]: `%${search.toLowerCase()}%`
        }
      );
    }

    // Query users with filters and pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [['id', 'desc']],
    });

    return res.status(200).send({
      ack: true,
      data: users,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      message: req.t('auth.usersListed')
    });

  } catch (e) {
    errorLog(`Error fetching users: ${e.message}`);
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
    debugLog('User registration request');
    // Trim the request body and check required fields
    // This function removes any unnecessary spaces from the request body and checks if the required fields are present.
    const payload = trimObject(req.body);

    // Validate the request data using Joi
    const validated = userRequest.validate(payload, { abortEarly: false });

    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      // Throw a ValidationError with the validation errors
      throw new ValidationError(validated.error.details, true);
    }

    // Get the validated request data
    const requestData = validated.value;

    // Check if email already exists in the database
    // This function checks if the email already exists in the database.
    if (await User.findOne({ where: { username: requestData.username } })) {
      errorLog(`Username already exists: ${requestData.username}`);
      throw new BadRequest(req.t('auth.usernameAlreadyExist'));
    }

    // Format email and password
    // This function formats the email and password.
    requestData.password = await passwordEncryption(requestData.password);

    // Create a new user in the database
    // This function creates a new user in the database using the request data.
    const result = await User.create(requestData);

    // If user creation is successful
    if (result) {
      // Send a registration email
      // This function sends a registration email to the user.
      debugLog('User registered successfully');
      eventBus.emit('user.registered', requestData);
      return res.status(201).send({
        ack: true,
        // data: result,
        message: req.t('auth.userCreated')
      });
    } else {
      errorLog('User registration failed');
      // If user creation fails
      return res.status(500).send({
        ack: false,
        message: req.t('auth.userCreateFailed')
      });
    }
  } catch (e) {
    errorLog(`User registration error: ${e.message}`);
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
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ ack: false, message: 'user not found' });
    }

    // Delete the main user
    await user.destroy();

    return res.json({ ack: true, message: 'user deleted successfully' });
  } catch (e) {
    return res.status(500).json({ ack: false, message: e.message });
  }
}

/**
 * Change user status
 */
async function changeStatus(req, res) {
  try {
    if (req.user.role !== 'admin') {
      throw new NotAuthorizedError(req.t('auth.notAuthorized'));
    }

    const { username } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      throw new BadRequest(req.t('auth.invalidStatus'));
    }

    let user = await User.findOne({
      where: {
        username,
        role: {
          [Op.ne]: 'admin'
        }
      }
    });

    if (!user) {
      throw new BadRequest(req.t('auth.userNotFound'));
    }

    user = await user.update({ status });
    debugLog(`User ${user.username} status changed to ${status}`);
    return res.status(200).send({
      ack: true,
      data: user,
      message: req.t('auth.statusChanged')
    });

  } catch (e) {
    errorLog(`Error changing user status: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

async function changePassword(req, res) {
  try {
    debugLog('Change password request with username param');

    // Trim input
    const payload = trimObject(req.body);

    // Validate password
    const validated = changeUserPasswordRequest.validate(payload, { abortEarly: false });
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      throw new ValidationError(validated.error.details, true);
    }

    const requestData = validated.value;
    const username = req.params.username;

    // Find user by username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      errorLog('User not found');
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
    }

    // Encrypt and update password
    const newPassword = await passwordEncryption(requestData.password);
    await User.update({ password: newPassword }, { where: { username } });

    debugLog('Password updated successfully');
    return res.status(200).send({
      ack: true,
      message: req.t('auth.passwordChanged')
    });
  } catch (e) {
    errorLog(`Change password error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

// Only expose non-sensitive env variables
const allowedEnvKeys = [
  'Bucket_name',
  'Region',
  'Access_Key_ID',
  'Secret_Access_Key',
];

function getEnvVariables(req, res) {
  const envs = {};
  allowedEnvKeys.forEach(key => {
    if (process.env[key]) {
      envs[key] = process.env[key];
    }
  });
  res.json({ env: envs });
}

export {
  index,
  store,
  show,
  update,
  destroy,
  changeStatus,
  changePassword,
  getEnvVariables
}
