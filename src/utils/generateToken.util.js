// /utils/generateToken.util.js
import jwt from 'jsonwebtoken';

/**
 * @desc Generate User Or Teacher Or Admin JWT Token
 * @param { Object } Id & Role
 * @returns { String } Token
*/
export const generateToken = ({ id, role }) => {
  if( role === 'STUDENT' ){
    return jwt.sign (
      { id, role },
      process.env.STUDENT_JWT_SECRET,
      { expiresIn: process.env.STUDENT_JWT_EXPIRES_IN }
    );
  }else if( role === 'TEACHER' ){
    return jwt.sign (
      { id, role },
      process.env.TEACHER_JWT_SECRET,
      { expiresIn: process.env.TEACHER_JWT_EXPIRES_IN }
    );
  }else if( role === 'ADMIN' ){
    return jwt.sign (
      { id, role },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN }
    );
  }; 
};