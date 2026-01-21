// /src/models/month.model.js
import mongoose from 'mongoose';

// -------- Helpers --------
const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/;


// -------- Month Schema --------
const MonthSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [ true, 'عنوان الشهر مطلوب!'],
    minlength: [ 3, 'عنوان الشهر قصير جدا!' ],
    maxlength: [ 100, 'عنوان الشهر طويل جدا!' ],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [ 500, 'وصف الشهر طويل جدا!' ],
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

  // Pricing & Access
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },

  // Stats & Analytics
  stats: {
    lecturesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    studentsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalWatchMinutes: {
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
    },
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: [ 'active', 'hidden', 'in' ],
    default: 'active'
  },
  publishAt: {
    type: Date,
    default: null
  },

  // References
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },

  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture'
    }
  ],

  // Soft Delete
    isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// -------- INDEXES --------
MonthSchema.index({ teacher: 1, isDeleted: 1 });
MonthSchema.index({ grade: 1, status: 1 });
MonthSchema.index({ teacher: 1, status: 1, isDeleted: 1 });
MonthSchema.index({ status: 1, publishAt: -1 });
MonthSchema.index({ createdAt: -1 });

// -------- EXPORT MODEL --------
export default mongoose.model( 'Month', MonthSchema );