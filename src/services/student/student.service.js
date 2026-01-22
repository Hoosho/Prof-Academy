// /src/services/student/student.service.js
import Student from '../../models/Student.model.js';
import Month from '../../models/Month.model.js';
import Teacher from '../../models/Teacher.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Get Student Months Service
 * @param { string } studentId
 * @returns { object } months
*/
export const getStudentMonthsService = async ( studentId ) => {
  try{
    // Check If Student Exists 
    const student = await Student.findOne({ _id: studentId, isDeleted: false })
    .select(' assignedTeacher, grade boughtMonths ')
    .lean();
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );

    // Check If Teacher Exists 
    const teacher = await Teacher.findById( student.assignedTeacher )
    .select(' _id ');
    if( !teacher ) throw new ErrorResponse( '❌ الطالب غير مشترك مع معلمّ!', 404 );

    // Fetch All Months Related To Student
    const allMonths = await Month.find({
      teacher: student.assignedTeacher,
      grade: student.grade,
      status: 'active',
      isDeleted: false
    })
    .select(' _id title description price thumbnail ')
    .lean();

    // Build Bought Months Map
    const boughtMonthsMap = new Map();
    student.boughtMonths.forEach( ( bm ) => {
      boughtMonthsMap.set( bm.monthId.toString(), true );
    });

    // Buailt Final Res
    const months = allMonths.map( (month ) => {
      const boughtMonths = boughtMonthsMap.get( month._id.toString() );

      return {
        monthId: month._id,
        title: month.title,
        description: month.description,
        thumbnail: month.thumbnail,

        isBought: !!boughtMonthsMap.get( month._id.toString() )
      };
    });

    // Return Months
    return months;
  }catch( err ){
    throw err;
  };
};