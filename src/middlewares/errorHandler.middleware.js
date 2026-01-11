// middlewares/errorHandler.middleware.js
import { isCelebrateError } from 'celebrate';
import { ErrorResponse } from '../utils/errorResponse.util.js';

export const errorHandler = ( err, req, res, next ) => {
  if (isCelebrateError(err)) {
    const validationType = ['body', 'query', 'params', 'headers']
      .find(key => err.details.get(key));

    const errorDetails = err.details.get(validationType);

    const msg = errorDetails
      ? errorDetails.details[0].message
      : '❌ خطأ في البيانات المدخلة';

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
      msg: err.msg // In Production use msg not intenal error like   msg: '❌ حدث خطأ غير متوقع'
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
