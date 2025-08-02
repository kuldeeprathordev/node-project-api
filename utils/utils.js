import { BadRequest } from "./errors.js";
import bcrypt from "bcrypt";

/**
 * @param {string} str
 * @return {string}
 */
function trimStr(str) {
  if (!str) return str;
  try {
    return str.toString().trim();
  } catch (e) {
    console.log(e);
    return str;
  }
}

/**
 * 
 * @param {Object} obj 
 * @return {object}
 */
function trimObject(obj) {
  try {
    const trimmedObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const trimmedKey = key.trim();
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      trimmedObj[trimmedKey] = trimmedValue;
    }
      return trimmedObj;
  } catch (e) {
    console.log(e);
    return obj;
  }
}

/**
 *
 * @param {*} str
 * @return {string}
 */
function lowerCaseString(str) {
  try {
    if (!str) return str;
    return str.toString().toLowerCase();
  } catch (e) {
    console.log(e);
    return str;
  }
}


/**
 *
 * @param {String} password
 * @return {Promise<String>}
 */
async function passwordEncryption(password) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    console.log(e);
    throw new BadRequest(e.message);
  }
}

/**
 *@param {String} password
 *@param {String} hashedPassword
 *@return {boolean}
 */
function verifyPassword(password, hashedPassword) {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (e) {
    console.log(e);
    return false;
  }
}

function setError(err) {
  if (err.hasArray) {
    return JSON.parse(err.message);
  } else {
    return err.message;
  }
}

/**
 * @param {*} handler 
 * @returns 
 */
function wrapHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

export {
    setError,
		trimStr,
    trimObject,
    lowerCaseString,
    passwordEncryption,
    verifyPassword,
    wrapHandler
}