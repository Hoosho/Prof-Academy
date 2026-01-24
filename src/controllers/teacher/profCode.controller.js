// /src/controllers/teacher/profCode.controller.js
import {
  createProfCodesService, getProfCodesStatsService, getProfCodes
} from '../../services/teacher/profCode.service.js';

/**
 * @desc Cerate Prof Codes
 * @route POST /api/teacher/prof-code
 * @access Private ( Only Teacher )
*/
export const createProfCodes = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const {
      count, value, expiresAt
    } = req.body || {};

    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id;
  
    // Call Create Prof Codes Service
    await createProfCodesService( teacherId, { count, value, expiresAt });

    // Return Success Res 
    return res.status(201).json({
      success: true,
      msg: `✅ تم إنشاء ${ count } كود, قيمتهم ${ value } بنجاح.`
    });
  }catch( err ){
    console.log( err );
    next( err );
  };  
};

/**
 * @desc Get All Prof Codes 
 * @route GET /api/teacher/prof-code
 * @access Private ( Only Student )
*/
export const getAllProfCodes = async ( req, res, next ) => {
  try{
    // Take Fields From Queries
    const {
      paeg, limit, search, status
    } = req.query || {};

    // Take Teacher Id From Cookies
    const teacherId = req.teacher.id; 
    
    // Call Get Prof Codes Stats Service
    const { stats } = await getProfCodesStatsService( teacherId );

    // Call Get Prof Codes Service
    const { profCodes, pagination } = await getAllProfCodes( teacherId, {
      paeg, limit, search, status
    });

    // Return Success Res With Data
    return res.status(200).json({
      success: true,
      data: {
        stats,
        profCodes,
        pagination,
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  }
};