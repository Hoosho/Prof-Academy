// /src/serviecs/teacher/profCode.service.js
import ProfCode from '../../models/ProfCode.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../system/auditLog.service.js';
import { generateProfCode } from '../../utils/generateCode.util.js';

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

    return codes;
  }catch( err ){
    throw err;
  };
};