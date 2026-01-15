// controllers/admin/teacher.controller.js
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import {
  createTeacherService, getTeachersStatsService, getTeachersService, updateTeacherService, deleteTeacherService
} from '../../services/admin/teacher.service.js';

/**
 * @desc Crate New Teacher
 * @route POST /api/admin/teacher
 * @access Private ( Only Admins ) 
*/
export const createTeacher = async ( req, res, next ) => {
  try{
    // Extract Data From Req Body
    const {
      name, email, phone, password, subject, bio
    } = req.body || {}; 

    // Vlaidate Require Fields
    if ( !name || !phone || !email || !password || !subject ){
      throw new ErrorResponse( '❌ البيانات الأساسية للمدرس غير مكتملة', 400 );
    };

    // Create New Teacher Instance
    const { teacherName } = await createTeacherService( 
      req, { name, email, phone, password, subject, bio }
    );

    // Return Success Response
    return res.status(201).json({
      success: true,
      msg: `✅ تم إنشاء حساب المعلم ${ teacherName || '' }, بنجاح.`
    });
  }catch(err){
    console.log(err);
    next( err );
  };
};

/**
 * @desc Get All Teachers With Stats
 * @route GET /api/admin/teachers
 * @access Private ( Only Admins )
*/
export const getAllTeachersWithStats = async ( req, res, next ) => {
  try{
    // Take Queries Of Filteration & Pagination If Exists  
    const {
      page, limit, search, status  
    } = req.query || {};
      
    // Call Teachers Stats Service
    const { stats } = await getTeachersStatsService();

    // Call Get Teachers Service
    const {
      teachers, pagination
    } = await getTeachersService({
      page, limit, search, status
    });

    // Return Success Response With Data
    return res.status(200).json({
      success: true,
      data: {
        stats,
        teachers,
        pagination
      }
    });
  }catch(err){
    console.log(err);
    next( err );
  };
};

/**
 * @desc Update Teacher
 * @route PUT /api/admin/teacher/:id
 * @access Private ( Only Admins )
*/
export const updateTeacher = async ( req, res, next ) => {
  try{
    // Take Data From Req Body
    const {
      name, email, phone, password, subject, status, bio
    } = req.body || {};

    // Take Teacher Id From Params
    const teacherId = req.params.id || {};
    
    // Validate Required Fields
    if( !name || !email || !phone || !subject  ){
      throw new ErrorResponse( '❌ يرجي إدخال جميع الحقول المطلوبة كاملةَ!', 400 )
    };

    // Call Update Teacher Service
    const { teacherName } = await updateTeacherService(
      req, teacherId, {
        name, email, phone, password, subject, status, bio
      }
    );
    
    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم تحديث بينات المعلم ${ teacherName || '' } بنجاح.`
    });
  }catch(err){
    console.log(err);
    next( err );
  };
};

/**
 * @desc Delete Teacher
 * @route DELETE /api/admin/teacher/:id
 * @access Private ( Only Admins )
*/
export const deleteTeacher = async ( req, res, next ) => {
  try{
    // Take Teacher Id From Params
    const teacherId = req.params.id || {};
    
    // Validate Required Fields
    if( !teacherId ) throw new ErrorResponse( '❌ يرجي إدخال جميع الحقول المطلوبة كاملةَ!', 400 ); 

    // Call Delete Teacher Service
    const { teacherName } = await deleteTeacherService(
      req, teacherId
    );
    
    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم حذف بينات المعلم ${ teacherName || '' } بنجاح.`
    });
  }catch(err){
    console.log(err);
    next( err );
  };
};