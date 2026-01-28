// src/controllers/student/exam.controller.js
import {
  getExamService
} from '../../services/student/exam.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Get Exam 
 * @route GET /api/student/exam/examId
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