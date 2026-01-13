export const contextMiddleware = (req, res, next) => {
  try {
    let actor = {
      id: 'SYSTEM',
      type: 'SYSTEM',
      role: null
    };
    // Priority: ADMIN > TEACHER > STUDENT
    if (req.admin && req.admin.id && req.admin.role) {
      actor = {
        id: req.admin.id,
        role: req.admin.role,
        type: 'ADMIN',
      };
    } else if (req.teacher && req.teacher.id && req.teacher.role) {
      actor = {
        id: req.teacher.id,
        role: req.teacher.role,
        type: 'TEACHER'
      };
    } else if (req.student && req.student.id && req.student.role) {
      actor = {
        id: req.student.id,
        role: req.student.role,
        type: 'STUDENT'
      };
    }

    // Attach Unified Context To Request
    req.context = {
      actor,
      context: {
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
        deviceId: req.headers['x-device-id'] || null
      }
    };

    next();
  } catch (err) {
    console.error('Context Middleware Error:', err);
    next(err);
  }
};