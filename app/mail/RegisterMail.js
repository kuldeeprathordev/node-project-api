/**
 * @file RegisterMail.js
 * @description register mail
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 * @module RegisterMail
 * @param {*} data  data of user
 * @returns {Promise} send mail
 */
import transporter from "../../config/nodemailer.js";

// This is the function that sends an email to a user upon registration
// It takes in an object called data that contains the user's email and a verification token
export default (data) => {
  // Create an object to specify the options for the email.
  // The 'from' property is set to the value of the 'MAIL_FROM' environment variable,
  // which is the email address that the emails will be sent from.
  // The 'to' property is set to the user's email address.
  // The 'subject' property is set to 'Account Confirmation', which is the subject line of the email.
  // The 'template' property is set to 'register', which specifies the email template to use.
  // The 'context' property is set to an object that contains the user's email and a verification token.
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: data.email,
    subject: "Account Confirmation",
    template: "register",
    context: {
      ...data,
      redirect_url: process.env.FRONTEND_URL
    }
  };
  // Send the email using the transporter object.
  // The 'mailOptions' object is passed as an argument to the 'sendMail' method.
  // The 'sendMail' method returns a Promise, so we can use 'async/await' or '.then()' to handle the response.
  return transporter.sendMail(mailOptions);
}
