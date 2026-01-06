// services/admin/teacher.service.js
import mongoose from 'mongoose'; 
import Teacher from '../../models/Teacher.model.js';
import { createAuditLog } from '../system/auditLog.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create Teacher Service 
 * @params { object } name, email, phone, password, subject
 * @returns { object } name
*/ 
export const createTeacherService = async ( data ) => {
  // Start DB Transaction  
  const session = await mongoose.startSession();
  try{
    session.startTransaction();
  
    // Extract Data From Data Obj
    const {
      req, name, email, phone, password, subject
    } = data || {};

    // Vlaidate Required Fields
    if (!name || !phone || !email || !password || !subject) {
      throw new ErrorResponse( '❌ البيانات الأساسية للمدرس غير مكتملة', 400 );
    };
    
    
    // Check If Email Or Phone Exists
    const teacher = await Teacher.findOne({
      $or: [
        { email }, { phone }
      ]
    }).session( session ) ;
    if( teacher ) throw new ErrorResponse( `❌ تمت إضافة هذا المعلم ${ teacher.name || '' } من قبل!`, 400 );

    // Normalize & Prepare Payload
      const teacherPayload = {
        name: name.trim(),
        email: email?.toLowerCase(),
        phone,
        password,
        subject,
        bio: '',
        avatar: '',
        status: 'نشط'   
      };

      // Check Network Connection Before Save Teacher In DB
      if (mongoose.connection.readyState !== 1) {
        throw new ErrorResponse('❌ لا يوجد اتصال بخادم قاعدة البيانات', 503);
      };
      

    // Create Teacher Document
    const [ newTeacher ] = await Teacher.create(
      [ teacherPayload ], { session }
    );
    
    // Create Audit Log - OTP Send Successfully
    await createAuditLog({
      actor: { 
        id: req.admin,
        type: 'TEACHER',
        role: 'TEACHER'
      },  
      action: 'TEACHER.CREATE',
      target: {
        model: 'Teacher',
        id: newTeacher._id
      },
      reason: 'Created Teacher Successfully',
      context: req?.context?.context || {},
      after:{
        ...newTeacher.toObject(), password : undefined
      }
    });
    // Commit Transaction
    await session.commitTransaction();
    session.endSession();
    
    // Return Teacher Name
    return {
      teacherName:newTeacher.name
    };
  }catch(err){
    await session.abortTransaction();
    session.endSession();

    // To Prevent Race Condition Attack
    if(err.code === 11000){
      throw new ErrorResponse(  `❌ تمت إضافة هذا المعلم من قبل!`, 409 )
    };
    console.log(err);
    throw err;
    
  };
};


/**
 * @desc Get Teachers Stats Service 
 * @returns { object } ststs 
*/
export const getTeachersStatsService = async () => {
  try{
    // Check DB Connection
    if (mongoose.connection.readyState !== 1) {
      throw new ErrorResponse('❌ لا يوجد اتصال بخادم قاعدة البيانات', 503);
    };

    // Total Teachers
    const totalTeachers = await Teacher.countDocuments() || 0;

    // Total Active Teachers 
    const totalActiveTeachers = await Teacher.countDocuments({ status: 'نشط' }) || 0;

    // Total Suspended Teachers 
    const totalSuspendedTeachers = totalTeachers - totalActiveTeachers || 0;

    // Rate Average Teachers
    const averageRatingAgg = await Teacher.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = averageRatingAgg[0]?.avgRating || 0;

    // Returns Stats Obj
    return {
      stats: {
        totalTeachers,
        totalActiveTeachers,
        totalSuspendedTeachers,
        averageRating: Number(averageRating.toFixed(1))
      }
    };
    
  }catch(err){
    console.log(err);
    throw err instanceof ErrorResponse
      ? err
      : new ErrorResponse( '❌ حدثت مشكلة أثناء جلب بينات المعلمين!', 500 ); 
  };
};

