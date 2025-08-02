// Import necessary modules and utilities
import { User, UserToken } from "../../../models/index.js"; // Import database models
import { BadRequest, NotAuthorizedError, ValidationError } from "../../../../utils/errors.js"; // Import error handling functions
import {
  trimObject, // Import a function to remove unnecessary spaces from an object
  lowerCaseString, // Import a function to convert a string to lowercase
  verifyPassword, // Import a function to verify a password
  setError // Import a function to format error messages
} from "../../../../utils/utils.js";
import { jwtCreateToken } from "../../../../utils/jwtWebToken.js"; // Import the JWTToken model
import {
  loginRequest,
} from "../../../request/web/authRequest.js"; // Import validation schemas

import Debug from 'debug'; // Import the debug module
const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger

/**
 * This function handles the login of a user.
 *
 * @param {Object} req - The request object containing the user login details.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the login is complete.
 */
async function login(req, res) {
  try {
    // Trim the request body and check required fields
    // This function trims the request body and checks that the required fields are present.
    const payload = trimObject(req.body);

    // Validate the request data using Joi
    const validated = loginRequest.validate(payload, { abortEarly: false });

    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      // Throw a ValidationError with the validation errors
      throw new ValidationError(validated.error.details, true);
    }

    // Get the validated request data
    const requestData = validated.value;

    // Format email/username and password
    // This function formats the email/username by converting it to lowercase.
    if (requestData.email) {
      requestData.email = lowerCaseString(requestData.email);
    }
    if (requestData.username) {
      requestData.username = requestData.username;
    }

    // Check if user exists in the database
    // This function checks if a user with the provided email or username, role, and active status exists in the database.
    const userQuery = {};
    if (requestData.email) {
      userQuery.email = requestData.email;
    } else if (requestData.username) {
      userQuery.username = requestData.username;
    }

    const result = await User.findOne({
      where: {
        ...userQuery,
        role: requestData.role
      }
    });
    if (!result) {
      errorLog(`User not found: ${requestData.email || requestData.username}`);
      // If the user is not found, throw a NotAuthorizedError.
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
    }

    if(result.status != 'active') {
      errorLog(`your account is inactive please contact admin`);
      // If the user is not found, throw a NotAuthorizedError.
      throw new NotAuthorizedError(req.t('your account is inactive please contact admin'));
    }
    // Verify password
    // This function checks if the provided password matches the user's stored password.
    if (!await verifyPassword(requestData.password, result.password)) {
      errorLog(`Invalid password: ${requestData.password}`);
      // If the password is incorrect, throw a NotAuthorizedError.
      throw new NotAuthorizedError(req.t('auth.invalidPassword'));
    }

    // Set the first_login_at property of the user if it is not set
    if (!result.first_login_at) {
      debugLog('User first login ');
      result.first_login_at = new Date();
      await result.save();
    }

    // Clear the forgot_password_code of the user if it is set
    if (result.forgot_password_code && result.forgot_password_code !== 'null') {
      debugLog('User forgot password code cleared');
      result.forgot_password_code = null;
      await result.save();
    }

    // Generate JWT token
    // This function generates a JWT token containing the user's information.
    const token = jwtCreateToken({
      fullname: [result.first_name, result.middle_name, result.last_name]
        .join(' ').trim(),
      username: result.username,                               // The user's full name
      email: result.email,                               // The user's email
      contact_number: [result.country_code, result.contact_number]
        .join(' ').trim(),                               // The user's contact number
      gender: result.gender,                             // The user's gender
      role: result.role,                                 // The user's role
      first_login_at: result.first_login_at              // The user's first login timestamp
    });

    await UserToken.create({ user_id: result.id, token }); // Create a new user token

    debugLog('User login successful');
    return res.status(200).send({
      ack: true,                                         // Acknowledge success
      data: {                                           // The returned data
        token
      },
      message: req.t('auth.userLoggedIn')                // The success message
    });
  } catch (e) {
    errorLog(`User login error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,                                        // Acknowledge failure
      message: setError(e)                              // The error message
    })
  }
}


export {
  login
}