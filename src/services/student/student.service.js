// /src/services/student/student.service.js
import mongoose from 'mongoose';
import Student from '../../models/Student.model.js';
import Payment from '../../models/Payment.model.js';
import Month from '../../models/Month.model.js';
import Teacher from '../../models/Teacher.model.js';
import ProfCode from '../../models/ProfCode.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../system/auditLog.service.js';
import cloudinary from '../../config/cloudinary.config.js';

/**
 * @desc Get Student Months Service
 * @param { string } studentId
 * @returns { object } months
*/
export const  getStudentMonthsService = async ( studentId ) => {
  try{
    // Check If Student Exists 
    const student = await Student.findOne({ _id: studentId, status: 'active', isDeleted: false })
    .select(' assignedTeacher grade boughtMonths ')
    .lean();
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );

    // Check If Teacher Exists 
    const teacher = await Teacher.findOne({ _id: student.assignedTeacher, status: 'active', isDeleted: false })
    .select(' _id ');
    if( !teacher ) throw new ErrorResponse( '❌ الطالب غير مشترك مع معلم!', 404 );

    // Fetch All Months Related To Student
    const allMonths = await Month.find({
      teacher: student.assignedTeacher,
      grade: student.grade,
      status: 'active',
      isDeleted: false
    })
    .select(' _id title description isFree price thumbnail ')
    .lean();

    // Build Bought Months Map
    const boughtMonthsMap = new Map();
    student.boughtMonths.forEach( ( bm ) => {
      boughtMonthsMap.set( bm.monthId.toString(), true );
    });
    // Buailt Final Res
    const months = allMonths.map((month) => {
      return {
        monthId: month._id,
        title: month.title,
        description: month.description,
        thumbnail: month.thumbnail,
        price: month.price,
        isFree: month.isFree,
        isBought: !!boughtMonthsMap.get(month._id.toString())
      };
    });

    // Return Months
    return {
      months: months
    };
  }catch( err ){
    throw err;
  };
};  

/**
 * @desc Charge Wallet Service
 * @param { object } req
 * @param { string } studentId
 * @param { string } profCode
 * @returns { string } profCodeValue
*/
export const chargeWalletService = async ( req, studentId, code ) => {
  // Satrt Session
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();

    // check IF Student Exists
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false,
    }).session( session );
    if( !student ) throw new ErrorResponse('❌ الطالب غير موجود', 404);

    // Check IF Prof Code Exist
    const profCode = await ProfCode.findOne({
      code,
      status: 'active',
      teacher: student.assignedTeacher,
    });
    if( !profCode ) throw new ErrorResponse( '❌ الكود غير صالح أو مستخدم', 400 );

    // Save Prof Code Before Used 
    const profCodeBeforeUsed = profCode.toObject();
    // Check IF Prof Code Expired 
    if( profCode.expiresAt < new Date() ){
      throw new ErrorResponse( '❌ الكود منتهي الصلاحية!', 400 );
    };

    // Charge Wallet 
    student.cash += profCode.value;
    await student.save({ session });

    // Update Prof Code
    profCode.status = 'used';
    await profCode.save({ session });

    // Create Audit Log - Wallet Has Been Charged Successfully
    await createAuditLog({
      actor: req?.context?.actor || {},
      action: 'WALLET_CHARGE',
      target: {
        model: 'profCode',
        id: profCode._id
      },
      reason: 'Wallet has been charged successfully',
      context: req?.context?.context || {},
      before: profCodeBeforeUsed,
      after: profCode.toObject()
    });

    // Commit Transaction & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return Prof Code Value
    return {
      profCodeValue: profCode.value
    };
  }catch( err ){
    // Abort Transaction & End Session
    await session.abortTransaction();
    await session.endSession();

    throw err;;
  };
};

