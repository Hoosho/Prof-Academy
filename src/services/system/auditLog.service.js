  // services/system/auditLog.service.js

  import AuditLog from '../../models/AuditLog.model.js';

  /**
   * @desc Create Audit Log.
  */ 
  export const createAuditLog = async (
    { actor, action, target, before = null, after = null, reason = null, context }
  ) => {
    await AuditLog.create({
      actor,
      action,
      target,
      before,
      after,
      reason, 
      context
    });
  };