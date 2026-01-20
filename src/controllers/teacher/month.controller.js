// /src/controllers/teacher/month.controller.js
import {
  createMonthService, getMonthsStatsService, getMonthsService, updateMonthService, deleteMonthService
} from '../../services/teacher/month.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Create New Month
 * @route POST /api/teacher/month
 * @access Private ( Only Teacher )
*/
export const createMonth = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      title, description, grade, thumbnail, isFree, price
    } = req.body || {};

    // Validate Required Fields
    // if( !title || !description || !grade || !price ){
    //   throw new ErrorResponse( '❌ يجب إدخال جميع البينات!', 400 );
    // };

    // Take Teacher Id From Cookies
    const teacherId = req.teacher.id;

    // Call Create Month Service
    const { monthTitle } = await createMonthService( req, teacherId, {
      title, description, grade, thumbnail, isFree, price
    });
    
    // Return Success Response
    return res.status(201).json({
      success: true,
      msg: `✅ تم إنشاء الشهر ${ monthTitle }, بنجاح.`
    });
  }catch( err ){
    console.log(err );
    next( err )
  };
};

/**
 * @desc Get All Months With Stats
 * @route GET /api/teacher/months
 * @access Private ( Only Teacher )
*/
export const getAllMonth = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      page, limit, search, status, grade
    } = req.query || {};

    // Take Teacher Id From Cookies
    const teacherId = req.teacher.id;

    // Call Months Stats Service
    const { stats } = await getMonthsStatsService( teacherId );
    
    // Call Get Months Service
    const {
      months, pagination
    } = await getMonthsService(
      teacherId, { page, limit, search, status, grade }
    );
    
    // Return Success Response
    return res.status(200).json({
      success: true,
      data: {
        stats,
        months,
        pagination,
      }       
    });
  }catch( err ){
    console.log(err );
    next( err )
  };
};

/**
 * @desc Create Month
 * @route PUT /api/teacher/month/:id
 * @access Private ( Only Teacher )
*/
export const updateMonth = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      title, description, grade, thumbnail, isFree, price
    } = req.body || {};

    // Validate Required Fields
    if( !title || !description || !grade || !price ){
      throw new ErrorResponse( '❌ يجب إدخال جميع البينات!', 400 );
    };

    // Take Teacher Id From Cookies
    const teacherId = req.teacher.id;

    // Take Month Id From Param
    const monthId = req.params.id;
    if( !monthId ){
      throw new ErrorResponse( '❌ لم يتم العثور علي الطالب!', 400 );
    };

    // Call Update Month Service
    const { monthTitle } = await updateMonthService( req, teacherId, monthId, {
      title, description, grade, thumbnail, isFree, price
    });
    
    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم تحديث الشهر ${ monthTitle }, بنجاح.`
    });
  }catch( err ){
    console.log(err );
    next( err )
  };
};

/**
 * @desc Delete Month
 * @route DELETE /api/teacher/month/:id
 * @access Private ( Only Teacher )
*/
export const deleteMonth = async ( req, res, next ) => {
  try{
    // Take Teacher Id From Cookies
    const teacherId = req.teacher.id;
    
    // Take Month Id From Param
    const monthId = req.params.id;
    if( !monthId ){
      throw new ErrorResponse( '❌ لم يتم العثور علي الطالب!', 400 );
    };
    
    // Call Update Month Service
    const { monthTitle } = await deleteMonthService( req, teacherId, monthId );
    
    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم حذف الشهر ${ monthTitle }, بنجاح.`
    });
  }catch( err ){
    console.log(err );
    next( err )
  };
};