/**
 * @desc Buy Month Service
 * @param { object } req
 * @param { string } studentId
 * @param { string } monthId
 * @returns { object } { monthId, monthTitle }
*/
export const buyMonthService = async ( req, studentId, monthId ) => {
  // Start Session In DB
  const session = await mongoose.startSession();
  try{
    // Start Transaction
    await session.startTransaction();

    // check If Student Exists
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false
    }).session( session );
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );

    // Check If Month Exists 
    const month = await Month.findOne({
      _id: monthId,
      grade: student.grade,
      teacher: student.assignedTeacher,
      status: 'active',
      isDeleted: false
    }).session( session );
    if( !month ) throw new ErrorResponse( '❌ الشهر غير موجود!', 404 );

    // Check If Already Bought
    const alreadyBought = student.boughtMonths.some(
      ( bm ) => bm.monthId.toString() === monthId
    );
    if( alreadyBought ) throw new ErrorResponse( `⚠️ لقد قمت بشراء شهر ${ month.title } من قبل!`, 400 );

    // Check If Student Can Bought Month
    if( !month.isFree && student.cash < month.price ){
      throw new ErrorResponse( '❌ عذرا رصيد لا يسمح بشراء الشهر!', 400 );
    };

    // Save Student Obj Before Update
    const studentBeforeUpdate = student.toObject();
    // Buy Month
    if( !month.isFree ){
      student.cash -= month.price;
    };

    // Add Month To Student
    student.boughtMonths.push({
      monthId: month._id,
      teacherId: month.teacher,
      pricePaid: month.price,
      paymentStatus: 'paid'
    });
    await student.save({ session });

    // Create Payment Record
    await Payment.create(
      [
        {
          studentId,
          teacherId: student.assignedTeacher,
          monthId,
          amount: month.isFree ? 0 : month.price,
          status: 'paid',
          method: 'prof_code'
        }
      ], {
        session
      }
    );

    // Create Audit Log - Month Has Been Paid Successfully
    await createAuditLog({
      actor: req?.context?.actor || {},
      action: 'BUY_MONTH',
      target: {
        model: 'Student',
        id: student._id
      },
      reason: 'Student has been paid successfully.',
      context: req?.context?.context || {},
      before: studentBeforeUpdate,
      after: student.toObject()
    });


    // Update Month Stats
    await Month.updateOne(
      { _id: monthId },
      { $inc: { 'stats.studentsCount': 1 } },
      { session }
    );

    // Commit Transaction & End Session
    await session.commitTransaction();
    await session.endSession();

    // Return MonthTitle
    return {
      monthTitle: month.title
    };
  }catch( err ){
    // RollBack Everything
    await session.abortTransaction();
    await session.endSession();
    
    throw err;
  };
};

/**
 * @desc Get Profile Service
 * @param { string } studentId
 * @returns { object } { student }
*/
export const getProfileService = async ( studentId ) => {
  try{
    // Check IF Student Exists
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false
    });
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );
    const teacher = await Teacher.findOne({
      _id: student.assignedTeacher,
      status: 'active',
      isDeleted: false
    }).select(' name ').lean();

    // Join Date
    const monthNames = [
      'يناير','فبراير','مارس','أبريل','مايو','يونيو',
      'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
    ];
    const joinDate = new Date(student.createdAt);
    
    // Return Student Data 
    return {
      student: {
        teacherName: teacher.name,
        code: student.code,
        name: student.name,
        grade: student.grade,
        memberSince: `عضو منذ ${monthNames[joinDate.getMonth()]} ${joinDate.getFullYear()}`,
        status: student.status,
        cash: student.cash,
        avatar: student.avatar,
        phone: student.phone,
        guardianPhone: student.guardianPhone,
      }
    }
  }catch( err ){
    throw err;
  };
};

/**
 * @desc Update Student Service
 * @param { object } req
 * @param { string } studentId
 * @param { object } { name, phone, guardianPhone }
 * @returns { object } { studentName }
*/
export const updateStudentService = async ( req, studentId, {
  name, phone, guardianPhone
}) => {
  try{
    // Check IF Student Exists
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false
    });
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );

    // If Profile Changes 
    if( req.file ){      
      const result = await cloudinary.uploader.upload(
        req.file.path, {
          folder: `students/avatars/${ studentId }`,
          public_id: student.name,
          transformation: [{ width: 300, height: 300, crop: 'fill' }]
        }
      );
      student.avatar = result.secure_url;
    };
    
    // Update Student
    student.name = name;
    student.phone = phone;
    student.guardianPhone = guardianPhone;
    await student.save();
    
    // Return Student Name 
    return {
      studentName: student.name
    };
  }catch( err ){
    throw err;
  };
};