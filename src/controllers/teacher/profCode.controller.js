// /src/controllers/teacher/profCode.controller.js
import {
  createProfCodesService
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
      count, value, expireDate
    } = req.body || {};

    // Take Teacher Id From Cookies 
    const teacherId = req.teacher.id;
  
    // Call Create Prof Codes Service
    const { codes } = await createProfCodesService( teacherId, { count, value, expireDate });

    // Return Success Res 
    return res.status(200).json({
      success: true,
      msg: `✅ تم إنشاء ${ count } كود, قيمتهم ${ value } بنجاح.` 
    });
  }catch( err ){
    console.log( err );
    next( err );
  };  
};