// middlewares/errorHandler.middleware.js
import { isCelebrateError } from 'celebrate';
import { ErrorResponse } from '../utils/errorResponse.util.js';

export const errorHandler = ( err, req, res, next ) => {
  // Joi Errors 
  if (isCelebrateError(err)) {
    const bodyError = err.details.get('body');
    const msg = bodyError
      ? bodyError.details[0].message
      : '❌ خطأ في البيانات المدخلة';

    // تسجيل الخطأ في اللوجات
    // logger.error(`Validation Error: ${msg}`);

    return res.status(400).json({
      success: false,
      msg,
    });
  };

  // Custom Errors
  if( err instanceof ErrorResponse ){
    // logger.error(`Custom Error: ${err}`)
    return res.status(err.statusCode || 400).json({
      success: false,
      msg: err.msg
    });
  };

  // General Errors
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  };
  // logger.error(`Unhandled Error: ${err.message || 'Unknown error'}`);
  return res.status(500).json({
    success: false,
    msg: err.message
  });

};
