// Import necessary modules and utilities
import { User, UserToken } from "../../models/index.js"; // Import database models
import { BadRequest, NotAuthorizedError, ValidationError } from "../../../utils/errors.js"; // Import error handling functions
import {
  trimObject, // Import a function to remove unnecessary spaces from an object
  lowerCaseString, // Import a function to convert a string to lowercase
  passwordEncryption, // Import a function to encrypt a password
  verifyPassword, // Import a function to verify a password
  setError // Import a function to format error messages
} from "../../../utils/utils.js";
import { jwtCreateToken } from "../../../utils/jwtWebToken.js"; // Import the JWTToken model
import { StringHelper } from "node-simplify" // Import a function strings
import {
  registerRequest,
  loginRequest,
  forgotPasswordRequest,
  checkResetTokenRequest,
  resetPasswordRequest,
  changePasswordRequest
} from "../../request/authRequest.js"; // Import validation schemas
import eventBus from "../../../config/eventBus.js"; // Import the event bus

import Debug from 'debug'; // Import the debug module
const debugLog = Debug('app:authentication'); // Create a debug logger
const errorLog = Debug('err:errors'); // Create a debug logger

/**
 * This function handles the registration of a new user.
 *
 * @param {Object} req - The request object containing the user registration details.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the registration is complete.
 */
