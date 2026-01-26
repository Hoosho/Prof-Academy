// /src/controllers/student/lecture.controller.js 
import {
  getLecturesForMonthService,
} from '../../services/student/lecture.service.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Get Lecture For One Month 
 * @route GET /api/student/:monthId/lectures
 * @access Private ( Only Student )
*/
export const getLecturesForMonth = async ( req, res, next ) => {
  try{
    // Take Month Id From Params
    const monthId = req.params.monthId;

    // Take Student Id From Cookies
    const studentId = req.student.id;
    
    // Call Get Lecture For Month Service 
    const {
      monthTitle, lecturesCount, lecturesMap
    } = await getLecturesForMonthService( studentId, monthId );

    // Return Success Response
    return res.status(200).json({
      success: true,
      data: {
        monthTitle,
        lecturesCount,
        lectures: lecturesMap
      }
    });
  }catch( err ){
    console.log( err );
    next( err );
  };
};