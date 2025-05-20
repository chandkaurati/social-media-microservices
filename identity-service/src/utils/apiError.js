class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;

    // Maintaining proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}


export default ApiError
