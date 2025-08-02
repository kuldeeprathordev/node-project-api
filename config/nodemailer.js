/**
 * @file nodemailer.js
 * @description nodemailer configuration
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */
import nodemailer from "nodemailer"; // Nodemailer is a module for sending emails
import hbs from 'nodemailer-express-handlebars'; // Handlebars is a templating engine
import path from 'path'; // Path is a built-in module for working with file and directory paths

// Create a Nodemailer transport object
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // The host of the SMTP server
  port: process.env.MAIL_PORT, // The port of the SMTP server
  // secure: true, // Whether to use TLS or SSL
  auth: {
    user: process.env.MAIL_USER, // The username for authentication
    pass: process.env.MAIL_PASS // The password for authentication
  }
});

// Set up the options for the Handlebars plugin
const handlebarOptions = {
  viewEngine: { // Options for the view engine
    extName: '.hbs', // The file extension for the templates
    partialsDir: path.resolve('./views/email/'), // The directory containing the partials
    defaultLayout: false, // Whether to use a default layout
  },
  viewPath: path.resolve('./views/email/'), // The directory containing the views
  extName: '.hbs', // The file extension for the views
};

// Attach the Handlebars plugin to the Nodemailer transporter
transporter.use('compile', hbs(handlebarOptions));

// Export the transporter object so it can be used elsewhere in the application
export default transporter
