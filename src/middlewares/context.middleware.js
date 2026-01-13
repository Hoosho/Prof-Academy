// middlewares/context.middleware.js

export const contextMiddleware = ( req, res, next ) => {
  try{
    let actor = {
      id: 'SYSTEM',
      type: 'SYSTEM',
      role: null
    };
  
    // Priority: ADMIN > TEACHER > STUDENT
    if( req.admin.id && req.admin.role ){
      actor = {
        id: req.admin.id,
        type: 'ADMIN',
        role: req.admin.role
      };
    }else if( req.teacher.id && req.teacher.role ){
      actor = {
        id: req.teacher,
        type: 'TEACHER',
        role: req.teacher.role
      };
    }else if( req.student.id && req.student.role ){
      actor = {
        id: req.student,
        type: 'STUDENT',
        role: req.student.role
      };
    }

    // Attack Unifie Context To Request 
    req.context = {
      actor,
      context: {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
        deviceId: req.headers['x-device-id'] || null
      }
    };

    next();
  }catch(err){
    console.log(err);
    next(err);
  };
};