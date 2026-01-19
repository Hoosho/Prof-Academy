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
    maxlength: [ 150, 'عنوان الحصة طويل جدا!' ],
    trim: true
  },
  description: {
    type: String,
    required: [ true, 'وصف الحصة مطلوب!' ],
    maxlength: [ 150, 'وصف الحصة طويل جدا!' ],
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

  // Status
  status: {
    type: String,
    enum: [ 'نشط', 'غير نشط', 'مخفي' ],
    default: 'نشط'
  },
  publishAt: {
    type: Date,
    default: null
  },

  // Relations
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  month: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Month',
    required: true
  },

  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deleteAt: {
    type: Date,
    default: null
  },
}, {
  timestamps: true
});

// -------- INDEXES --------
LectureSchema.index({ teacher: 1, month: 1, isDeleted: 1 });
LectureSchema.index({ month: 1, status: 1 });
LectureSchema.index({ status: 1, publishAt: -1 });
LectureSchema.index({ createdAt: -1 });

// -------- EXPORT --------
export default mongoose.model( 'Lecture', LectureSchema );