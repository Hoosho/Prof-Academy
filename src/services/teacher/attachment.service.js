// /src/services/teacher/attachment.service.js
import mongoose from 'mongoose';
import Teacher from '../../models/Teacher.model.js';
import Attachment from '../../models/Attachment.model.js';
import { generateAttachmentCode } from '../../utils/generateCode.util.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
/**
 * @desc Create New Attachment Service
 * @param { object } req
 * @param { string } teacherId
 * @param { object } { title, description, fileUrl, fileType, fileSizeMB, status }
 * @retunrs { string } attachmentTitle
*/
export const createAttachmentService = async ( req, teacherId, {
  title, description, fileUrl, fileType, fileSizeMB, status
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();

    // Check If Teacher Exist
    const teacher = await Teacher.findOne({
      _id: teacherId,
      status: 'active',
      isDeleted : false
    }).session( session );
    if( !teacher ) throw new ErrorResponse( '❌ المعلم غير موجود!', 404 );

    // Generate Attachment Code
    const code = await generateAttachmentCode();

    // Check If Attachmnt Is Exists
    const existingAttachment = await Attachment.findOne({
      teacher: teacherId, fileSizeMB
    }).session( session );
    if( existingAttachment ) throw new ErrorResponse( '❌ تمت إضافة هذا الملحق من قبل!!', 400 );

    // Create Attachment
    const [ attachment ] = await Attachment.create([
      {
        teacher: teacherId,
        code, title, description, fileUrl, fileType, fileSizeMB, status
      },
    ], {
      session
    });

    // Create Audit Log - Attachment Has Been Created Successfully
    await createAuditLog({
      actor: req?.context?.actor || {},
      action: 'ATTACHMENT.CREATE',
      target: {
        model: 'Attachment',
        id: attachment._id
      },
      reason: 'Attachment has been created successfully',
      context: req?.context?.context || {},
      after: attachment.toObject()
    });

    // Commit Transaction && End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Attachment Id & Title
    return{
      attachmentId: attachment._id,
      attachmentCode: attachment.code,
      attachmentTitle: attachment.title
    };
  }catch( err ){
    // Abort Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};

/**
 * @desc Get Attachments Stats Service 
 * @param { string } teacherId
 * @returns { object } stats
*/
export const getAttachmentStatsService = async ( teacherId ) => {
  try{
    const stats = await Attachment.aggregate([
      {
        $match: {
          teacher: new mongoose.Types.ObjectId( teacherId ), 
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,

          // Total Attachments
          totalAttachments: { $sum: 1 },
          
          // Active Attachments
          activeAttachments: {
            $sum: {
              $cond: [ { $eq: [ '$status', 'active' ] }, 1, 0 ]
            }
          },

          // Total Size 
          totalSizeMB: {
            $sum: {
              $sum: {
                $ifNull: [ 'fileSizeMB', 0 ]
              }
            },
            
          },
          // Last Upload At
          lastUploadAt: { $max: '$createdAt' }
        },
      }
    ]);

    // Fallback If No Attachments
    if( !stats.length ){
      return{
        stats: {
          totalAttachments: 0,
          activeAttachments: 0,
          totalSizeMb: 0,
          lastUploadAt: null
        }
      };
    };

    // Return Stats Obj
    return {
      stats: {
        totalAttachments: stats[0].totalAttachments,
        activeAttachments: stats[0].activeAttachments,
        totalSizeMb: Number((stats[0]?.totalSizeMb || 0).toFixed(1)),
        lastUploadAt: stats[0].lastUploadAt
      }
    };
  }catch( err ){
    throw err;
  };
};
/**
 * @desc 
 * @param { string } teacherId
 * @param { object } { page, limit, status, fileType, search }
 * @returns { object } { attachments, pagination }
*/ 
export const getAttachmentService = async ( teacherId, {
  page = 1, limit = 10, status = 'all', fileType = 'all', search = ''
}) => {
  try{
    // Sanatize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
    const skip = ( page - 1 ) * limit;

    // Build Filter
    const filter = {
      teacher: teacherId,
      isDeleted: false
    };

    // Search 
    if( search.trim() ){
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } }
      ];
    };

    // Status & fileType
    if( status && status !== 'all' ){
      filter.status = status;
    };
    if( fileType && fileType !== 'all' ){
      filter.fileType = fileType;
    };

    // Parallel Queries
    const [ attachments, totalResults ] = await Promise.all([
      Attachment.find( filter )
      .select(' _id code title description fileUrl fileType fileSizeMB status ')
      .sort({ createdAt: -1 })
      .skip( skip )
      .limit( limit )
      .lean(),

      Attachment.countDocuments( filter )
    ]);

    const normalizedAttachment = attachments.map( ( att ) => ({
      id: att._id.toString(),
      code: att.code,
      title: att.title,
      description: att.description,
      fileUrl: att.fileUrl,
      fileSizeMb: att.fileSizeMB,
      status: att.status
    }));

    return {
      attachments: normalizedAttachment,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages: Math.ceil( totalResults / limit ) 
      }
    };
  }catch( err ){ 
    throw err;
  };
};