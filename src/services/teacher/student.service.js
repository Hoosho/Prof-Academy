// /src/services/teacher/student.service.js
import mongoose from 'mongoose';
import Student from '../../models/Student.model.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create New Student
 * @param { string } req
 * @param { string } payload
 * @returns  { name } name
*/
export const createStudentService = async ( req, teacherId, teacherRole, payload ) => {
  // Start Session
  const session = await mongoose.startSession()
  try{
    // Start DB Transaction
    session.startTransaction();

  // Take Fields From Payload Obj
  const {
    name, email, phone, guardianPhone, grade, cash
  } = payload;

  // Validate Require Fields
  if( !name || !email || !guardianPhone || !grade ){
    throw new ErrorResponse( '❌ يجب إدخال جميع البينات!' )
  };

  // Check IF Phone Or Email Exist
  const existingStudent = await Student.findOne({
    $or: [
      { email }, { phone }
    ]
  }).session( session );
  if( existingStudent ){
    const alreadyAssigned = existingStudent.assignedTeacher
      ?.some( t => t.teacherId.toString() === teacherId.toString() );

    if( alreadyAssigned ){
      throw new ErrorResponse( '❌ هذا الطالب مسجل بالفعل من قبل!', 400 );
    };
  };


  // Create Student Document
  const [ newStudent ] = await Student.create(
    [{
      name, email, phone, guardianPhone, grade, cash, assignedTeacher: [{ teacherId }]
    }], { session }
  );

  // Create Audit Log - Student Created Successfully
  await createAuditLog({
    actor: {
      id: teacherId,
      type: 'TEACHER',
      role: teacherRole
    },
    action: 'STUDENT.CREATE',
    target: {
      model: 'Student',
      id: newStudent._id
    },
    reason: 'Student Created Successfully',
    context: req.context?.context || {},
    after: {
      ...newStudent.toObject()
    }
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

    // Prevent Race Condition
    if( err.code === 11000 ){
      throw new ErrorResponse( '❌ تمت إضافة هذا الطالب من قبل!' )
    };

    console.log(err);
    throw err;
  };
};

/**
 * @desc Update Student Service
 * @param { object } req
 * @param { string } teacherId
 * @param { string } teacherRole
 * @param { string } studentId
 * @param { object } payload
*/
export const updateStudentService = async (
  req, teacherId, teacherRole, studentId, payload
) => {
  // Start Session
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    session.startTransaction();

    // Fetch Student Id & teacherId
    const student = await Student.findOne({
      _id: studentId, 'assignedTeacher?.teacherId': teacherId
    }).session( session );
    if( !student ) throw new ErrorResponse( '❌ هذا الطالب غير موجود!', 404 );

    // Store Original State For Audit Before Updating
    const beforeUpdate = student.toObject();


  }catch(err){
    console.log(err);
    throw err;
  }
}