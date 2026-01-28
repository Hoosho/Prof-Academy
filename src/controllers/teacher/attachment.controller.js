// /src/controllers/teacher/attachment.controller.js
import {
  createAttachmentService, getAttachmentStatsService, getAttachmentService
} from '../../services/teacher/attachment.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import cloudinary from '../../config/cloudinary.config.js';

/**
 * @desc Creaet New Attachment 
 * @route POST /api/teacher/attachment
 * @access Private ( Only Teacher )
*/
export const createAttachment = async ( req, res, next ) => {
  try{
    // Take Failds From Req Body
    const {
      title, description, fileType, status
    } = req.body || {};

    // Take Teacher Id From cookies 
    const teacherId = req.teacher.id;
    
    // Check File Uploaded
    if( !req.file ) throw new ErrorResponse( '❌ حدث خطأ اثنار رفع الملف!', 400 );

    
    const originalName = req.file.originalname;
    const cleanName = path
      .parse(originalName)
      .name
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: `attachments/${teacherId}`,
      public_id: cleanName,
    });
    
    // Take File Url Form Req File Path
    const fileUrl = result.secure_url;

    // Take File Size Mb From Cloudainary Respone 
    const fileSizeMB = +(req.file.size / (1024 * 1024)).toFixed(2);


    // Call Create Attachment Service
    const {
      attachmentId, attachmentCode, attachmentTitle
    } = await createAttachmentService( req, teacherId, {
      title, description, fileUrl, fileType, fileSizeMB, status
    });

    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم إنشاء ${ attachmentTitle || '' } بنجاح.`,
      data: {
        attachmentId,
        attachmentCode,
        attachmentTitle
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  }; 
};

/**
 * @desc Get All Attachments
 * @route GET /api/teacher/attachments
 * @access Private ( Only Teacher )
*/
export const getAllAttachments = async ( req, res, next ) => {
  try{
    // Take Fields From Req Query
    const {
      page, limit, status, fileType, search
    } = req.query || {};

    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id; 

    // Call Get Attachments Stats Service
    const { stats } = await getAttachmentStatsService( teacherId );
    
    // Call Get Attachment Service
    const { attachments, pagination } = await getAttachmentService( teacherId, {
      page, limit, status, fileType, search
    });

    // Return Success Response 
    return res.status(200).json({
      success: true,
      data: {
        stats,
        attachments,
        pagination
      }       
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};