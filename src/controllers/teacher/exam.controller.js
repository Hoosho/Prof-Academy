// /scr/controllers/teacher/exam.controller.js
import {
  creaetExamService, getExamsStatsService, getExamsService
} from '../../services/teacher/exam.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create An New Exam 
 * @route POST /api/teacher/exam
 * @access Private ( Only Teacher )
*/
export const createExam = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      title, grade, status, durationMinutes, totalMarks, questions
    } = req.body || {};

    // Take Teacher From Cookies
    const teacherId = req.teacher.id;

    // Call Create Exam Service 
    const {
      examId, examTitle
    } = await creaetExamService( req, teacherId, {
      title, grade, status, durationMinutes, totalMarks, questions
    });

    // Return Success Response
    return res.status(201).json({
      success: true,
      msg: `✅ تم إنشاء امتحان ${ examTitle } بنجاح`,
      data: {
        examId,
        examTitle
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Get All Exams
 * @route GET /api/teacher/exmas
 * @access Private ( Only Teacher )
*/
export const GetAllExams = async ( req, res, next ) => {
  try{
    // Take Fields From Queries
    const {
      page, limit, status, search
    } = req.query || {};

    // Take Teacher Id From Queries 
    const teacherId = req.teacher.id;

    // Call Get Exams Stats Service 
    const { stats } = await getExamsStatsService( teacherId );

    // Call Get Exams Service 
    const { exams, pagination } = await getExamsService( teacherId, {
      page, limit, status, search
    });

    // Return Success Response 
    return res.status(200).json({
      success: true,
      data: {
        stats,
        exams,
        pagination
      }       
    });
  }catch ( err ){
    console.log( err );
    next( err );
  };
};