async function register (req, res) {
  try {
    debugLog('User registration request');
    // Trim the request body and check required fields
    // This function removes any unnecessary spaces from the request body and checks if the required fields are present.
    const payload = trimObject(req.body);
    
    // Validate the request data using Joi
    const validated = registerRequest.validate(payload, { abortEarly: false });
    
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
    if (await User.findOne({ where: { email: requestData.email } })) {
      errorLog(`Email already exists: ${requestData.email}`);
      throw new BadRequest(req.t('auth.emailAlreadyExist'));
    }

    // Format email and password
    // This function formats the email and password.
    requestData.email = lowerCaseString(requestData.email);
    requestData.password = await passwordEncryption(requestData.password);

    // Generate email verification code
    // This function generates a random string used for email verification.
    requestData.email_verify_code = StringHelper.generateRandomString(32)

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
 * This function handles the login of a user.
 *
 * @param {Object} req - The request object containing the user login details.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the login is complete.
 */
async function login (req, res) {
  try {
    debugLog('User login request');
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

    // Format email and password
    // This function formats the email by converting it to lowercase.
    requestData.email = lowerCaseString(requestData.email);

    // Check if user exists in the database
    // This function checks if a user with the provided email, role, and active status exists in the database.
    const result = await User.findOne({ where: {
      email: requestData.email,
      role: requestData.role,
      status: 'active'
    } });
    if (!result) {
      errorLog(`User not found: ${requestData.email}`);
      // If the user is not found, throw a NotAuthorizedError.
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
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
      fullname: [ result.first_name, result.middle_name, result.last_name ]
        .join(' ').trim(),                               // The user's full name
      email: result.email,                               // The user's email
      contact_number: [ result.country_code, result.contact_number ]
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

/**
 * This function handles the refresh token.
 *
 * @param {Object} req - The request object containing the refresh token.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the refresh is complete.
 */

async function refreshToken (req, res) {
  try {
    debugLog('User refresh token request');
    // Get the refresh token from the request body
    const user = req.user;

    // Create a new JWT token with the same data as the original token
    const newToken = jwtCreateToken({
      fullname: [ user.first_name, user.middle_name, user.last_name ]
        .join(' ').trim(),                               // The user's full name
      email: user.email,                               // The user's email
      contact_number: [ user.country_code, user.contact_number ]
        .join(' ').trim(),                               // The user's contact number
      gender: user.gender,                             // The user's gender
      role: user.role,                                 // The user's role
      first_login_at: user.first_login_at              // The user's first login timestamp
    });

    await UserToken.update({ token: newToken }, { where: { user_id: user.id } }); // Update the user token

    debugLog('User refresh token successful');
    // Send a 200 status code with the new token in the response body
    return res.status (200).send({
      ack: true,
      data: {
        token: newToken
      },
      message: req.t('auth.userLoggedIn') // The success message
    });
  } catch (e) {
    errorLog(`User refresh token error: ${e.message}`);
    // If there is an error, send a status code of 500 and the error message
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
  }
}

/**
 * This function handles the logout of a user.
 *
 * @param {Object} req - The request object containing the user token.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the logout is complete.
 */
async function logout (req, res) {
  try {
    debugLog('User logout request');

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new BadRequest(req.t('auth.tokenRequired'));
    }

    // Delete the token from the database
    const result = await UserToken.destroy({ where: { token: token } });

    if (result) {
      debugLog('User logout successful');
      return res.status(200).send({
        ack: true,
        message: req.t('auth.userLoggedOut')
      });
    } else {
      errorLog('User logout failed');
      return res.status(404).send({
        ack: false,
        message: req.t('auth.tokenNotFound')
      });
    }
  } catch (e) {
    errorLog(`User logout error: ${e.message}`);
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

/**
 * This function handles the forgot password functionality.
 *
 * @param {Object} req - The request object containing the user email and role.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when done.
 */
async function forgotPassword (req, res) {
  try {
    debugLog('User forgot password request');
    // Extract the email and role from the request body
    const payload = trimObject(req.body);

    // Validate the request data
    const validated = forgotPasswordRequest.validate(payload, { abortEarly: false });

    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      // Throw a ValidationError with the validation errors
      throw new ValidationError(validated.error.details, true);
    }

    const requestData = validated.value;
    
    // Find the user with the given email and role
    const result = await User.findOne({ where: { email: requestData.email, role: requestData.role } });
    
    // If the user is not found, throw a NotAuthorizedError with a message
    if (!result) {
      errorLog('User not found');
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
    }
    const token =  StringHelper.generateRandomString(32)
    // Create a new data object with the user's information and a new forgot password code
    const data = {
      first_name: result.first_name,
      email: result.email,
      role: result.role,
      forgot_password_code: token,
      email_verify_code: token
    }
    
    // Update the user's forgot_password_code in the database
    await User.update({
      forgot_password_code: token
    }, { where: { id: result.id } });
    debugLog('User forgot password successful');
    // Emit the forgotPassword event
    eventBus.emit('forgotPassword', data);
    // Send a 200 status code with a success message in the response body
    return res.status(200).send({
      ack: true,
      message: req.t('auth.resetPasswordLinkSent')
    });
  } catch (e) {
    errorLog(`User forgot password error: ${e.message}`);
    // If there is an error, send a status code of 500 and the error message
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
  }
}

/**
 * This function checks if the provided forgot password code and role are valid 
 * by looking for a user with the same code and role in the database.
 * 
 * @param {object} req - The request object containing the forgot password code and role in the request body.
 * @param {object} res - The response object used to send the result of the check.
 * @returns {object} - The response object containing a success message and a status code if the check was successful.
 */
async function checkResetToken (req, res) {
  try {
    debugLog('User check reset token request');
    // Trim the request body to remove any unnecessary whitespace
    const payload = trimObject(req.body);

    // Validate the request data
    const validated = checkResetTokenRequest.validate(payload, { abortEarly: false });
  
    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      // Throw a ValidationError with the validation errors
      throw new ValidationError(validated.error.details, true);
    }

    // Extract the forgot password code and role from the validated data
    const requestData = validated.value;
    
    // Find a user in the database with the provided forgot password code and role
    const result = await User.findOne({
      where: {
        forgot_password_code: requestData.forgot_password_code,
        role: requestData.role
      }
    });
    
    // If no user is found, throw a NotAuthorizedError with a message
    if (!result) {
      errorLog('User not found');
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
    }
    
    debugLog('User check reset token successful');
    // Send a success message with a status code of 200
    return res.status(200).send({
      ack: true,
      message: req.t('auth.validCode')
    });
  } catch (e) {
    errorLog(`User check reset token error: ${e.message}`);
    // If there is an error, send a status code of 500 and the error message
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

/**
 * This function handles the resetting of a user's password.
 * 
 * @param {Object} req - The request object containing the reset password details.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns {Object} - The response object containing a success message and a status code if the password reset was successful.
 */
async function resetPassword (req, res) {
  try {
    debugLog('User reset password request');
    // Trim the request body to remove any unnecessary whitespace
    const payload = trimObject(req.body);

    // Validate the request data
    const validated = resetPasswordRequest.validate(payload, { abortEarly: false });
    
    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      // Throw a ValidationError with the validation errors
      throw new ValidationError(validated.error.details, true);
    }

    // Extract the forgot password code and role from the validated data
    const requestData = validated.value;

    // Find a user in the database with the provided forgot password code and role
    const result = await User.findOne({
      where: {
        forgot_password_code: requestData.forgot_password_code,
        role: requestData.role
      }
    });

    // If no user is found, throw a NotAuthorizedError with a message
    if (!result) {
      errorLog('User not found');
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
    }

    // Encrypt the new password
    const password = await passwordEncryption(requestData.password);

    // Update the user's password and clear the forgot password code
    await User.update({
      password,
      forgot_password_code: null
    }, { where: { id: result.id } });

    debugLog('User reset password successful');
    // Send a success message with a status code of 200
    return res.status(200).send({
      ack: true,
      message: req.t('auth.passwordReset')
    });
  } catch (e) {
    errorLog(`User reset password error: ${e.message}`);
    // If there is an error, send a status code of 500 and the error message
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

/**
 * This function is an API endpoint for changing the user's password.
 *
 * @param {Object} req - The request object, which contains the user's old password and new password.
 * @param {Object} res - The response object, which will contain the result of the password change.
 * @returns {Object} - The response object.
 */
async function changePassword (req, res) {
  try {
    debugLog('User change password request');
    // Trim the request data to remove any unnecessary spaces
    const payload = trimObject(req.body);

    // Validate the request data using Joi
    const validated = changePasswordRequest.validate(payload, { abortEarly: false });

    // Get the user object from the request
    const user = req.user;
    
    // If validation fails
    if (validated.error) {
      errorLog(`Validation error: ${validated.error.details}`);
      // Throw a ValidationError with the validation errors
      throw new ValidationError(validated.error.details, true);
    }

    // Get the validated request data
    const requestData = validated.value;

    // Find a user in the database with the user's email and role
    const result = await User.findOne({ where: { email: user.email, role: user.role } });

    // If no user is found, throw a NotAuthorizedError with a message
    if (!result) {
      errorLog('User not found');
      throw new NotAuthorizedError(req.t('auth.userNotFound'));
    }

    // Verify the old password against the user's password
    if (!await verifyPassword(requestData.old_password, result.password)) {
      errorLog('Old password is incorrect');
      // If the old password is incorrect, throw a NotAuthorizedError with a message
      throw new NotAuthorizedError(req.t('auth.invalidPassword'));
    }

    // Encrypt the new password
    const password = await passwordEncryption(requestData.password);

    // Update the user's password in the database
    await User.update({
      password
    }, { where: { id: result.id } });

    debugLog('User change password successful');
    // Send a success message with a status code of 200
    return res.status(200).send({
      ack: true,
      message: req.t('auth.passwordChanged')
    });
  } catch (e) {
    errorLog(`User change password error: ${e.message}`);
    // If there is an error, send a status code of 500 and the error message
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    });
  }
}

export {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  checkResetToken,
  refreshToken,
  logout
}