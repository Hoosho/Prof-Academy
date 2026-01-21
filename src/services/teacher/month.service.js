// /src/services/teacher/month.service.js
import Teacher from '../../models/Teacher.model.js';
import Month from '../../models/Month.model.js';
import Student from '../../models/Student.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import mongoose from 'mongoose';

/**
 * @desc Create New Month Service
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
      _id: teacherId, isDeleted: false, status: 'active'
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
      reason: 'Month has been created successfully.',
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


/**
 * @desc Get Months Stats Service
 * @param { string } teacherId
 * @returns { object } stats 
*/
export const getMonthsStatsService = async ( teacherId ) => {
  try{
    // Total Months 
    const totalMonths = await Month.countDocuments({
      isDeleted: false, teacher: teacherId
    });

    // Active Months 
    const totalActiveMonths = await Month.countDocuments({
      isDeleted: false, teacher: teacherId, status: 'active'
    });

    // Inactive Months 
    const totalInactiveMonths = totalMonths - totalActiveMonths || 0;

    // Total Students 
    const totalStudents = await Student.countDocuments({
      isDeleted: false, assignedTeacher: teacherId, status: 'active'
    });

    // Return Stats Obj
    return {
      stats : {
        totalMonths,
        totalActiveMonths,
        totalInactiveMonths,
        totalStudents
      }
    };
  }catch( err ){
    throw err;
  };
};


/**
 * @desc Get All Month Service - Related To Teacher
 * @param { string } teacherId
 * @param { object } { page, limit, search, status, grade }
 * @returns { object } { months, paginations }
*/
export const getMonthsService = async ( teacherId, {
    page = 1, limit = 10, search = '', status = 'all', grade = 'all'
})  => {
  try{
    // Sanatize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
    const skip = ( page - 1 ) * limit;

    // Built Filter Obj
    const filter = {
      isDeleted: false,
      teacher: teacherId
    };

    // Search 
    if( search.trim() ){
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    };

    // Status & Grade Filter
    if( status && status !== 'all' ){
      filter.status = status;
    };
    if( grade && grade !== 'all'){
      filter.grade = grade;
    };

    // Parallel Queries
    const [ months, totalResults ] = await Promise.all([
      Month.find( filter )
      .select(' _id title description thumbnail grade price isFree status publishAt createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip ( skip )
      .limit( limit )
      .lean(),

      Month.countDocuments( filter )
    ]);

    // Return Month Data Paginated
    return {
      months,
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

/**
 * @desc Update Mont Service 
 * @param { object } req
 * @param { string } teacherId
 * @param { string } monthId
 * @param { object } { title, description, thumbnail, grade, price, isFree, status }
 * @returns { string } monthTitle
*/
export const updateMonthService = async ( req, teacherId, monthId, {
  title, description, thumbnail, grade, price, isFree, status 
}) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();
    
    // Validate Teacher
    const teacher = await Teacher.findOne({ _id: teacherId, isDeleted: false });
    if( !teacher ) throw new ErrorResponse( '❌ لم يتم العثور علي بينات المدرس!', 404 );

    // Validate Month 
    const month = await Month.findOne({ _id: monthId, isDeleted: false });
    if( !month ) throw new ErrorResponse( '❌ لم يتم العثور علي بينات الشهر!', 404 );

    // Store Original Month Data Before Updating
    const monthBeforeUpdate = month.toObject();

    // Update Month
    const updateMonth = await Month.findByIdAndUpdate(
      monthId,
      {
        $set: {
          title, description, thumbnail, grade, price, isFree, status 
        }
      },
      {
        new: true, session, runValidators: true, context: 'query'
      }
    );

    // Create Audit Log - Month Has Been Updated Successfully
    await createAuditLog({
      actor: req.context?.actor || {},
      action: 'MONTH.UPDAET',
      target: {
        model: 'Month',
        id: updateMonth._id
      },
      reason: 'Month has been updated successfully.',
      context: req.context?.context || {},
      before: monthBeforeUpdate,
      after: updateMonth.toObject()
    });

    // Commit & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Month Title
    return {
      monthTitle: updateMonth.title
    };
  }catch( err ){
    // Abort & End Session 
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};

/**
 * @dsec Soft Delete Month Service
 * @param { object } req
 * @param { string } teacherId
 * @param { string } monthId
 * @returns { string } monthTitle
*/
export const deleteMonthService = async ( req, teacherId, monthId ) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();
    
    // Validate Teacher
    const teacher = await Teacher.findOne({ _id: teacherId, isDeleted: false });
    if( !teacher ) throw new ErrorResponse( '❌ لم يتم العثور علي بينات المدرس!', 404 );

    // Validate Month 
    const month = await Month.findOne({ _id: monthId, isDeleted: false });
    if( !month ) throw new ErrorResponse( '❌ لم يتم العثور علي بينات الشهر!', 404 );

    // Store Original Month Data Before Delete
    const monthBeforeSoftDelete = month.toObject();

    // Soft Delete Month
    month.isDeleted = true;
    month.deletedAt = Date.now();
    await month.save({ session });

    // Create Audit Log - Month Soft Deleted Successfully
    await createAuditLog({
      actor: req.context?.actor || {},
      action: 'MONTH.SOFT_DELETE',
      target: {
        model: 'Month',
        id: month._id
      },
      reason: 'Month has been soft deleted successfully.',
      before: monthBeforeSoftDelete,
      after: month.toObject()
    });
    
    // Commit & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Month Title
    return {
      monthTitle: month.title
    };
  }catch( err ){
    // Abort & End Session 
    await session.abortTransaction();
    await session.endSession();

    throw err;
  };
};