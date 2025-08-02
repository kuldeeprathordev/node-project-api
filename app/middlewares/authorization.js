/**
 * @file Middleware for authorization.
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 * @module authorization
 * @param {*} req - The request object
 * @param {*} res - The response object
 * @param {*} next - The function to call the next middleware
 * @returns {Promise} - A promise that resolves to the next middleware
 */
// import models from "../models/index.js";
import { User, UserToken } from "../models/index.js";

// Define an async function that accepts three parameters: req (the request object), res (the response object), and next (a function to call the next middleware).
export default async (req, res, next) => {
  // Extract the token from the authorization header of the request.
  // If the header is missing or the token is invalid, set the token to an empty string.
  const token = req?.headers['authorization']?.split(' ')?.[1] ?? '';

  // If the token is empty, return a 401 Unauthorized response.
  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }

  try {
    // Use the JWTToken utility class to extract the user data from the token.
    const userToken = await UserToken.findOne({ where: { token } });

    // If the user data is not found, return a 401 Unauthorized response.
    if (!userToken) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }

    // Find the user in the database using the user ID.
    const result = await User.findOne({ where: { id: userToken.user_id } });

    // If the user is not found, return a 401 Unauthorized response.
    if (!result) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    if (result.status !== "active") {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }
    // Attach the user data to the request object.
    req.user = result;
    // Call the next middleware function.
    next();
  } catch (err) {
    console.log(err);
    // If an error occurred while extracting the user data, return a 401 Unauthorized response.
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }
}
