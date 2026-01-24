// /src/controllers/teacher/student.controller.js
import {
  createStudentService, getStudentsStatsService, getStudentsService, updateStudentService, deleteStudentService 
} from '../../services/teacher/student.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create Student
 * @rotue POST /api/teacher/student
 * @access Private ( Only Teacher )
*/
export const createStudent = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      name, phone, guardianPhone, grade, cash,
    } = req.body || {};

    // Validate Require Fields 
    if( !name || !phone || !guardianPhone || !grade || !cash ){
      throw new ErrorResponse( '❌ يجب إدخال جميع البينات!', 400 );
    };

    // Take Teacher Id From Cookie
    const teacherId = req.teacher.id;

    // Call Create Student Service
    const { studentName } = await createStudentService( req, teacherId, {
      name, phone, guardianPhone, grade, cash
    });

    // Return Success Response
    return res.status(201).json({
      success: true,
      msg: `✅ تم إنشاء الطالب ${ studentName }, بنجاح.`
    });
  }catch(err){
    console.log(err);
    next(err);
  };
};

/**
 * @desc Get All Students With Stats
 * @route GET /api/teacher/students
 * @access Private ( Only Teacher )
*/
export const getAllStudents = async ( req, res, next ) => {
  try{
    // Take Queries Of Filteration & Pagination If Exists 
    const {
      page, limit, search, status, grade
    } = req.query || {};

    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id;

    // Call Students Stats Service
    const { stats } = await getStudentsStatsService( teacherId );

    // Call Get Students Service
    const {
      students, pagination
    } = await getStudentsService(
      teacherId, { page, limit, search, status, grade }
    );

    // Return Success Response
    return res.status(200).json({
      success: true,
      data: {
        stats,
        students,
        pagination,
      }
    });
  }catch(err){
    console.log(err);
    next(err);
  };
};

/**
 * @desc Update Students By Id
 * @route PUT /api/teacher/student/:id
 * @access Priavate ( Only Teacher )
*/
export const updateTeacher = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      name, phone, guardianPhone, grade, cash, deviceId
    } = req.body || {};

    // Validate Require Fields
    if( !name || !phone || !guardianPhone || !grade || !cash || !deviceId ){
      throw new ErrorResponse( '❌ يجب إدخال جميع البينات!', 400 );
    };
    // Take Teacher Id From Cookies
    const teacherId = req.teacher.id;
    
    // Take Student Id From Params
    const studentId = req.params.id;
    if( !studentId ){
      throw new ErrorResponse( '❌ لم يتم العثور علي الطالب!', 400 )
    };

    // Call Update Teacher Service
    const { teacherName } = await updateStudentService( req, teacherId, studentId, 
      { name, phone, guardianPhone, grade, cash, deviceId }
    );
  
    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم تحديث بينات الطالب ${ teacherName }, بنجاح.`
    });
  }catch(err){
    console.log(err);
    next( err );
  };
};

/**
 * @desc Delete Student 
 * @route DELETE /api/teacher/student/:id
 * @access Private ( Only Teacher )
*/
export const deleteStudent = async ( req, res, next ) => {
  try{
    // Take Teacher Id From Cookie 
    const teacherId = req.teacher.id;

    // Take Student Id From Params
    const studentId = req.params.id;
    if( !studentId ){
      throw new ErrorResponse( '❌ لم يتم العثور علي الطالب!', 400 );
    };

    // Call Delete Student Service
    const { teacherName } = await deleteStudentService( teacherId, studentId );

    // Return Success Response 
    return res.status(200).json({
      success: true,
      msg: `✅ تم مسح بينات الطالب ${ teacherName }, بنجاح`
    });
  }catch(err){
    console.log(err);
    next( err );
  };
};