// models/Teacher.model.js
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

// -------- Teacher Schema --------
const TeacherSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [ true, 'اسم المدرس مطلوب!' ],
    minlength: [ 3, 'الاسم قصير جدا!'],
    maxlength: [ 50, 'الاسم طويل جدا!'],
    trim: true,
  },
  email: {
    type: String,
    required: [ true, 'الإيميل مطلوب!' ],
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) =>
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/.test(v),
      message: "البريد الإلكتروني غير صالح!",
    },
  },
  phone: {
    type: String,
    required: [ true, 'رقم الهاتف مطلوب!' ],
    validate: {
      validator: (v) => /^\d{11}$/.test(v),
      message: "رقم الهاتف يجب أن يكون 11 رقم!",
    },
  },
  password: {
    type: String,
    required: [ true, 'كلمة المرور مطلوب!' ],
    minlength: [ 6, 'كلمة المرور قصيرة جدا!' ],
    select: false
  },
  subject: {
    type: String,
    required: [ true, 'المادة مطلوبة!' ] 
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: [ 500, 'السيرة الذاتية طويلة جدا!' ],
    default: ''
  },
  stats: {
    monthsCount: {
      type: Number,
      default: 0
    },
    lectureCount: {
      type: Number,
      default: 0
    },

    // Earnings & History & Stats 
    studentsCount: {
      type: Number,
      default: 0
    },
    earnings: [
      {
        amount:{
          type: Number,
          required: true,
          min: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
      }
    ],
    rating: {
      type: Number,
      default: 0
    },
  },

  // Roles & Status
  role: {
    type: String,
    enum:[ 'TEACHER', 'ASSISTANT' ],
    default: 'TEACHER'
  },
  status: {
    type: String,
    enum: [ 'active', 'hidden', 'inactive' ],
    default: 'active'
  },


  // References
  months: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Month'
    },
  ],
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Lecture'
    },
  ],
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Notification'
    },
  ],

  // Security & Login
  deviceId: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  otpCode: {
    type: String,
    select: false,
    default: null
  },
  otpExpires: {
    type: Date,
    select: false,
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  failedOtpAttempts: {
    type: Number,
    default: 0
  },
  otpLockedUntil: {
    type: Date,
    default: null
  },


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

// -------- PRE-SAVE: HASH PASSWORD & OTP (Merged Check) --------
TeacherSchema.pre('save', async function () {
  if (
    (this.isModified('password') && typeof this.password === 'string') ||
    (this.isModified('otpCode') && typeof this.otpCode === 'string')
  ) {
    const salt = await bcrypt.genSalt(12);

    // Hash Passwor d if modified
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, salt);
    };

    // Hash OTP if modified  
    if (this.isModified('otpCode')) {
      this.otpCode = await bcrypt.hash(this.otpCode, salt);
    };
  };
});

// -------- COMPARE METHODS --------
TeacherSchema.methods.comparePassword = async function ( password ) {
  return bcrypt.compare( password, this.password );
};

TeacherSchema.methods.compareOtpCode = async function ( otp ) {
  if ( !this.otpCode ) return false;
  return bcrypt.compare( otp, this.otpCode );
};


// -------- INDEXES --------
// Partial Unique
TeacherSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
TeacherSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

TeacherSchema.index({ assignedTeacher: 1 });
TeacherSchema.index({ isDeleted: 1 });
TeacherSchema.index({ deviceId: 1 });
TeacherSchema.index({ months: 1 });
TeacherSchema.index({ lectures: 1 });
TeacherSchema.index({ role: 1 });
TeacherSchema.index({ lastLogin: -1 });

// -------- EXPORT MODEL --------
export default mongoose.model( 'Teacher', TeacherSchema );