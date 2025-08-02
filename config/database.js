/**
 * @file database.js
 * @description database configuration
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
/**
 * This file sets up a connection to a database using Sequelize.
 * Sequelize is an ORM (Object Relational Mapping) tool that allows
 * us to interact with a database using JavaScript.
 * 
 * The connection is set up using four environment variables:
 * DB_NAME, DB_USER, DB_PASSWORD, and DB_HOST. If these variables are
 * not set, the connection defaults to using a local MySQL database
 * with the username 'username' and the password 'password'.
 * 
 * The connection is then exported so that it can be used elsewhere
 * in the application.
 */
import { Sequelize } from 'sequelize';

/**
 * Create a new Sequelize instance, which is the entry point to the Sequelize library.
 * The constructor takes four parameters: the name of the database, the username to use,
 * the password to use, and an options object. The options object has a number of
 * properties, including the host to connect to, the dialect of the database (e.g. 'mysql'),
 * and whether or not to log SQL queries to the console.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'localhost', // The name of the database to connect to
  process.env.DB_USER || 'username', // The username to use when connecting
  process.env.DB_PASSWORD || 'password', // The password to use when connecting
  {
    host: process.env.DB_HOST || 'localhost', // The host to connect to
    dialect: process.env.DB_DRIVER || 'mysql', // The dialect of the database
		port: process.env.DB_PORT || 3306, // The port to use when connecting
    logging: false // Whether or not to log SQL queries to the console
  }
);

/**
 * Export the Sequelize instance so that it can be used elsewhere in the application.
 */
export default sequelize
