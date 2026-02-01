// /src/controllers/teacher/lecture.controller.js
import {
  createLectureService, getLectureStatsService, getLecturesService, updateLectureService, deleteLectureService 
} from '../../services/teacher/lecture.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create New Lecture
 * @route POST /api/teacher/:monthId/lecture
 * @access Private ( only Teacher )
*/
export const createLecture = async ( req, res, next ) =>{
  try{
    // Take Fields From Req Body
    const {
      title, description, thumbnail, grade, videoUrl, durationMinutes, attachmentCodes, examCode
    } = req.body || {};

    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id;

    // Take Month Id From Params
    const monthId = req.params.monthId;
  
    // Call Create Lecture Service
    const { monthTitle, lectureTitle } = await createLectureService( req, teacherId, monthId, {
      title, description, thumbnail, grade, videoUrl, durationMinutes, attachmentCodes, examCode
    });

    // Return Success Response
    return res.status(201).json({
      success: true,
      msg: `✅ تمت اضافة حصة ${ lectureTitle || '' } الي شهر ${ monthTitle || '' }. `
    }); 
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Get All Lectures
 * @route GET /api/teacher/:monthId/lectures
 * @access Private ( only Teacher )
*/
export const getAllLectures = async ( req, res, next ) => {
  try{
    // Take Queries From Req Query 
    const {
      page, limit, search, status
    } = req.query || {};

    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id;

    // Take Month Id From Params
    const monthId = req.params.monthId;
    if( !monthId ) throw new ErrorResponse( '❌ معرف الشهر غير موجود!', 400 );

    // Call Lectues Stats Service
    const { stats } = await getLectureStatsService( teacherId, monthId );
    
    // Call Get Lecures Service
    const {
      month, lectures, pagination
    } = await getLecturesService( teacherId, monthId, {
      page, limit, search, status
    });

    // Return Success Response
    return res.status(200).json({
      success: true,
      data: {
        stats,
        month,
        lectures,
        pagination,
      }       
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};

  /**
   * @desc Update Lecture
   * @route PUT /api/teacher/:monthId/lecture/:lectureId
   * @access Private ( Only Teacher )
  */
  export const updateLectuer = async ( req, res, next ) => {
    try{
      // Take Fields From Req Body
      const {
        title, description, thumbnail, videoUrl, status, durationMinutes, attachmentCodes, examCode
      } = req.body || {};
      
      // Take Teacher Id From Cookies 
      const teacherId = req.teacher.id;
      
      // Take Lecture & Month Id From Req Params
      const {
        monthId, lectureId
      } = req.params || {};

      if( !monthId ) throw new ErrorResponse( '❌ معرف الشهر غير موجود!', 404 );
      if( !lectureId ) throw new ErrorResponse( '❌ معرف المحاضرة غير موجود!', 404 );

      // Call Update Lecture Service
      const { lecture } = await updateLectureService( req, teacherId, monthId, lectureId, {
        title, description, thumbnail, videoUrl, status, durationMinutes, attachmentCodes, examCode
      });

      // Return Success Response 
      return res.status(200).json({
        success: true,
        msg: `✅ تم تحديث محاضرة ${ lecture.title } بنجاح.`,
        data: {
          lecture
        }
      });
    }catch( err ){
      console.log( err );
      next( err );
    };
  };

/**
 * @desc Delete Lecture
 * @route PUT /api/teacher/:monthId/lecture/:lectureId
 * @access Private ( Only Teacher )
*/
export const deleteLectuer = async ( req, res, next ) => {
  try{
    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id;

    // Take Lecture & Month Id From Req Params
    const {
      monthId, lectureId
    } = req.params || {};

    if( !monthId ) throw new ErrorResponse( '❌ معرف الشهر غير موجود!', 404 );
    if( !lectureId ) throw new ErrorResponse( '❌ معرف المحاضرة غير موجود!', 404 );

    // Call Update Lecture Service
    const { lecture } = await deleteLectureService( req, teacherId, monthId, lectureId );

    // Return Success Response 
    return res.status(200).json({
      success: true,
      msg: `✅ تم حذف محاضرة ${ lecture.title } بنجاح.`,
      data: {
        lecture
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};