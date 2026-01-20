// /src/services/teacher/lectuere.service.js
import Teacher from '../../models/Teacher.model.js';
import Month from '../../models/Month.model.js';
import Lecture from '../../models/Lecture.model.js';
import Attachment from '../../models/Attachment.model.js';
import Student from '../../models/Student.model.js';
import mongoose from 'mongoose';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import { getYoutubeVideoInfo } from '../../utils/youtube.util.js';

/**
 * @desc Create New Lecture Service
 * @param { object } req
 * @param { string } teacherId
 * @param { string } monthId
 * @param { object } { title, description, thumbnail, videoUrl, durationMinutes }
 * @returns { object } lectureTitle
*/
export const createLectureService = async ( req, teacherId, monthId, {
  title, description, thumbnail, grade, videoUrl, durationMinutes, attachmentCodes, examCode
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    session.startTransaction();

    // Validate Month And Fetch Id & Title & Grade
    const month = await Month.findById( monthId ).select(' _id title grade');
    if( !month ) throw new ErrorResponse( '❌ معرف الشهر غير صالح!', 400 );
    
    // Get Video Url Info ( If Need )
    let videoData = null;
    if( !title || !description || !thumbnail || !durationMinutes ){
      videoData = await getYoutubeVideoInfo( videoUrl );
    };

    // Attachments & Exam
    // Prepare Relations
    let attachmentIds = [];
    let examId  = null;

    // Fetch Attachments
    if( attachmentCodes?.length ){
      const attachments = await Attachment.find({
        code: { $in: attachmentCodes },
        teacher: teacherId,
        isDeleted: false
      }).session( session );

      if( attachments.length !== attachmentCodes.length ){
        throw new ErrorResponse('❌ واحد أو أكثر من أكواد الملفات غير صحيحة', 400);
      };

      attachmentIds = attachments.map( a => a._id )
    };

    // Fetch Exam
    if( examCode ){
      const exam = await Exam.findOne({
        code: examCode,
        teacher: teacherId,
        isDeleted: false
      }).session( session );

      if( !exam ){
        throw new ErrorResponse( '❌ كود الامتحان غير صحيح!');
      };

      examId = exam._id;
    };

    // Validate VideoId
    const videoId = videoData?.videoId || null;
    if( !videoId ) throw new ErrorResponse( '❌ لم يتم جلب معرف الفيديو من YouTube!', 400 );

    
    // Normalize Lecture Data
    const lecturePayload = {
      videoId,
      title: title || videoData?.title,
      description: description || videoData?.description,
      thumbnail: thumbnail || videoData?.thumbnail,
      durationMinutes: durationMinutes || videoData?.durationMinutes,
      grade: month.grade,
      
      exam: examId,
      attachments: attachmentIds,

      month: monthId,
      teacher: teacherId,
      publishedAt: Date.now() 
    };

    // Final Validation
    const requiredFields = [
      'videoId', 'title', 'description', 'durationMinutes', 'grade', 'teacher', 'month'
    ];

    for( const field of requiredFields ){
      if( !lecturePayload[ field ]){
        throw new ErrorResponse( `❌ البيانات غير مكتملة: ${ field }`, 400 );
      };
    };

    // Create Lecture
    const [ newLecture ] = await Lecture.create(
      [ lecturePayload ], { session }
    );

    // Create Audit Log - Lecture Has Been Created Successfully
    await createAuditLog({
      actor: req?.context?.actor || {},
      action: 'LECTURE.CREATE',
      target: {
        model: 'Lecture',
        id: newLecture._id,
      },
      reason: 'Lecture has been created successfully.',
      context: req?.context?.context || {},
      after: newLecture.toObject()
    });

    // CommitTransaction & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Month & Lecture Title 
    return {
      monthTitle: month.title,
      lectureTitle: newLecture.title
    };
  }catch( err ){
    // Aboart Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};

/**
 * @dsec Get Lecture Stats Service
 * @param { string } teacherId
 * @param { string } monthId
 * @return { object } stats
*/
export const getLectureStatsService = async ( teacherId, monthId ) => {
  try{
    // Total Lecture

    // Total Views

    // Total 
  }catch( err ){
    throw err;
  };
};