// src/services/student/exam.service.js
import mongoose from 'mongoose';
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
  if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );
  
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

  // Add Student In Students Have Entered Exam 
  student.examsTaken.push({
    exam: examId,
    submittedAt: null
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

/**
 * @desc Submit Exam Service
 * @param { object } req
 * @param { string } studentId
 * @param { string } examId
 * @param { object } answers 
 * @returns { object } { exam }
*/
export const submitExamService = async ( req, studentId, examId, answers ) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();

    // Check If Student Exist 
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false
    });
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 400 );
    
    // Check If Exam Exist 
    const exam = await Exam.findOne({
      _id: examId,
      teacher: student.assignedTeacher,
      grade: student.grade,
      status: 'active',
      isDeleted: false
    });
    if( !exam ) throw new ErrorResponse( '❌ الاختبار غير موجود!', 400 );

    // Check IF Student Entered Exam
    const enteredExam = student?.examsTaken?.find(
      ( e ) => e.exam.toString() === examId.toString()
    );

    if( !enteredExam ){
      throw new ErrorResponse(
        '❌ لا يمكن تسليم الاختبار بدون الدخول اليه من قبل!',
        400
      );
    };

    // Check IF Student Submit Exam Before
    if ( enteredExam.status !== 'inProgress' ){
      throw new ErrorResponse(
        '❌ لا يمكن تسليم الاختبار مرتين!',
        400
      );
    };

    // Student Before Changes
    const studentBeforeChanges = student.toObject();
    // Correct Answers 
    let correctAnswers = 0;
    exam.questions.forEach( ( q ) => {
      const studentAnswer = answers.find(
        ( a ) => a.questionId.toString() === q._id.toString()
      );

      if( studentAnswer && studentAnswer.answerIndex === q.correctIndex ){
        correctAnswers++;
      };
    });

    // Counting
    const score = ( ( correctAnswers / exam.questions.length ) * 100 ).toFixed( 2 );

    // Select Status 
    const passingScore = 50;
    const status = score >= passingScore ? 'passed' : 'failed';

    // Recored Exam In Student Model 
    enteredExam.correctAnswers = correctAnswers;
    enteredExam.totalMarks = exam.totalMarks;
    enteredExam.submittedAt = new Date();
    enteredExam.score = score;
    enteredExam.status = status;
    await student.save({ session });

    // Create Autid Log - Exam Has Been Submitted Successfully 
    await createAuditLog({
      actor: req?.context?.actor,
      action: 'EXAM.SUBMIT',
      target: {
        model: 'Student',
        id: student._id
      },
      reason: 'Exam has been submitted successfully ',
      context: req?.context?.context,
      before: studentBeforeChanges,
      after: student.toObject()
    });

    // Commit Transaction & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return 
    return {
      exam: {
        id: exam._id,
        title: exam.title,
        correctAnswers,
        totalMarks: exam.totalMarks,
        submittedAt: new Date(),
        score,
        status
      }
    };
  }catch( err ){
    // Abort Transaction & End Session
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
}