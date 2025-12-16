// /utils/generateToken.util.js
import jwt from 'jsonwebtoken';

/**
 * @desc Generate Admin JWT Token
 * @param { Object } Username & Role
 * @returns { String } Token
*/
export const generateAdminToken = ( username, role ) => {
  return jwt.sign (
    { username, role },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN }
  );
};

/**
 * @desc Generate User Or Teacher JWT Token
 * @param { Object } Id & Role
 * @returns { String } Token
*/
export const generateUserOrTeacherToken = ( id, role ) => {
  if( role === 'teacher' ){
    return jwt.sign (
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  } else if( role === 'student' ){
    return jwt.sign (
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  };
};