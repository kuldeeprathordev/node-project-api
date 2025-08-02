/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import {setError} from '../../../utils/utils.js';
import { assumeRole } from '../../../utils/aws/aws-sts.js';

/**
 * Display a listing of the resource.
 */
async function index (req, res) {
	try {
		// Get AWS credentials using STS
		const awsCredentials = await assumeRole();
		
		// Console log the AWS credentials
		console.log('AWS Credentials:',awsCredentials)

		return res.status(200).send({
			ack: true,
			data: awsCredentials,
			message: 'AWS credentials retrieved successfully'
		});
	} catch (e) {
		console.error('Error fetching AWS credentials:', e);
		return res.status(e.status || 500).send({
			ack: false,
			message: setError(e)
		});
	}
}

/**
 * Store a newly created resource in storage.
 */
async function store (req, res) {
	try {
		const requestData = req.body;

		return res.status(201).send({
      ack: true,
      data: requestData,
      message: 'list of resources'
    });
	} catch (e) {
		// If an error occurs during user registration
    // This catch block handles any errors that occur during user registration.
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
	}
}

/**
 * Display the specified resource.
 */
async function show (req, res) {
	try {
		const id = req.params.id;
		return res.status(200).send({
      ack: true,
      data: {},
      message: 'details of resource'
    });
	} catch (e) {
		// If an error occurs during user registration
    // This catch block handles any errors that occur during user registration.
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
	}
}

/**
 * Update the specified resource in storage.
 */
async function update (req, res) {
	try {
		const id = req.params.id;
		const requestData = req.body;

		return res.status(200).send({
      ack: true,
      data: {},
      message: 'updated resource'
    });
	} catch (e) {
		// If an error occurs during user registration
    // This catch block handles any errors that occur during user registration.
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
	}
}

/**
 * Remove the specified resource from storage.
 */
async function destroy (req, res) {
	try {
		const id = req.params.id;
		
		return res.status(200).send({
      ack: true,
      data: {},
      message: 'Deleted resource'
    });
	} catch (e) {
		// If an error occurs during user registration
    // This catch block handles any errors that occur during user registration.
    return res.status(e.status || 500).send({
      ack: false,
      message: setError(e)
    })
	}
}

export {
  index,
  store,
  show,
  update,
  destroy
}
