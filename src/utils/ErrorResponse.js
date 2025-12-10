// /utils/ErrorResponse.js
class ErrorResponse extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  };
};

export default ErrorResponse;
