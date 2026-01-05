// models/Student.model.js
import mongoose from "mongoose";

// ---------------- Watched Lecture ----------------
const WatchedLectureSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: [true, "المحاضرة مطلوبة!"],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: [true, "المدرس مطلوب!"],
  },
  watchedAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, "النسبة لا يمكن أن تقل عن 0!"],
    max: [100, "النسبة لا يمكن أن تتجاوز 100!"],
  },
});

// ---------------- Bought Month ----------------
const BoughtMonthSchema = new mongoose.Schema({
  monthId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Month",
    required: [true, "الشهر مطلوب!"],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: [true, "المدرس مطلوب!"],
  },
  pricePaid: {
    type: Number,
    default: 0,
    min: [0, "السعر لا يمكن أن يقل عن 0!"],
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ["ناجحة", "معلقة", "فاشلة"],
      message: "حالة الدفع غير صحيحة!",
    },
    default: "معلقة",
  },
});

// ---------------- Achievements ----------------
const AchievementsSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  achievedAt: { type: Date, default: Date.now },
});

// ---------------- Student ----------------
const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم الطالب مطلوب!"],
      minlength: [3, "اسم الطالب لا يمكن أن يقل عن 3 أحرف!"],
    },

    code: {
      type: String,
      minlength: [0, "الكود لا يمكن أن يقل عن 0!"],
    },

    deviceId: {
      type: String,
      minlength: [0, "معرف الجهاز لا يمكن أن يقل عن 0!"],
    },

    phone: {
      type: String,
      required: [true, "رقم هاتف الطالب مطلوب!"],
      validate: {
        validator: (v) => /^\d{11}$/.test(v),
        message: "رقم الهاتف يجب أن يكون 11 رقم!",
      },
    },

    guardianPhone: {
      type: String,
      required: [true, "رقم هاتف ولي الأمر مطلوب!"],
      validate: {
        validator: (v) => /^\d{11}$/.test(v),
        message: "رقم هاتف ولي الأمر يجب أن يكون 11 رقم!",
      },
    },

    grade: {
      type: String,
      enum: [
        "الصف الأول الإعدادي",
        "الصف الثاني الإعدادي",
        "الصف الثالث الإعدادي",
        "الصف الأول الثانوي",
        "الصف الثاني الثانوي",
        "الصف الثالث الثانوي",
      ],
      required: [true, "الصف الدراسي مطلوب!"],
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    role: {
      type: String,
      enum: ['STUDENT'],
      default: 'STUDENT'
    },

    status: {
      type: String,
      enum: ["نشط", "محظور"],
      default: "نشط",
    },

    cash: {
      type: Number,
      default: 0,
      min: [0, "الرصيد لا يمكن أن يقل عن 0!"],
    },

    boughtMonths: [BoughtMonthSchema],
    watchedLectures: [WatchedLectureSchema],
    achievements: [AchievementsSchema],
  },
  { timestamps: true }
);

// ---------------- Indexes ----------------

// Phone
StudentSchema.index({ phone: 1 }, { unique: true });

// Code
StudentSchema.index({ code: 1 });

// Device Id
StudentSchema.index({ deviceId: 1 });

// Last Login
StudentSchema.index({ lastLogin: -1 });

// Grade
StudentSchema.index({ grade: 1 });

// Watched Lectures 
StudentSchema.index({ "watchedLectures.lectureId": 1 });

// Bought Months
StudentSchema.index({ "boughtMonths.monthId": 1 });

export default mongoose.model("Student", StudentSchema);
