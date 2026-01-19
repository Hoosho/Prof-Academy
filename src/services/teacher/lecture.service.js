// /src/services/teacher/lectuere.service.js
import {  } from '../../utils/errorResponse.util.js';
import Lecture from '../../models/Lecture.model.js';
import Teacher from '../../models/Teacher.model.js';
import Student from '../../models/Student.model.js';

/**
 * @desc Create New Lecture Service
 * @param { object } req
 * @param { string } teacherId
 * @param { string } monthId
 * @param { object } {  }
 * @returns { object } lectureTitle
*/
export const createLectureService = ( req, teacherId, studentId, {
    
}) => {
  try{
    title, description, videoLink, thumbnail, status,
    { asset: { title, pdfLink }}, { exam: { title, examLink }}
  }catch( err ){

    throw err;
  };
};