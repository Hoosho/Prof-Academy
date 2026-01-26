// /src/utils/generateCode.util.js
import Student from '../models/Student.model.js';
import Attachment from '../models/Attachment.model.js';
import ProfCode from '../models/ProfCode.model.js';

/**
 * @desc Generate Student Code
*/
export const generateStudentCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6 digits
    const year = new Date().getFullYear();

    code = `PROF-${year}-${randomNumber}`;

    const student = await Student.findOne({ code, isDeleted: false });
    exists = !!student;
  }

  return code;
};

/**
 * @desc Generate Prof Codes 
*/
export const generateProfCode = async ( teacherId ) => {
  let code;
  let exists = true;
  
  while ( exists ){
    const randomNumber = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
    const year = new Date().getFullYear();
    
    code = `PROF-${year}-${randomNumber}`;
    
    // Check If Code Already Exist For This TEacher
    exists = await ProfCode.exists({
      code,
      ...( teacherId && { teacher: teacherId })
    });
  };
  
  return code;
};

/**
 * @desc Generate Attachment Code
*/
export const generateAttachmentCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6 digits
    const year = new Date().getFullYear();

    code = `PROF-ATT-${year}-${randomNumber}`;

    const attachment = await Attachment.findOne({ code, isDeleted: false });
    exists = !!attachment;
  };

  return code;
};