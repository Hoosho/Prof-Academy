// src/controllers/student/exam.controller.js
import {
  getExamService, submitExamService 
} from '../../services/student/exam.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Get Exam 
 * @route GET /api/student/exam/:examId
 * @access Private ( Only Student )
*/
export const getExam = async ( req, res, next ) => {
  try{
    // Take Exam Id From Params 
    const examId = req.params.examId;
    if( !examId ) throw new ErrorResponse( '❌ معرف الاختبار غير موجود!', 404 );

    // Take Student Id From Cookies 
    const studentId = req.student.id;

    // Call Get Exam Service 
    const { exam } = await getExamService( studentId, examId );

    // Return Success Response 
    return res.status(200).json({
      success: true,
      data: {
        exam
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Submit Exam 
 * @route POST /api/student/exam/:examId
 * @access Private ( Only Student )
*/
export const submitExam = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const { answers } = req.body || {};

    // Take StudentId From Cookies 
    const studentId = req.student.id;

    // Take Exam Id From Req Params 
    const examId = req.params.examId;
    if( !examId ) throw new ErrorResponse( '❌ معرف الاختبار غير موجود!', 404 );

    // Call Submit Exam Service 
    const { exam } = await submitExamService( req, studentId, examId, answers );

    // Return Success Resposne 
    return res.status(200).json({
      success: true,
      msg: `✅ تم تسليم اختبار ${ exam.title || '' } بنجاح.`,
      data: {
        exam
      }
    });
  }catch( err){
    console.log( err );
    next( err );
  };
};