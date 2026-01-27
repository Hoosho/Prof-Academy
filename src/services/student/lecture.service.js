// /src/student/service/student.service.js
import Student from '../../models/Student.model.js';
import Month from '../../models/Month.model.js';
import Lecture from '../../models/Lecture.model.js';
import { ErrorResponse } from '../../utils/errorResponse.util.js';
import { createAuditLog } from '../../services/system/auditLog.service.js';
import Exam from '../../models/Exam.model.js';
import Attachment from '../../models/Attachment.model.js';

/**
 * @desc Get Lecture For One Month Service
 * @param { string } studntId
 * @param { string } monthId
 * @returns { object }
*/
export const getLecturesForMonthService = async ( studentId, monthId ) => {
  try{
    // Check If Students Exists 
    const student = await Student.findOne({
      _id: studentId,
      status: 'active',
      isDeleted: false
    })
    .select(' boughtMonths watchedLectures assignedTeacher ')
    .lean();
    if( !student ) throw new ErrorResponse( '❌ الطالب غير موجود!', 404 );

    // Check If Month Exists
    const month = await Month.findOne({
      _id: monthId,
      teacher: student.assignedTeacher,
      status: 'active',
      isDeleted: false
    });
    if( !month ) throw new ErrorResponse( '❌ الشهر غير موجود!', 404 );

    // Check If Student Bought Month 
    const isBought = student.boughtMonths.some(
      bm => bm.monthId.toString() === monthId
    );
    if( !isBought ) throw new ErrorResponse('❌ لم يتم شراءالشهر!', 403 );

    const lectures = await Lecture.find({
      teacher: student.assignedTeacher,
      month: monthId,
      status: 'active',
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .select(' _id title description thumbnail grade videoId durationMinutes exam attachments ')
    .lean();
    if( !lectures.length ) throw new ErrorResponse( '❌ المحاضرات غير موجود!', 404 );

    // Map On Boughted Lectures Related To Month Id
    const lecturesMap = await Promise.all(
      lectures.map( async ( l ) => {  
        // Fetch Exam If exists
        let examData = null;
        if( l.exam ){   
          const exam = await Exam.findOne({
            _id: l.exam,
            status: 'active',
            isDeleted: false,
            teacher: student.assignedTeacher
          })
          .select(' _id code title durationMinutes questions ')
          .lean()

          if( exam ){
            examData = {
              id: exam._id,
              title: exam.title,
              totalQuestions: exam.questions.length,
              durationMinutes: exam.durationMinutes
            };
          };
        };

        // Fetch Attachments If exist 
        let attachmentsData = [];
        if( Array.isArray( l.attachments ) && l.attachments.length > 0  ){
          const attachments = await Attachment.find({
            _id: { $in: l.attachments },
            isDeleted: false,
            status: 'active',
            teacher: student.assignedTeacher
          })
          .select(' _id title fileType fileSizeMB fileUrl ')
          .lean()
          attachmentsData = attachments.map( ( att ) => ({
            id: att._id,
            title: att.title,
            fileType: att.fileType,
            fileSizeMB: att.fileSizeMB,
            fileUrl: att.fileUrl
          }));
        };

        // Return Lecture Data 
        return {
          id: l._id,
          title: l.title,
          description: l.description,
          thumbnail: l.thumbnail,
          grade: l.grade,
          videoId: l.videoId,
          durationMinute: l.durationMinutes,
          exam: examData,
          attachments: attachmentsData
        }
      })
    ); 

    // Prepare Response
    return {
      monthTitle: month.title,
      lecturesCount: lecturesMap.length,
      lecturesMap,
    };
  }catch( err ){
    throw err;
  };
};