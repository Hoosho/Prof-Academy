// models/Exam.model.js
import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema();

// Export Exam Model
export default mongoose.model( 'Exam', ExamSchema );