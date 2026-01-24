// /src/serviecs/teacher/profCode.service.js
import ProfCode from '../../models/ProfCode.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../system/auditLog.service.js';
import { generateProfCode } from '../../utils/generateCode.util.js';
import mongoose from 'mongoose';

/**
 * @desc Create Prof Codes Service
 * @param { string } teacherId
 * @param { object } { count, value, expiresAt }
 * @returns { object }
*/
export const createProfCodesService = async ( teacherId, { count, value, expiresAt }) => {
  try{
    const codes = [];

    for( let i = 0; i < count; i++ ){
      const code = await generateProfCode( teacherId );
      const newCodes = new ProfCode({
        code,
        value,
        
        expiresAt,
        teacher: teacherId,
        status: 'active'
      });
      await newCodes.save();
      codes.push( newCodes );
    };
  }catch( err ){
    throw err;
  };
};

/**
 * @desc Get Prof Codes Stats
 * @param { string } teacherId
 * @returns { object } { stats }
*/
export const getProfCodesStatsService = async ( teacherId ) => {
  try{
    // Total Prof Codes
    const totalProfCodes = await ProfCode.countDocuments({ teacher: teacherId });
    
    // Total Used Prof Codes
    const totalUsedProfCodes = await ProfCode.countDocuments({ teacher: teacherId, status: 'used' });
    
    // Total Active Prof Codes
    const totalActiveProfCodes = await ProfCode.countDocuments({ teacher: teacherId, status: 'active' });
    
    // Total Expired Prof Codes
    const totalExpiredProfCodes = await ProfCode.countDocuments({ teacher: teacherId, status: 'expired' });

    // Return Stats Obj
    return {
      stats: {
        totalProfCodes,
        totalUsedProfCodes,
        totalActiveProfCodes,
        totalExpiredProfCodes
      }
    };
  }catch( err ){
    throw err;
  };
};

/**
 * @desc Get All Prof Codes Related To Teacher 
 * @param { string } teacherId
 * @param { object } { page, limit, status, search } 
 * @returns { object } { profCodes, pagination }
*/
export const getProfCodesService = async ( teacherId, {
    page = 1, limit = 20, search = '', status = 'all'
}) => {
  try{
    // Sanatize Pagination
    page = Math.max( Number( page ), 1 );
    limit = Math.min( Math.min( Number( limit ), 20 ), 50 );
    const skip = ( page - 1) * limit;

    // Built Filter
    const filter = {
      teacher: teacherId
    };

    // Search 
    if( search.trim() ){
      filter.$or = [
        { code: { $regex: search.trim() }, $options: 'i' }
      ];
    };

    // Status 
    if( status && status !== 'all'){
      filter.status = status;
    };

    // Parallel Queries
    const [ profCodes, totalResults ] = await Promise.all([
      ProfCode.find( filter )
      .select(' _id code value status expiresAt')
      .sort({ createdAt: -1 })
      .skip( skip )
      .limit( limit )
      .lean(),

      ProfCode.countDocuments( filter )
    ]);

    // Return Prof Code Data Paginated
    return {
      profCodes,
      pagination: {
        page,
        limit,
        totalResults,
        totalPages: Math.ceil( totalResults / limit )
      }
    };
  }catch( err ){
    throw err;
  };
};

/**
 * @desc Delete Prof Code Service
 * @param { string } teacherId 
 * @param { string } 
 * @returns { }
*/
export const deleteProfCodeService = async ( teacherId, profCodeIds = [] ) => {
  try{
    // Check If Prof Code IDs Provided 
    if( !profCodeIds ){
      throw new ErrorResponse( 'لم يتم تحديد اي كود!', 400 );
    };

    // Delete Many Prof Codes
    const result = await ProfCode.deleteMany({
      _id: { $in: profCodeIds },
      teacher: teacherId
    });

    // Return Deleted Count
    return{ 
      deletedCount: result.deletedCount
    };
  }catch( err ){
    throw err;
  };
};