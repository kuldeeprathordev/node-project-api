/**
 * @file ForgotPassword.js
 * @description forgot password mail
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 * @module ForgotPassword
 * @param {*} data  data of user
 * @returns {Promise} send mail 
 */

import transporter from "../../config/nodemailer.js";

export default (data) => {
  // Create an object to specify the options for the email.
  const mailOptions = {
    from: process.env.MAIL_FROM, // Set the 'from' property to the value of the 'MAIL_FROM' environment variable.
    to: data.email, // Set the 'to' property to the user's email.
    subject: "Password Reset Request", // Set the 'subject' property to 'Password Reset Request'.
    template: "forgot", // Set the 'template' property to 'forgot', which specifies the email template to use.
    context: {
      ...data, // Set the 'context' property to an object that contains the user's email and a reset token.
      redirect_url: process.env.FRONTEND_URL
    }
  };
  // Send the email using the transporter object.
  return transporter.sendMail(mailOptions);
}
