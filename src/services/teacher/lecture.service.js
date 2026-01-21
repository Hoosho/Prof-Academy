// /src/services/teacher/lectuere.service.js
import Teacher from '../../models/Teacher.model.js';
import Month from '../../models/Month.model.js';
import Lecture from '../../models/Lecture.model.js';
import Attachment from '../../models/Attachment.model.js';
import Exam from '../../models/Exam.model.js'
import mongoose from 'mongoose';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import { getYoutubeVideoId, getYoutubeVideoInfo } from '../../utils/youtube.util.js';

/**
 * @desc Create New Lecture Service
 * @param { object } req
 * @param { string } teacherId
 * @param { string } monthId
 * @param { object } { title, description, thumbnail, videoUrl, durationMinutes, attachmentCodes, examCode }
 * @returns { object } lectureTitle
*/
export const createLectureService = async ( req, teacherId, monthId, {
  title, description, thumbnail, videoUrl, durationMinutes, attachmentCodes, examCode
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    session.startTransaction();

    // Validate Month And Fetch Id & Title & Grade
    const month = await Month.findById( monthId ).select(' _id title grade').session( session );
    if( !month ) throw new ErrorResponse( '❌ معرف الشهر غير صالح!', 400 );
    
    // Get Video Url Info ( If Need )
    let videoData = null;
    let videoId = null;
    if( videoUrl ){
      // Get Video Id
      videoId = getYoutubeVideoId(videoUrl);
      if (!videoId) throw new ErrorResponse('❌ رابط YouTube غير صالح!', 400);
      
      // If Enter Fields Manuall
      if( !title || !description || !thumbnail || !durationMinutes ){
          videoData = await getYoutubeVideoInfo( videoUrl );
          if (!videoData) throw new ErrorResponse('❌ لم يتم جلب بيانات الفيديو من YouTube!', 400);
      };
    };

    // Check Lectuer Added In This Month Before Or no
    const existingLecture = await Lecture.findOne({
      isDeleted: false, teacher: teacherId, month: monthId, videoId
    });
    if( existingLecture ) throw new ErrorResponse( '❌ تمت إضافة هذه الحصة في هذا الشهر من قبل!', 400 );

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
    // Validate Month And Fetch Id & Title & Grade
    const month = await Month.findById( monthId ).select(' _id ');
    if( !month ) throw new ErrorResponse( '❌ معرف الشهر غير صالح!', 400 );
    

    // Total Lectures
    const totalLectures = await Lecture.countDocuments({
      month: monthId,
      isDeleted: false,
      teacher: teacherId
    });
    // Fetch Lectues ( Total Views & Total Ratings & Total Attachments )
    const lectures = await Lecture.find({
      teacher: teacherId,
      month: monthId,
      isDeleted: false
    }).select(' stats.viewsCount stats.rating stats.ratingsCount attachments').lean();

    let totalViews = 0;
    let totalRatings = 0;
    let totalRatingsCount = 0;
    let totalAttachments = 0;

    lectures.forEach( l => {
      totalViews += l.stats.viewsCount || 0;
      totalRatings += ( l.stats.rating || 0 ) * ( l.stats.ratingsCount );
      totalRatingsCount += l.stats.ratingsCount || 0;
      totalAttachments += ( l.attachments?.length || 0 );
    });
    const averageRatings = totalRatingsCount > 0 ?
    Number( ( totalRatings / totalRatingsCount ).toFixed( 1 ) )
    : 0;

    // Return Stats Obj
    return {
      stats: {
        totalLectures,
        totalViews,
        averageRatings,
        totalAttachments
      }
    };
    // Total Attachment
  }catch( err ){
    throw err;
  };
};

/**
 * @desc Get Lectures Service - Related To Month
 * @param { string } teacherId
 * @param { string } monthId
 * @param { object } { page, limit, search, status }
 * @returns { object } { month, lectures, paginations }
*/
export const getLecturesService = async ( teacherId, monthId, {
  page = 1,
  limit = 10,
  search = '',
  status = 'all'
}) => {
  try{
    // Validate Month And Fetch Id & Title & Grade
    const month = await Month.findById( monthId ).select(' _id title grade ');
    if( !month ) throw new ErrorResponse( '❌ معرف الشهر غير صالح!', 400 );
    
    // Sanitize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
    const skip = ( page - 1 ) * limit;

    // Build Filter
    const filter = {
      isDeleted: false,
      teacher: teacherId,
      month: monthId
    };

    // Search
    if( search.trim() ){
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    };

    // Stats
    if( status && status !== 'all'){
      filter.status = status;
    };

    // Parallel Queries
    const [ lectures, totalResults ] = await Promise.all([
      Lecture.find( filter )
        .select(' _id videoId title description thumbnail durationMinutes attachments status createdAt updatedAt stats.viewsCount stats.rating stats.ratingsCount ')
        .sort({ createdAt: -1 })
        .skip( skip )
        .limit( limit )
        .lean(),

        Lecture.countDocuments( filter )
    ]);

    // Normalize Lectures Obj 
    const normalizedLectures = lectures.map( l => ({
      id: l._id.toString(),
      videoId: l.videoId,
      title: l.title,
      description: l.description,
      thumbnail: l.thumbnail, 
      durationMinutes: l.durationMinutes,
      status: l.status,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,

      viewsCount: l.stats?.viewsCount || 0,
      rating: l.stats?.rating || 0,
      ratingsCount: l.stats?.ratingsCount || 0,

    attachmentsCount: l.attachments?.length || 0
    }));

    // Return Paginated Data
    return {
      month: {
        title: month.title,
        grade: month.grade
      },
      lectures: normalizedLectures,
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