/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 * This module assumes an IAM role using the AWS Security Token Service (STS)
 * and returns the temporary credentials.
 * The temporary credentials are valid for 15 minutes and can be used to
 * access AWS resources.
 * The role to be assumed is specified in the roleArn variable.
 * The AWS region is specified in the process.env.AWS_REGION environment variable.
 * The API version is specified as '2011-06-15'.
 */

import Sts from 'aws-sdk/clients/sts.js';

// The ARN of the role to be assumed
const roleArn = process.env.AWS_ROLE_ARN;

/**
 * Creates an AWS STS client with the specified region and API version.
 */
const stsClient = new Sts({
    region: process.env.AWS_REGION,
    apiVersion: '2011-06-15',
});

/**
 * Assumes the specified role and returns the temporary credentials.
 * @return {Object} - The temporary credentials.
 */
const assumeRole = async () => {
    /**
     * Calls the assumeRole function on the STS client with the specified role ARN.
     * The promise is returned, so the caller can handle the result.
     */
    const { Credentials } = await stsClient.assumeRole({
        RoleArn: roleArn, // The ARN of the role to be assumed
        RoleSessionName: 'AssumeRoleSession', // A name for the session
        DurationSeconds: 900, // The duration of the session
    }).promise();
    /**
     * Returns the temporary credentials.
     */
    return Credentials;
};

/**
 * Exports the assumeRole function for external use.
 */
export { assumeRole };