// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import Student from '../models/Student.model.js';
import Teacher from '../models/Teacher.model.js';
import { ErrorResponse } from '../utils/errorResponse.util.js';

// Protect Admin Routes And Verify Token
export const authAdmin = ( req, res, next ) => {
  let token;
  try{
    // Check If Cookies Exists 
    if( req.cookies && req.cookies.adminToken ) {
      token = req.cookies.adminToken;
    };
    if( !token ) throw new ErrorResponse('❌ لازم تسجل دخول الأول!', 401 );

    // Verify Token
    const decoded = jwt.verify( token, process.env.ADMIN_JWT_SECRET );

    if( decoded.role !== 'ADMIN' ) throw new ErrorResponse('❌ انت مش ادمن!', 403 ); 

    // Attach Admin Info To Req
    req.admin = {
      id : decoded.id,
      role : decoded.role,
    };
    next();
  }catch(err){
    console.log(err);
    if( err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ){
      throw new ErrorResponse('❌ التوكن بتاعك مش صحيح او انتهت صلاحيته!', 401 );
    };
    next(err);
  };
};

// Protect Teacher Routes And Verify Token
export const authTeacher = async ( req, res, next ) => {
  let token;
  try{
    if( req.cookies && req.cookies.teacherToken ) {
      token = req.cookies.teacherToken;
    };
    if( !token ) throw new ErrorResponse('❌ انت مش مسجل دخول يا استاذ!', 401 );

    const decoded = jwt.verify( token, process.env.TEACHER_JWT_SECRET );

    if( decoded.role !== 'TEACHER' ) throw new ErrorResponse('❌ انت مش استاذ!', 403 ); 

    const teacher = await Teacher.findById( decoded.id );
    if( !teacher ) throw new ErrorResponse('❌ الاستاذ ده مش موجود!', 401 );

    req.teacher = {
      id : decoded.id,
      role : decoded.role,
    };
    next();
  }catch(err){
    console.log(err);
    if( err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ){
      throw new ErrorResponse('❌ التوكن بتاعك مش صحيح او انتهت صلاحيته!', 401 );
    };
    next(err);
  };
};

// Protect Student Routes And Verify Token
export const authStudent =  async ( req, res, next ) => {
  let token;
  try{
    if( req.cookies && req.cookies.token ) {
      token = req.cookies.token;
    };
    if( !token ) throw new ErrorResponse('❌ انت مش مسجل دخول يا طالب!', 401 );

    const decoded = jwt.verify( token, process.env.STUDENT_JWT_SECRET );

    if( decoded.role !== 'STUDENT' ) throw new ErrorResponse('❌ انت مش طالب!', 403 ); 

    const student = await Student.findById( decoded.id );
    if( !student ) throw new ErrorResponse('❌ الطالب ده مش موجود!', 401 );

    req.student = {
      id : decoded.id,
      role : decoded.role,
    };
    next();
  }catch(err){
    console.log(err);
    if( err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ){
      throw new ErrorResponse('❌ التوكن بتاعك مش صحيح او انتهت صلاحيته!', 401 );
    };
    next(err);
  };
};
