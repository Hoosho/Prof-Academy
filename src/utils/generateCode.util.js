// /src/utils/generateCode.util.js
import Student from '../models/Student.model.js';

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
