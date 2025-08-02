/**
 * @file index.js for the router
 * @description This file contains the main router for our API, It defines the routes for our API
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
import express from 'express'; // We need express to create the router
const router = express.Router(); // Create a new router using express.Router()
import apiV1 from "./v1/index.js"; // Import the routes for version 1 of our API

/**
 * This block of code defines the routes for our API
 * We are using the /api prefix for all routes related to our API
 */
router.use('/api/v1',apiV1); // Use the routes from apiV1 with the /api prefix

/**
 * This line exports the router for use in other modules
 */
export default router; // Export the router so it can be used in other modules
