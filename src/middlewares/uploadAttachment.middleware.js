// /src/middlewares/uploadAttachment.middleware.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js';

// Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: ( req, file ) => ({
      folder: `attachments/${req.teacher.id}`,
      resource_type: 'raw',
      format: 'pdf',
      public_id: file.originalname.replace(/\.[^/.]+$/, "")
  }),
});

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