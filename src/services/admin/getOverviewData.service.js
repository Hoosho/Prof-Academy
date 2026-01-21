// services/admin/getOverviewData.service.js
import Teacher from '../../models/Teacher.model.js';
import Student from '../../models/Student.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';

/**
 * @desc Get Stats ( Active Students - Total Teachers - Monthly Revenue - Total Courses )
 * @returns { object } Stats
*/
export const getStats = async () => {
  try{
      // Get Stats
      const activeStudents = await Student.countDocuments({ status: 'active' }) || 0;
      const totalTeachers = await Teacher.countDocuments() || 0;
      const monthlyRevenue =  0;
      const totalCourses  = 0;
      
      // Retrun Stats
      return {
        activeStudents,
        totalTeachers,
        monthlyRevenue,
        totalCourses,
      }; 
  }catch(err){
    console.log(`getOverviewDataService.getStats ErrorL: ${err}`);
    throw new ErrorResponse('❌ فشل جلب الإحصائيات العامة!')
  };
};

/**
 * @desc Get Profits Graph For Monthly Revenue 
 * @returns { object }
*/ 
export const getProfitsGraph = async () => {
  try{
    // Return Profits Graph Data
    return{
      label: [], // Months Title
      data: [], // Revenue
    };
  }catch(err){
    console.log(`getOverviewDataService.getProfitsGraph ErrorL: ${err}`);
    throw new ErrorResponse('❌ فشل جلب الرسم البياني لإيردات الشهر العامة!')
  };
};
