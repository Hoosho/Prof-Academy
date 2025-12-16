// /services/admin/auth.service.js
import bcrypt from 'bcryptjs';
import { generateAdminToken } from '../../utils/generateToken.util.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Validate Admin Credentials
 * @param { string } username 
 * @param { string } password
 * @returns { object } { token } 
*/
export const adminLoginService = async ( username, password ) => {
  // Stored Credentials
  const storedUsername = process.env.ADMIN_USERNAME;
  const storedpassword = process.env.ADMIN_PASSWORD;
  
  // Check Username 
  if( username !== storedUsername ) throw new ErrorResponse( '❌ اسم المستخدم أو الباسورد غلط', 401 );
  
  // Check Password
  const isMatch = await bcrypt.compare( password, storedpassword );
  if( !isMatch ) throw new ErrorResponse( '❌ اسم المستخدم أو الباسورد غلط', 401 );

  const token = generateAdminToken({ username, role: 'admin' });

  return { token }
};
