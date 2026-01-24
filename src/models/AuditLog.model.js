// models/AuditLog.model.js
import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  actor: {
    // Who Performed The Action 
    id: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    type: {
      type: String,
      enum: [ 'ADMIN', 'TEACHER', 'STUDENT', 'SYSTEM' ],
      required: true,
    },
    role: {
      type: String,
      default: null
    },
  },

  // What Action Was Performed
  action: {
    type: String,
    required: true,
    index: true,
    enum: [
      // TEACHER
      "TEACHER.CREATE",
      "TEACHER.UPDATE",
      "TEACHER.UPDATE_PASSWORD",
      "TEACHER.SOFT_DELETE",
      "TEACHER.DELETE",

      // MONTH
      "MONTH.CREATE",
      "MONTH.UPDAET",
      "MONTH.SOFT_DELETE",
      
      // Lecture
      "LECTURE.CREATE",
      // STUDENT
      "STUDENT.CREATE",
      "STUDENT.UPDATE",
      "STUDENT.SOFT_DELETE",
      "STUDENT.DELETE",

      'BUY_MONTH',

      // AUTH
      'AUTH.LOGIN.CREDENTIALS.SUCCESS',
      'AUTH.LOGIN.CREDENTIALS.FAIL',

      'AUTH.LOGIN.FIRST_DEVICE.TRUSTED',
      
      'AUTH.LOGIN.BLOCKED.LOCKED',
      'AUTH.LOGIN.BLOCKED.STATUS',
      'AUTH.LOGIN.OTP.REQUIRED.NEW_DEVICE',
      'AUTH.OTP.SENT',
      'AUTH.OTP.FAIL',
      'AUTH.OTP.VERIFIED',
      "AUTH.LOGOUT",
      
      // FINANCE
      "EARNINGS.ADDED",
      "EARNINGS.WITHDRAW",

      // DEVICE
      "DEVICE.BOUND",
      "DEVICE.UNBOUND",

      // SYSTEM
      "SYSTEM.CRON.RUN",
    ],
  },

  // Target
  target: {
    model: {
      type: String,
      required: false
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
  },

  // State Before & After Change 
  before: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  after: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Request Context
  context: {
    ip: String,
    userAgent: String,
    deviceId: String,
  },

  // Reason
  reason: {
    type: String,
    default: null
  }
},{
  timestamps: true,
  versionKey: false
});


//  Prevent any update or delete on audit logs
AuditLogSchema.pre(
  [
    "updateOne",
    "deleteOne",
    "findOneAndUpdate",
    "findByIdAndUpdate",
    "findByIdAndDelete"
  ],
  function () {
    throw new Error("❌ Audit logs are immutable");
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });


export default mongoose.model("AuditLog", AuditLogSchema);
