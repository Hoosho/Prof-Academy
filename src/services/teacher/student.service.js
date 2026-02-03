// /src/services/teacher/student.service.js
import mongoose from 'mongoose';
import Student from '../../models/Student.model.js';
import Teacher from '../../models/Teacher.model.js';
import { generateStudentCode } from '../../utils/generateCode.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create New Student
 * @param { string } req
 * @param { string } teacherId
 * @param { string } { name, phone, guardianPhone, grade, cash }
 * @returns  { name } studentName
*/
export const createStudentService = async ( req, teacherId,
  {
    name, phone, guardianPhone, grade, cash
  }
) => {
  // Start Session
  const session = await mongoose.startSession()
  try{
    // Start DB Transaction
    session.startTransaction();

    // Check IF Phone Exist
    const existingStudent = await Student.findOne({
      assignedTeacher: teacherId,
      phone,
      isDeleted: false
    }).session( session );
    if ( existingStudent ) {
      throw new ErrorResponse('❌ هذا الطالب مسجل بالفعل من قبل!', 400);
    };

    // Check IF Student Phone Equal Guardian Phone
    if( phone.toString() === guardianPhone.toString() ){
      throw new ErrorResponse( '❌ مينفعش رقم الطالب يكون رقم ولي الامر!', 400 );
    };

    // Check If Student Phone Equal Teacher Phone
    const teacherExists  = await Teacher.findOne({
      phone,
      isDeleted: false
    }).session( session ).select(' phone ').lean();
    if( teacherExists ) throw new ErrorResponse('❌ هذا الطالب مسجل بالفعل من قبل!', 400); 

    // Generate Prof Code
    const code = await generateStudentCode();

    // Create Student Document
    const [ newStudent ] = await Student.create(
      [{
        code, name, phone, guardianPhone, grade, cash, assignedTeacher: teacherId
      }], { session }
    );

    // Create Audit Log - Student Created Successfully
    await createAuditLog({
      actor: req.context?.actor || {},
      action: 'STUDENT.CREATE',
      target: {
        model: 'Student',
        id: newStudent._id
      },
      reason: 'Student Created Successfully',
      context: req.context?.context || {},
      after: newStudent.toObject()
    });

    // Commit Transaction & End Session
    await session.commitTransaction();
    session.endSession();

    return {
      studentName: newStudent.name
    };
  }catch(err){
    // Abort Transaction & End Session
    await session.abortTransaction();
    session.endSession();

    console.log(err);
    throw err;
  };
};

/**
 * @desc Get Students Stats Service
 * @param { string } teacherId
 * @returns { object } stats
*/
export const getStudentsStatsService = async ( teacherId ) => {
  try{
    // Total Students
    const totalStudents = await Student.countDocuments({
      isDeleted: false, assignedTeacher: teacherId
    });

    // Active Students
    const totalActiveStudents = await Student.countDocuments({
      isDeleted: false, assignedTeacher: teacherId, status : 'active'
    });

    // Total In Active Students
    const totalInActiveStudents = totalStudents - totalActiveStudents || 0;

    // Total Login Today Students 
    const today = new Date();
    today.setHours( 0, 0, 0, 0 );

    const tomorrow = new Date( today );
    tomorrow.setDate( tomorrow.getDate() + 1 );
    const totalLoginTodayStudents = await Student.countDocuments({
      lastLogin: { $gte: today, $lt: tomorrow }, isDeleted: false,
      assignedTeacher: teacherId
    });

    // Returns Stats Obj
    return{
      stats: {
        totalStudents,
        totalActiveStudents,
        totalInActiveStudents,
        totalLoginTodayStudents
      }
    };
  }catch(err){
    throw err;
  };
};

