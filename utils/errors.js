/**
 *
 */
class BadRequest extends Error {
  constructor(message, hasArray = false) {
    super(message);
    this.name = "BadRequest";
    this.hasArray = hasArray;
    this.status = 400;
  }
}

/**
 *
 */
class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.name = "Unauthorized";
    this.status = 401;
  }
}

/**
 *
 */
class NotAuthorizedError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'NotAuthorizedError';
    this.status = 403;
  }
}

class ValidationError extends Error {
  constructor(message, hasArray = false) {
    const errors = message.map(err => ({ [err.path]: err.message }));
    const transformedErrors = errors.reduce((acc, error) => {
      const [key] = Object.keys(error);
      acc[key] = error[key];
      return acc;
    }, {});
    super(JSON.stringify(transformedErrors));
    this.name = "ValidationError";
    this.hasArray = hasArray;
    this.status = 400;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "InternalServerError";
    this.status = 500;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.status = 409;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
    this.status = 403;
  }
}

class PaymentRequiredError extends Error {
  constructor(message) {
    super(message);
    this.name = "PaymentRequiredError";
    this.status = 402;
  }
}

class MethodNotAllowedError extends Error {
  constructor(message) {
    super(message);
    this.name = "MethodNotAllowedError";
    this.status = 405;
  }
}

class NotAcceptableError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotAcceptableError";
    this.status = 406;
  }
}

class PayloadTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = "PayloadTooLargeError";
    this.status = 413;
  }
}

class UnsupportedMediaTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnsupportedMediaTypeError";
    this.status = 415;
  }
}

class TooManyRequestsError extends Error {
  constructor(message) {
    super(message);
    this.name = "TooManyRequestsError";
    this.status = 429;
  }
}

class RequestHeaderFieldsTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestHeaderFieldsTooLargeError";
    this.status = 431;
  }
}

// Export the error classes
export {
  BadRequest,
  Unauthorized,
  NotAuthorizedError,
  ValidationError,
  InternalServerError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  PaymentRequiredError,
  MethodNotAllowedError,
  NotAcceptableError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  TooManyRequestsError,
  RequestHeaderFieldsTooLargeError  
  // Add other error classes here
};