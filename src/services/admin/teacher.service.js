  // services/admin/teacher.service.js
  import mongoose from 'mongoose'; 
  import Teacher from '../../models/Teacher.model.js';
  import { createAuditLog } from '../system/auditLog.service.js';
  import { ErrorResponse } from '../../utils/errorResponse.util.js';

  /**
   * @desc Create Teacher Service 
   * @param { object } req
   * @param { object } { name, email, phone, password, subject, bio }
   * @returns { string } teacherName
  */ 
  export const createTeacherService = async ( 
    req, { name, email, phone, password, subject, bio }
  ) => {
    // Start DB Transaction  
    const session = await mongoose.startSession();
    try{
      session.startTransaction();

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
          bio: bio || ''
        };

        // Check Network Connection Before Save Teacher In DB
        if (mongoose.connection.readyState !== 1) {
          throw new ErrorResponse('❌ لا يوجد اتصال بخادم قاعدة البيانات', 503);
        };
        

      // Create Teacher Document
      const [ newTeacher ] = await Teacher.create(
        [ teacherPayload ], { session }
      );
      
      // Create Audit Log - Teacher Created Successfully
      await createAuditLog({
        actor: req.context?.actor,
        action: 'TEACHER.CREATE',
        target: {
          model: 'Teacher',
          id: newTeacher._id
        },
        reason: 'Teacher Created Successfully',
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
        teacherName: newTeacher.name
      };
    }catch(err){
      await session.abortTransaction();
      session.endSession();

      // Prevent Race Condition Attack
      if(err.code === 11000){
        throw new ErrorResponse(  `❌ تمت إضافة هذا المعلم من قبل!`, 409 )
      };
      throw err;
    };
  };

  /**
   * @desc Get Teachers Stats Service 
   * @returns { object } ststs 
  */
  export const getTeachersStatsService = async () => {
    try{
      // Total Teachers
      const totalTeachers = await Teacher.countDocuments({ isDeleted: false }) || 0;

      // Total Active Teachers 
      const totalActiveTeachers = await Teacher.countDocuments({ isDeleted: false, status: 'نشط' }) || 0;

      // Total Suspended Teachers 
      const totalSuspendedTeachers = totalTeachers - totalActiveTeachers || 0;

      // Rate Average Teachers
      const averageRatingAgg = await Teacher.aggregate([
        { $match: { rating: { $exists: true }, isDeleted: false } },
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
      throw err
    };
  };

  /**
   * @desc Get All Teachers ( Table ) Service
   * @param { object } { page, limit, search, status }
   * @returns { object } { teachers + paginations }
  */
  export const getTeachersService = async ({
    page = 1,
    limit = 10,
    search = '',
    status = 'all'
  }) => {
    try{
      // Sanitize Pagination
      page = Math.max( Number( page ), 1 );
      limit = Math.min( Math.max( Number( limit ), 1 ), 50 );
      const skip = ( page - 1 ) * limit;

      // Built filter Obj
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
        Teacher.find({ isDeleted: false }, filter)
          .select( '_id name email phone subject bio studentsCount rating status  ' )
          .sort({ createdAt: -1 })
          .skip( skip )
          .limit( limit ) 
          .lean(),

          Teacher.countDocuments( { isDeleted: false }, filter )
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
      throw err
    };
  };

  /**
   * @desc Update teacher Service
   * @param { object } req 
   * @param { string } teacherId
   * @param { object } { name, email, phone, password, subject, status, bio }
   * @retunrs { string } teacherName
  */ 
  export const updateTeacherService = async ( req, teacherId, {
    name, email, phone, password, subject, status, bio
  }) => {
    // Open Session In DB
    const session = await mongoose.startSession();
    try{
      // Start DB Transaction
      session.startTransaction();
      
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
          name, email, phone, subject, status, bio
        }},
        { new: true, session, runValidators: true, context: 'query' }
      );

      // Create Audit Log - Teacher Updated Successfully
      await createAuditLog({
        actor: req.context?.actor || {},
        action: 'TEACHER.UPDATE',
        target: {
          model: 'Teacher',
          id: teacher._id
        },
        reason: 'Update Teacher data.',
        context: req?.context?.context || {},
        before: teacherBeforeUpdate || {},
        after: updatedTeacher.toObject() || {}
      });

      // Update Password If Exist
      if (password && password.trim() !== '') {
        teacher.password = password;
        await teacher.save();

        // Create Audit Log - Password Upated Successfully
        await createAuditLog({
          actor: req.context?.actor || {},
          action: 'TEACHER.UPDATE_PASSWORD',
          target: {
            model: 'Teacher',
            id: teacher._id
          },
          reason: 'Update teacher password successfully.',
          context: req.context?.context || {}
        });
      };

      // Commit Transaction & End Session In DB
      await session.commitTransaction();
      session.endSession();

      // Return Teacher Name
      return {
        teacherName: updatedTeacher.name
      };
    }catch(err){
      // Abort Transaction & End Session
      await session.abortTransaction();
      await session.endSession();

      throw err
    };
  };

  /**
   * @desc Delete Teacher Service 
   * @param { object } req
   * @param { string } teacherId
   * @returns { string } teacherName
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
    
      // Keep Teacher Data For Audit Before Soft Delete
      const teacherBeforeSoftDelete = teacher;

      // Soft Delete Teacher
      teacher.isDeleted = true;
      teacher.deletedAt = new Date();
      await teacher.save({ session });

      // Create Audit Log - Teacher Soft Deleted Successfully
      await createAuditLog({
        actor: req.context?.actor || {},
        action: 'TEACHER.SOFT_DELETE',
        target: {
          model: 'Teacher',
          id: teacher._id
        },
        reason: 'Teacher soft deleted successfully.',
        context: req?.context?.context || {},
        before: teacherBeforeSoftDelete.toObject(),
        after: teacher.toObject(),
      });

      // Commit Transaction & End Session In DB
      await session.commitTransaction();
      session.endSession();

      // Return Teacher Name
      return {
        teacherName: teacher.name
      };

    }catch(err){
      // Abort Transaction & End Session
      await session.abortTransaction();
      session.endSession();

      throw err
    };
  };