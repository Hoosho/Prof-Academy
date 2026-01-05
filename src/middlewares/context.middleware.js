// middlewares/context.middleware.js

export const contextMiddleware = ( req, res, next ) => {
  try{
    let actor = {
      id: 'SYSTEM',
      type: 'SYSTEM',
      role: null
    };
  
    // Priority: ADMIN > TEACHER > STUDENT
    if( req.admin ){
      actor = {
        id: req.admin,
        type: 'ADMIN',
        role: 'ADMIN'
      };
    }else if( req.teacher ){
      actor = {
        id: req.teacher,
        type: 'TEACHER',
        role: 'TEACHER'
      };
    }else if( req.student ){
      actor = {
        id: req.student,
        type: 'STUDENT',
        role: 'STUDENT'
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