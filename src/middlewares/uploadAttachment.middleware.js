// /src/middlewares/uploadAttachment.middleware.js
import multer from 'multer';

// Storage
const storage = multer.diskStorage({});

const fileFilter = ( req, file, cb ) => {
  if( file.mimetype !== 'application/pdf' ){
    return cb( new Error( 'Only PDF Files Are Allowed' ), false );
  };
  cb( null, true );
};

export const uploadAttachment = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: {
      fileSize: 10 * 1024 * 1024, // 10MB
    }
  }
});