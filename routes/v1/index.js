/**
 * @file index.js
 * @description This file contains the main router for our API. It defines the
 * routes for our API.
 */

// Import the express module which is a popular web framework for Node.js.
import express from 'express';

// Create a new router using express.Router() which allows us to define routes
// that can be used in multiple parts of our application.
const router = express.Router();

// Import the authentication routes from the ./authentication.js file. These
// routes will handle all authentication related routes.
import authRoute from "./authentication.js";
import userRoute from "./user.js";
import categoryRoute from "./category.js";
import contentRoute from "./content.js";
import webUser from "./web/user.js"; // Import the web user routes from the ./web/user
import awsRoute from "./aws.js"; // Import AWS routes
import landingRoute from "./landing.js";

/**
 * This block of code defines the routes for all authentication related routes.
 * We are using the /v1/auth prefix for all authentication routes.
 */
router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/category', categoryRoute);
router.use('/content', contentRoute);
router.use('/web/auth', webUser);
router.use('/aws', awsRoute); 
router.use('/landing', landingRoute);

// Export the router so that it can be used in other modules of our application.
export default router;
