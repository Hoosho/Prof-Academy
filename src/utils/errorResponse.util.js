// utils/errorResponse.util.js

// Class Of Construction Errors In A Unified Format
export class ErrorResponse extends Error {
  constructor(msg, statusCode){
    super(msg); // Pass Error Into App
    this.msg = msg; // Store Msg
    this.statusCode = statusCode; // Status Code
  };
};
