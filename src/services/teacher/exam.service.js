// /scr/services/teacher/exam.service.js
import mongoose from 'mongoose';
import Exam from '../../models/Exam.model.js';
import Teacher from '../../models/Teacher.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import { generateExamCode } from '../../utils/generateCode.util.js';

/**
 * @desc Create A New Exam ( MSQ Only )
 * @param { object } req
 * @param { object } teacherId
 * @param { object } { title, grade, status, durationMinutes, totalMarks, questions }
 * @returns { object } { examId, examTitle }
*/
export const creaetExamService = async ( req, teacherId, {
  title, grade, status, durationMinutes, totalMarks, questions
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{ 
    // Start Transaction
    await session.startTransaction();

    // Check If Teacher Exists
    const teacher = await Teacher.findOne({
      _id: teacherId,
      status: 'active',
      isDeleted: false
    }).session( session );
    if( !teacher ) throw new ErrorResponse( '❌ المعلم غير موجود!', 404 );

    // Validate Questions Exist
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new ErrorResponse('❌ يجب أن يحتوي الإختبار علي سؤال واحد علي الأقل!', 400);
    }

    // Validate Total Marks
    if( totalMarks <= 0 ) throw new ErrorResponse( '❌ مجموع الدراجات يجب أن يكون أكبر من صفر!', 400 );
    // Check IF Exam Created Before
    const existingExam = await Exam.findOne({
      title,
      grade,
      isDeleted: false
    }).session( session );
    if( existingExam ) throw new ErrorResponse( '❌ تم إنشاء نفس الإختبار من قبل!', 400 );

    // Generate Exam Code
    const code = await generateExamCode();

    // Normalize Exam Data
    const examPayload = {
      teacher: teacherId,
      code,
      title: title?.trim(),
      grade,
      status: status || 'active',
      durationMinutes: durationMinutes || 30,
      totalMarks: totalMarks || 50,
      questions: questions?.map(q => ({
        type: "mcq", // دلوقتي MCQ only
        text: q.text?.trim(),
        options: q.options || [],
        correctIndex: q.correctIndex
      })) || []
    };

    // Final Validation
    const requiredFields = [
      'teacher', 'code', 'title', 'grade', 'status', 'durationMinutes' , 'totalMarks', 'questions' 
    ];

    for (const field of requiredFields) {
      if (!examPayload[field]) {
        throw new ErrorResponse(`❌ البيانات غير مكتملة: ${field}`, 400);
      };
    };

    // Create Exam
    const [ exam ] = await Exam.create(
      [ examPayload ], { session }
    );

    // Create Audit Log - Exam Has Been Created Successfully
    await createAuditLog({
      actor: req?.context?.actor,
      action: 'EXAM.CREATE',
      target: {
        model: 'Exam',
        id: exam._id
      },
      reason: 'Exam has been created successfully.',
      context: req?.context?.context,
      after: exam.toObject()
    });

    // Commit Transaction && End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Title && Id
    return {
      examId: exam._id,
      examCode: exam.code,
      examTitle: exam.title
    };
  }catch( err ){
    // Abort Transaction && End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};

/**
 * @desc Get Exams Stats Service
 * @param { string } teacherId
 * @returns { object } { stats }
*/
export const getExamsStatsService = async ( teacherId ) => {
  try{
    const stats = await Exam.aggregate([
      {
        $match: {
          teacher: teacherId,
          isDeleted: false
        }
      },
      {
        $facet: {

          // Total Exams 
          totalExams: [
            {
              $count: 'count'
            }
          ],

          // Total Active Exams 
          totalActiveExams: [
            {
              $match: {
                status: 'active'
              }
            },
            {
              $count: 'count'
            }
          ],

          // Total Inactive Exams 
          totalInactiveExams: [
            {
              $match: {
                status: 'inactive'
              }
            },
            {
              $count: 'count'
            }
          ],

          // Total Questions 
          totalQuestions: [
            {
              $unwind: '$questions'
            },
            {
              $count: 'count'
            }
          ]

        }
      }
    ]);

    // Fallback If No Exams
    if( !stats.length ){
      return{
        stats: {
          totalExams: 0,
          totalActiveExams: 0,
          totalInactiveExams: 0,
          totalQuestions: 0
        }
      };
    };

    // Return Stats Obj
    return {
      stats: {
        totalExams: stats[0].totalExams[0]?.count || 0,
        totalActiveExams: stats[0].totalActiveExams[0]?.count || 0,
        totalInactiveExams: stats[0].totalInactiveExams[0]?.count || 0,
        totalQuestions: stats[0].totalQuestions[0]?.count || 0,
      }
    };
  }catch( err ){
    throw err;
  };
};

/**
 * @desc Get All Exams Service
 * @param { string } teacherId
 * @param { object } { page, limit, status, grade, search }
 * @returns { object } { exams, pagination }
*/
export const getExamsService = async ( teacherId, {
  page = 1, limit = 10, status = 'all', grade = 'all', search = ''
}) => {
  try{
    // Sanitize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
    const skip = ( page - 1 ) * limit;

    // Build Filter 
    const filter = {
      teacher: teacherId,
      isDeleted: false
    };

    // Search
    if( search?.trim() ){
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } }
      ]
    };

    // Status && Grade
    if( status && status !== 'all' ){
      filter.status = status;
    };
    if( grade && grade !== 'all' ){
      filter.grade = grade;
    };
    
    // Parallel Queries
    const [ exams, totalResults ] = await Promise.all([
      Exam.find( filter )
      .select(' _id code title grade status durationMinutes totalMarks questions createdAt updatedAt ')
      .sort({ createdAt: -1 })
      .skip( skip )
      .limit( limit )
      .lean(),

      Exam.countDocuments( filter )
    ]);

    // Normalize Exams Data
    const normalizedExams = exams.map( ( e ) => ({
      id: e._id.toString(),
      code: e.code,
      title: e.title,
      grade: e.grade,
      status: e.status,
      durationMinutes: e.durationMinutes,
      totalMarks: e.totalMarks,
      questions: e.questions,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));


    // Return Data Paginated
    return {
      exams: normalizedExams,
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