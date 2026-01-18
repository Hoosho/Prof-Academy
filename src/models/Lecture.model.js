// /src/models/Lecture.model.js

import mongoose from 'mongoose';

// -------- Helpers --------
const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/;

// -------- Lecture Schema --------
const LectureSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [ true, 'عنوان الحصة مطلوب1' ],
    minlength: [ 3, 'عنوان الحصة قصير جدا!' ],
    minlength: [ 150, 'عنوان الحصة طويل جدا!' ],
    trim: true
  },
  description: {
    type: String,
    required: [ true, 'وصف الحصة مطلوب!' ],
    minlength: [ 150, 'وصف الحصة طويل جدا!' ],
    trim: true,
    default: ''
  },
  thumbnail: {
    type: String,
    validate: {
      validator: (v) => !v || urlRegex.test(v),
      message: 'لينك الصورة المصغرة غير صالح!'
    },
    default: ''
  },
  grade: {
    type: String,
    required: [ true, 'المرحلة الدراسية مطلوبة!' ],
    trim: true
  },

  // Video Info
  videoUrl: {
    type: String,
    required: [ true, 'رابط الفيديو مطلوب!' ],
    trim: true
  },
  durationMinutes: {
    type: Number,
    required: [ true, 'مدة المحاضرة طويلة!' ],
    min: [ 1, 'مدة المحاضرة غير صحيحة!' ]
  },

  // Stats
  stats: {
    viewsCount: {
      type: Number,
      default: 0,
      min: 0
    }, 
    rating: {
      type: Number,
      default: 0,
      min: 0
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Status: 
})