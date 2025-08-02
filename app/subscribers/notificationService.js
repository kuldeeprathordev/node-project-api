import RegisterMail from "../mail/RegisterMail.js"; // Import a function to send a registration email
import ForgotPassword from "../mail/ForgotPassword.js"; // Import a function to send a forgot password email
import Debug from 'debug'; // Import the debug module
const debugLog = Debug('app:subscribers-notification'); // Create a debug logger
const errorLog = Debug('err:subscribers-notification-errors'); // Create a debug logger
import eventBus from '../../config/eventBus.js';

eventBus.on('user.registered', async (data) => {
    try {
        debugLog('User registered event received', data);
        // Send a registration email to the user
        const result = await RegisterMail(data);

        if (result) {
            debugLog('Registration email sent successfully');
        } 
    } catch (error) {
        errorLog('Failed to send registration email', error);
    }
})

eventBus.on('forgotPassword', async (data) => {
    try {
        debugLog('User forgot password event received', data);
        // Send a registration email to the user
        const result = await ForgotPassword(data);

        if (result) {
            debugLog('Forgot password email sent successfully');
        } 
    } catch (error) {
        errorLog('Failed to send forgot password email', error);
    }
})