/**
 * @desc Get All Students ( Table ) Service - Related With Teacher
 * @param { object } { object, limit, search, status, grade }
 * @param { string } teacherId
 * @returns { object } { students, paginations }
*/
export const getStudentsService = async (
  teacherId, 
  {
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    grade = 'all'
})  => {
  try{
    // Sanatize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
    const skip = ( page - 1 ) * limit;

    // Buile Filter Obj
    const filter = {
      isDeleted : false,
      assignedTeacher: teacherId
    };

    // Search
    if( search.trim() ){
      filter.$or = [
        { code : { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    };

    // Status & Grade Filter
    if( status && status !== 'all' ){
      filter.status = status;
    };
    if( grade && grade !== 'all' ){
      filter.grade = grade;
    };

    // Parallel Queries
    const [ students, totalResults ] = await Promise.all([
      Student.find( filter )
        .select(' _id deviceId code name phone guardianPhone grade status cash lastLogin deviceId ')
        .sort({ createdAt: -1 })
        .skip( skip )
        .limit( limit )
        .lean(),

        Student.countDocuments( filter )
      ]);

      // Return Student Data Paginated
      return {
        students,
        pagination: {
          page,
          limit,
          totalResults,
          totalPages: Math.ceil( totalResults / limit )
        }
      };
  }catch( err ){
    throw err
  };
};

/**
 * @desc Update Student Service
 * @param { object } req
 * @param { string } teacherId
 * @param { string } studentId
 * @param { object } { name, phone, guardianPhone, status, grade, cash, deviceId }
 * @returns { string } studentName
*/
export const updateStudentService = async (
  req, teacherId, studentId, {
    name, phone, guardianPhone, status, grade, cash, deviceId
  }) => {
  // Start Session
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();

    // Fetch Student Id & teacherId
    const student = await Student.findOne({
      _id: studentId, assignedTeacher: teacherId, isDeleted: false
    }).session( session );
    if( !student ) throw new ErrorResponse( '❌ هذا الطالب غير موجود!', 404 );

    // Store Original State For Audit Before Updating
    const studentBeforeUpdate = student.toObject();

    // Update Student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          name, phone, guardianPhone, status, grade, cash, deviceId
        }
      },
      {
        new: true, session, runValidators: true, context: 'query' 
      }
    );

    // Create Audit Log - Student Updated Successfully
    await createAuditLog({
      actor: req.context?.actor || {},
      action: 'STUDENT.UPDATE',
      target: {
        model: 'Student',
        id: updatedStudent._id,
      },
      reason: 'Update student data',
      before: studentBeforeUpdate,
      after: updatedStudent.toObject()
    });

    // Commit Transaction & End Session
    await session.commitTransaction();
    await session.endSession();
    

    // Return Student Name
    return {
      studentName: updatedStudent.name
    };
  }catch(err){
    // Abort Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    console.log(err);
    throw err;
  };
};

/**
 * @desc Delete Student Service
 * @param { object } required
 * @param { string } teacherId
 * @param { string } studentId
 * @returns { string } studentName
*/
export const deleteStudentService = async ( req, teacherId, studentId ) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start DB Transaction
    await session.startTransaction();

    // Check If Student Exists
    const student = await Student.findOne({
      _id: studentId, isDeleted: false, assignedTeacher: teacherId
    }).session( session );
    if( !student ) throw new ErrorResponse( '❌ هذا الطالب غير موجود!', 404 );

    // Keep Student Data Before Soft Delete
    const studentBeforeSoftDelete = student.toObject();

    // Soft Delete Student
    student.isDeleted = true;
    student.deletedAt = new Date();
    await student.save({ session });
    
    // Create Audit Log - Student Soft Deleted Successfully
    await createAuditLog({
      actor: req.context?.actor || {},
      action: 'STUDENT.SOFT_DELETE',
      target: {
        model: 'Student',
        id: student._id
      },
      reason: 'Student soft deleted successfully.',
      before: studentBeforeSoftDelete,
      after: student.toObject()
    });

    // Commit Transaction & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Student Name
    return {
      studentName: student.name
    };
  }catch( err ){
    // Abort Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};