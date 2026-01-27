// models/Exam.model.js
import mongoose from "mongoose";

// Question Model
const QuestionsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: {
      values: [ 'mcq' ],
      message: ' نوع السؤال غير صحيح! ' 
    },
    required: [ true, '❌ نوع الاختبار مطلوب' ],
    default: 'mcq'
  },
  text: {
    type: String,
    required: [ true, '❌ نص السؤال مطلوب!' ],
    minlength: [ 5, '❌ نص السؤال قصير جدا!'],
    maxlength: [ 250, '❌ نص السؤال كبير جدا!'],
    trim: true
  },
  options: {
    type: [String],
    validate: {
      validator: function (val) {
        if (this.type === "mcq") {
          return (
            Array.isArray(val) &&
            val.length >= 2 &&
            val.length <= 4 &&
            val.every((opt) => typeof opt === "string" && opt.length <= 150)
          );
        }
        return true;
      },
      message:
        "❌ اختيارات MCQ لازم تكون من 2-4 اختيارات، وكل اختيار ≤ 150 حرف",
    },
  },

  correctIndex: {
    type: Number,
    required: [ true, '❌ رقم الإجابة الصحيحة مطلوب!'],
    validate: {
      validator: function( val ){
        return Number.isInteger(val) && val >= 0;
      },
      message: '❌ رقم الإجابة الصحيحة غير صالح!'
    }, 
  }
}, {
  _id: true
});

// Exmas Model 
const ExamSchema = new mongoose.Schema({
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
    required: [ true, '❌ عنوان الاختبار مطلوب!' ],
    trim: true,
    minlength: [ 3, '❌ عنوان الاختبار قصير جدا!' ],
    maxlength: [ 120, '❌ عنوان الاختبار طويل جدا!' ]
  },
  type: {
    type: String,
    enum: [ 'mcq', 'truefalse', 'short' ],
    default: 'mcq'
  },
  grade: {
    type: String,
    enum: {
      values: [
      "الصف الاول الاعدادي",
      "الصف الثاني الاعدادي",
      "الصف الثالث الاعدادي",
      "الصف الاول الثانوي",
      "الصف الثاني الثانوي",
      "الصف الثالث الثانوي",
    ],
    message: '❌ الصف الدراسي غير صالح!'
    },
    required: [true, "الصف الدراسي مطلوب!"],
  },
  status: {
    type: String,
    enum: {
      values: [ 'active', 'hidden', 'inactive' ],
      message: '❌ حالة الصف غير صالحة!'
    },
    default: 'inactive'
  },
  durationMinutes: {
    type: Number,
    required: [ true, '❌ مدة الإختبار مطلوبة!' ],
    min: [ 1, '❌ مدة الإختبار قصيرة جدا!' ],
    max: [ 180, '❌ مدة الإختبار طويلة جدا!' ],
  },
  totalMarks: {
    type: Number,
    required: [ true, '❌ مجموع دراجات الإختبار مطلوبة'],
    min: [ 1, '❌ مجموع دراجات الإختبار صغيرة جدا!'],
    max: [ 120, '❌ مجموع دراجات الإختبار كبيرة جدا!'],
  },

  questions: {
    type: [ QuestionsSchema ],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 120,
      message: "❌ لازم يكون في 1-120 سؤال بالاختبار",
    }
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [ true, 'معرف المعلم مطلوب!' ]
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

// Indexes
ExamSchema.index({ teacher: 1, status: 1, grade: 1, isDeleted: 1 });
ExamSchema.index({ code: 1 });
ExamSchema.index({ title: 'text' });

// Export Exam Model
export default mongoose.model( 'Exam', ExamSchema );