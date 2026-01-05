// controllers/system/audit.controller.js
import AuditLog from '../../models/AuditLog.model.js';

/**
 * @desc Get All Audit Logs
 * @route /api/admin/get-audits
 * @access Private ( Only Admin )
*/
export const getAuditLogs = async ( req, res, next ) => {
  try{
    // Take Pagination From Query 
    let {
      page = 1,
      limit=20,
      action,
      actorType,
      targetModel
    } = req.query;

    // Convert to number
    page = Number(page);
    limit = Number(limit);

    // Validation
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 20;

    const filter = {};

    if( action ) filter.action = action;
    if( actorType ) filter['actor.type'] = actorType;
    if( targetModel ) filter['target.model'] = targetModel;
       
    const logs = await AuditLog.find(filter)
      .sort({ createdAt:-1 })
      .skip( ( page -1 ) * limit )
      .limit( Number(limit) )

    const total = await AuditLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: logs,
      meta: {
        page: Number( page ),
        limit:  Number( limit ),
        total,
        totalPages: Math.ceil( total / limit )
      }
    });
  }catch(err){
    console.log(err);
    next(err);
  };
};