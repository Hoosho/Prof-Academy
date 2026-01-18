// /src/services/teacher/month.service.js
import Teacher from '../../models/Teacher.model.js';
import Month from '../../models/Month.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import mongoose from 'mongoose';

/**
 * @desc Create New Month Service
 * @param { object } req
 * @param { string } teacherId
 * @param { object } { title, description, grade, thumbnail, isFree, price }
 * @returns { string } monthName
*/
export const createMonthService = async ( req, teacherId, {
  title, description, grade, thumbnail, isFree, price
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Create Tranzaction
    await session.startTransaction();

    // Validate Teacher 
    const teacher = await Teacher.findOne({
      _id: teacherId, isDeleted: false, status: 'نشط'
    }).session( session );
    if( !teacher ) throw new ErrorResponse( '❌ المدرس غير موجود', 404 );

    // Check If Month Created Before Or No
    const existingMonth = await Month.findOne({ title, grade }).session(session);
    if( existingMonth ) throw new ErrorResponse( '❌ تمت إضافة هذا الشهر من قبل!', 400 );

    // Create Month 
    const [ newMonth ] = await Month.create(
      [{
        title, description, grade, thumbnail, isFree, price, teacher: teacherId
      }],
      { session }
    );

    // Update Teacher Stats
    await Teacher.findByIdAndUpdate(
      teacherId, {
        $inc: { monthsCount: 1 },
        $push: { months: newMonth._id }
      },
      { session }
    );

    // Create Audit Log - Month Has Been Created Successfully
    await createAuditLog({
      actor: req.context?.actor || {},
      action: 'MONTH.CREATE',
      target: {
        model: 'Month',
        id: newMonth._id
      },
      reason: 'Month Has Been Created Successfully.',
      context: req.context?.context || {},
      after: newMonth.toObject()
    });

    // Commit Transaction
    await session.commitTransaction();
    await session.endSession();
    
    // Return Month Title 
    return {
      monthTitle: newMonth.title
    }
  }catch( err ){
    // Abort Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};