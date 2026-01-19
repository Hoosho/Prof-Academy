// /src/services/teacher/lectuere.service.js
import Teacher from '../../models/Teacher.model.js';
import Month from '../../models/Month.model.js';
import Lecture from '../../models/Lecture.model.js';
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
 * @param { object } { title, description, thumbnail, grade, videoUrl, durationMinutes }
 * @returns { object } lectureTitle
*/
export const createLectureService = async ( req, teacherId, monthId, {
  title, description, thumbnail, grade, videoUrl, durationMinutes
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    session.startTransaction();
    
    // Get Video Url Info ( If Need )
    let videoData = null;
    if( !title || !description || !thumbnail || !durationMinutes ){
      videoData = await getYoutubeVideoInfo( videoUrl );
    };

    // Normalize Lecture Data
    const lecturePayload = {
      videoId: videoData.videoId,
      title: title || videoData?.title,
      description: description || videoData?.description,
      thumbnail: thumbnail || videoData?.thumbnail,
      durationMinutes: durationMinutes || videoData?.durationMinutes,
      videoUrl,
      grade,
      month: monthId,
      teacher: teacherId,
      publishedAt: Date.now() || null
    };

    // Final Validation
    const requiredFields = [
      'title', 'description', 'durationMinutes', 'grade', 'teacher', 'month'
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

    // Return Lecture Title 
    return {
      lectureTitle: newLecture.title
    };
  }catch( err ){
    // Aboart Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};