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
    actor: req.context?.actor || {},
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
 * @param { string } studentId
 * @param { object } { name, email, phone, guardianPhone, grade, cash, deviceId }
 * @returns { string } studentName
*/
export const updateStudentService = async (
  req, teacherId, studentId, { name, email, phone, guardianPhone, grade, cash, deviceId }
) => {
  // Start Session
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    session.startTransaction();

    // Fetch Student Id & teacherId
    const student = await Student.findOne({
      _id: studentId, 'assignedTeacher.teacherId': teacherId
    }).session( session );
    if( !student ) throw new ErrorResponse( '❌ هذا الطالب غير موجود!', 404 );

    // Store Original State For Audit Before Updating
    const studentBeforeUpdate = student.toObject();

    // Update Student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          name, email, phone, guardianPhone, grade, cash, deviceId
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
    session.endSession();
    

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
    session.startTransaction();

    // Check If Student Exists
    const student = await Student.findOne({
      _id: studentId, 'assignedTeacher.teacherId': teacherId, isDeleted: false
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
      action: STUDENT.SOFT_DELETE,
      target: {
        model: 'Student',
        id: student._id
      },
      reason: 'Student soft deleted successfully.',
      before: studentBeforeSoftDelete,
      after: student.toObject()
    });

    // Commit Transaction & End Session
    session.commitTransaction();
    session.endSession();

    // Return Student Name
    return {
      studentName: student.name
    };
  }catch( err ){
    // Abort Transaction & End Session
    session.abortTransaction();
    session.endSession();

    throw err;
  };
};