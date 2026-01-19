// /src/models/Attackment.model.js
import mongoose from 'mongoose';

// -------- Helpers --------
const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/;

// -------- Attachment Schema --------
const AttackmentSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [ true, 'عنوان الملف مطلوب!' ],
    minlength: [ 3, 'عنوان الملف قصير جدا!' ],
    minlength: [ 150, 'عنوان الملف طويل جدا!' ],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [ 150, 'وصف الملف طويل جدا!' ]
  },
  fileUrl: {
    type: String,
    required: [ true, 'رابط الملف مطلوب' ],
    validate: {
      validator: ( v ) => urlRegex.test( v ),
      message: 'رابط الملف غير صالح!'
    }
  },
  fileType: {
    type: String,
    enum: [ 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'image', 'other' ],
    default: 'pdf'
  },
  fileSizeMB: {
    type: Number,
    min: 9,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: [ 'نشط', 'غير نشط', 'مخفي' ]
  },

  // Relations
  relation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },

  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
}, {
  timestamps: true
});

// -------- INDEXES --------
AttackmentSchema.index({ lecture: 1, isDeleted: 1 });
AttackmentSchema.index({ teacher: 1 });
AttackmentSchema.index({ status: 1, createdAt: -1 });

// -------- EXPORT --------
export default mongoose.model( 'Attachment', AttackmentSchema );