/**
 * @desc Get All Teachers ( Table ) Service
 * @param { object } page, limit, search, status
 * @returns { object } teachers + paginations
*/
export const getTeachersService = async ({
  page = 1,
  limit = 10,
  search = '',
  status = 'all'
}) => {
  try{
    // Check DB Connection   
    if (mongoose.connection.readyState !== 1) {
      throw new ErrorResponse('❌ لا يوجد اتصال بخادم قاعدة البيانات', 503);
    };

    // Sanitize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
    const skip = ( page - 1 ) * limit;

    // Built filter = {};
    const filter = {};

    if( search.trim() ){
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' }  },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    };

    // Status filter
    if( status && status !== 'all' ){
      filter.status = status;
    };

    // Parallel Queries 
    const [ teachers, totalResults ] = await Promise.all([
      Teacher.find(filter)
        .select( '_id name email phone subject studentsCount  status' )
        .sort({ createdAt: -1 })
        .skip( skip )
        .limit( limit ) 
        .lean(),

        Teacher.countDocuments( filter )
      ]);

      // Return Teacher Data Paginated
      return {
        teachers,
        pagination: {
          page,
          limit,
          totalResults,
          totalPages: Math.ceil( totalResults / limit )
        }
      };
  }catch(err){
    console.log(err);
    throw err instanceof ErrorResponse
      ? err
      : new ErrorResponse( '❌ حدثت مشكلة أثناء جلب بينات المعلمين!', 500 ); 
  };
};

/**
 * @desc Update teacher Service
 * @param { string } teacherId
 * @param { object } {   name, email, phone, subject, status, avatar, bio }
 * @param { object } req ( For Audit )
 * @retunrs { string } teacherName
*/ 
export const updateTeacherService = async ( req, teacherId, {
  name, email, phone, subject, status, avatar, bio
}) => {
  // Open Session In DB
  const session = await mongoose.startSession();
  try{
    // Start DB Transaction
    session.startTransaction();
    
    // Validate Required Fields
    if( !name || !email || !phone || !subject ){
      throw new ErrorResponse( '❌ يرجي إدخال جميع الحقول المطلوبة كاملةَ!', 400 )
    };

    // Check If TeacherId Exists 
    const teacher = await Teacher.findById( teacherId ).session(session);
    if( !teacher ) throw new ErrorResponse( '❌ لم يتم العثور علي هذا المعلم!', 404 )
  
    // Check Email Or Phone Already Exist In Another teacher
    const existsTeacher = await Teacher.findOne({
      _id: { $ne: teacherId },
      $or: [
        { email: email || '' },
        { phone: phone || '' }
      ] 
    }).session(session);
    if( existsTeacher ){
      throw new ErrorResponse(`❌ هذا البريد/رقم الهاتف مستخدم بالفعل لدى ${existsTeacher.name}`, 409);
    };

    // Old Data Of Teacher Before Has Been Updated
    const teacherBeforeUpdate = teacher.toObject();

    // Update Teacher 
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { $set: {
        name, email, phone, subject, status, avatar, bio
      }},
      { new: true, session, runValidators: true, context: 'query' }
    ).lean();

    // Create Audit Log - Teacher Updated Successfully
    await createAuditLog({
      actor: {
        id: req.admin,
        type: 'ADMIN',
        role: 'ADMIN'
      },
      action: 'TEACHER.UPDATE',
      target: {
        model: 'Teacher',
        id: teacher._id
      },
      reason: 'Update Teacher Details.',
      context: req?.context?.context || {},
      before: teacherBeforeUpdate,
      after: updatedTeacher
    });

    // Commit & End Session In DB
    await session.commitTransaction();
    session.endSession();

    // Return Teacher Name
    return {
      teacherName: updatedTeacher.name
    };
  }catch(err){
    await session.abortTransaction();
    await session.endSession();

    console.log(err);
    throw err instanceof ErrorResponse
    ? err
    : new ErrorResponse( `❌حدثت مشكلة أثناء تحديث بينات المعلم ${ teacher.name || '' }!`, 500 ); 
  };
};

/**
 * @desc Delete Teacher Service 
 * @param { string } teacherId
 * @param { object } req
 * @returns { object } teacherName
*/
export const deleteTeacherService = async ( req, teacherId ) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start DB Transaction
    session.startTransaction();

    // Check If Teacher Exists 
    const teacher = await Teacher.findById( teacherId );
    if( !teacher ) throw new ErrorResponse( '❌ لم يتم العثور علي هذا المعلم!', 404 )
  
    // Keep Teacher Data For Audit Before Deletion
    const teacherBeforeDelete = teacher.toObject();

    // Delete Teacher
    await Teacher.deleteOne({ _id: teacherId }).session(session);

      // Create Audit Log - Teacher Deleted Successfully
      await createAuditLog({
      actor: {
        id: req.admin,
        type: 'ADMIN',
        role: 'ADMIN'
      },
      action: 'TEACHER.DELETE',
      target: {
        model: 'Teacher',
        id: teacherId
      },
      reason: 'Delete Teacher.',
      context: req?.context?.context || {},
      before: teacherBeforeDelete,
      after: null
    });

    // Commit & End Session In DB
    await session.commitTransaction();
    session.endSession();

    // Return Teacher Name
    return {
      teacherName: teacherBeforeDelete.name
    };

  }catch(err){
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    throw err instanceof ErrorResponse
      ? err
      : new ErrorResponse( `❌حدثت مشكلة أثناء حذف بينات المعلم ${ teacherBeforeDelete?.name || '' }!`, 500 ); 
  };
};