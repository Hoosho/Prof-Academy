// /src/services/studnet/auth.service.js
import Student from '../../models/Student.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { generateToken } from '../../utils/generateToken.util.js';
import { createAuditLog } from '../system/auditLog.service.js';

/**
 * @desc Student Login
 * @param { object } req
 * @param { object } { code, deviceId }
 * @returns { object } studentName
*/
export const studentLoginService = async ( req, { code, deviceId } ) => {
  try{
    // Check If Student Exists With Code
    const student = await Student.findOne({ isDeleted : false, code });
    if( !student ){
    };

    // Check Status 
    if( student.status !== 'active' ){
      await createAuditLog({
        actor: {
          id: student._id,
          model: student.role,
          type: 'STUDENT'
        },
        action: 'AUTH.LOGIN.BLOCKED.STATUS',
        target: {
          model: 'Student',
          id: student._id
        },
        reason: `Account Status: ${student.status}`,
        context: req.context?.context || {}
      });
      throw new ErrorResponse('❌ البيانات غير صحيحة!', 401);
    };

    // If first Time Take: Device Id Entered, And Save In Student Doc In DB
    if( !student.deviceId || student.deviceId.trim() === '' ){
      student.deviceId = deviceId;
      // Create Audit Log - Success Login First Device Trusted  
      await createAuditLog({
        actor: {
          id: student._id,
          model: student.role,
          type: 'STUDENT'
        },
        action: 'AUTH.LOGIN.FIRST_DEVICE.TRUSTED',
        target: {
          model: 'Student',
          id: student._id
        },
        reason: 'First login, device trusted',
        context: req.context?.context || {}
      });
    }
    
    // Compare Device Id
    else if( student.deviceId !== deviceId ){
      // Create Audit Log - Success Login First Device Trusted  
      await createAuditLog({
        actor: {
          id: student._id,
          model: student.role,
          type: 'STUDENT'
        },
        action: 'AUTH.LOGIN.CREDENTIALS.FAIL',
        target: {
          model: 'Student',
          id: student._id
        },
        reason: 'Correct Code But Wrong Device Id',
        context: req.context?.context || {}
      });
      throw new ErrorResponse('❌ البيانات غير صحيحة!', 401);
    };

    // Add Time In Last Login 
    student.lastLogin = Date.now();
    // save last login & deviceId In Db If Need Saving 
    await student.save();

    // Generate Token
    const token = await generateToken({ id: student._id, role: student.role });
    // Create Audit Log - Student Login Successfully 
    await createAuditLog({
      actor: {
        id: student._id,
        role: student.role,
        type: 'STUDENT'
      },
      action: 'AUTH.LOGIN.CREDENTIALS.SUCCESS',
      target: {
        model: 'Student',
        id: student._id
      },
      reason: 'Student login successfully',
      context: req.context?.context || {}
    });

    // Return Student Name 
    return {
      token,
      studentName: student.name
    };
  }catch(err){
    throw err;
  };
};

/**
 * @desc Auth Me Service
 * @param { string } studentId
 * @returns { object } { student }
*/
export const authMeService = async ( studentId ) => {
  try{
    // Check IF Student Exists
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false
    }).select(' _id name avatar').lean();
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );

    // Return Student Data 
    return {
      student: {
        name: student.name,
        avatar: student.avatar,
      }
    };
  }catch( err ){
    throw err;
  };
};