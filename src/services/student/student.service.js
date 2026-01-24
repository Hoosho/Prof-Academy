// /src/services/student/student.service.js
import Student from '../../models/Student.model.js';
import Payment from '../../models/Payment.model.js';
import Month from '../../models/Month.model.js';
import Teacher from '../../models/Teacher.model.js';
import mongoose from 'mongoose';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../system/auditLog.service.js';

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
      actor: req?.actor?.context || {},
      action: 'BUY_MONTH',
      target: {
        model: 'Student',
        id: student._id
      },
      reason: 'Student has been paid successfully.',
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
      monthId: month._id,
      monthTitle: month.title
    };
  }catch( err ){
    // RollBack Everything
    await session.abortTransaction();
    await session.endSession();
    
    throw err;
  };
};