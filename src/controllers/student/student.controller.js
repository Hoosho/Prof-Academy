// /src/controllers/student/student.controller.js
import {
  getStudentMonthsService, chargeWalletService, buyMonthService
} from '../../services/student/student.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Get Student Months
 * @route /api/student/months
 * @access Private ( Only Student )
*/
export const getStudentMonths = async ( req, res, next ) => {
  try{
    // Get Student Id From Cookie
    const studentId = req.student.id;
    if( !studentId ) throw new ErrorResponse( '❌ لم يتم العثور علي معرف الطالب!' );

    // Call Get Student Service
    const { months } = await getStudentMonthsService( studentId );

    // Return Success Response 
    return res.status(200).json({
      success: true,
      data: months || []
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};

/**
 * @desc Charge Wallet
 * @route POST /api/student/charge-wallet
 * @access Private ( Only Student )
*/
export const chargeWallet = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const { code } = req.body || {};

    // Take Student Id From Cookies
    const studentId = req.student.id;

    // Call Charge Wallet Service
    const { profCodeValue } = await chargeWalletService( req, studentId, code );

    // Return Success Response
    return res.status( 200 ).json({
      success: true,
      msg: `✅ تم شحن المحفظة بقيمة ${ profCodeValue || '' } بنجاح`,
    });
  }catch( err ){
    console.log( err );
    throw err;
  };
};

/**
 * @desc Buy Month
 * @route POST /api/student/buy-month/:monthId
 * @access Private ( Only Student )
*/
export const buyMonth = async ( req, res, next ) => {
  try{
    // Take Fields From Req Body
    const monthId = req.params.monthId || {};
    console.log('monthId from params:', req.params.monthId, typeof req.params.monthId);
    
    // Take Student Id From Cookies 
    const studentId = req.student.id;

    // Call Buy Month Service
    const { monthTitle } = await buyMonthService( req, studentId, monthId );

    // Return Success Response
    return res.status(200).json({
      success: true,
      msg: `✅ تم شراء شهر ${ monthTitle } بنجاح.`,
      data: {
        monthId,
        monthTitle
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};