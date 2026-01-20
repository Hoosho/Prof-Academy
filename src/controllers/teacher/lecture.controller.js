// /src/controllers/teacher/lecture.controller.js
import {
  createLectureService, getLectureStatsService, getLecturesService
} from '../../services/teacher/lecture.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create New Lecture
 * @route POST /api/teacher/:id/lecture
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
    const monthId = req.params.id;
  
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
 * @route GET /api/teacher/:id/lectures
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
    const monthId = req.params.id;
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