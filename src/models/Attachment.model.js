// /src/models/Attachment.model.js
import mongoose from 'mongoose';

// -------- Helpers --------
const urlRegex = /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/;

// -------- Attachment Schema --------
const AttachmentSchema = new mongoose.Schema({
  // Basic Info
  code: {
    type: String,
    required: [ true, 'كود الملف مطلوب!'],
    minlength: [0, "كود الملف لا يمكن أن يقل عن 0!"],
    unique: [ true, 'كود الملف موجود بالفعل!'],
    trim: true
  },
  title: {
    type: String,
    required: [ true, 'عنوان الملف مطلوب!' ],
    minlength: [ 3, 'عنوان الملف قصير جدا!' ],
    maxlength: [ 150, 'عنوان الملف طويل جدا!' ],
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
    enum: [ 'pdf', 'doc', 'docx', 'image', 'xls', 'xlsx', 'csv' ],
    default: 'pdf'
  },
  fileSizeMB: {
    type: Number,
    max: 9,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: [ 'active', 'hidden', 'inactive' ]
  },

  // Relations
  relation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
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
AttachmentSchema.index({ lecture: 1, isDeleted: 1 });
AttachmentSchema.index({ teacher: 1 });
AttachmentSchema.index({ status: 1, createdAt: -1 });

// -------- EXPORT --------
export default mongoose.model( 'Attachment', AttachmentSchema );