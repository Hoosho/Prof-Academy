// src/services/student/exam.service.js
import Exam from '../../models/Exam.model.js';
import Student from '../../models/Student.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../system/auditLog.service.js';
/**
 * @desc Get Exam 
 * @param { string } studentId
 * @param { string } examId
 * @returns { object } { exam }
*/
export const getExamService = async ( studentId, examId ) => {
  // Check Students Exist Or No 
  const student = await Student.findOne({
    _id: studentId,
    status: 'active',
    isDeleted: false 
  });
  if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود1', 404 );
  
  // Check Exam Is Active Or No 
  const exam = await Exam.findOne({
    _id: examId,
    status: 'active',
    isDeleted: false,
    teacher: student.assignedTeacher,
    grade: student.grade
  });
  if( !exam ) throw new ErrorResponse( '❌ الاختبار غير موجود!', 404 );

  // Check Student Take This Exam Before 
  const alreadyTaken = student.examsTaken
  ?.some( e => e.exam.toString() === examId.toString() );
  if( alreadyTaken ) throw new ErrorResponse( '❌ لا يمكن الدخول للاختبار مرتين!', 400 );

  // Add Student In Students Have Taken Exam 
  student.examsTaken.push({
    exam: examId,
    submittedAt: new Date()
  });

  await student.save();

  // Return Clean Exam Object
  return {
    exam:{
      id: exam._id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      questionsCount: exam.questions.length,  
      questions: exam.questions.map( ( q ) => ({
        id: q._id,
        text: q.text,
        options: q.options
      })),
    }
  };
};