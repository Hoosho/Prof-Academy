// models/Teacher.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// -------- Earnings History --------
const EarningsSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, "قيمة الأرباح مطلوبة!"],
    min: [0, "الأرباح لا يمكن أن تكون أقل من 0!"],
  },
  source: {
    type: String,
    enum: ["اشتراكات", "سحوبات", "مكافآت"],
    default: "اشتراكات",
  },
  createdAt: { type: Date, default: Date.now },
});

// -------- Teacher --------
const TeacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "اسم المدرس مطلوب!"],
      minlength: [3, "الاسم لا يمكن أن يقل عن 3 أحرف"],
    },
    
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) =>
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/.test(
            v
          ),
        message: "البريد الإلكتروني غير صالح!",
      },
    },

    phone: {
      type: String,
      validate: {
        validator: (v) => /^\d{11}$/.test(v),
        message: "رقم الهاتف يجب أن يكون 11 رقم!",
      },
    },

    password: {
      type: String,
      required: [true, "الرقم السري مطلوب!"],
      minlength: [6, "الرقم السري يجب أن يكون 6 أحرف على الأقل!"],
      select: false,
    },

    subject: {
      type: String,
      required: [true, "المادة مطلوبة!"],
    },

    bio: {
      type: String,
      default: "",
      maxlength: [500, "النبذة لا يمكن أن تتجاوز 500 حرف!"],
    },

    avatar: {
      type: String, // Image URL
      default: "",
    },

    deviceId: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["معلم", "مساعد معلم", "ادمن"],
      default: "معلم",
    },

    status: {
      type: String,
      enum: ["نشط", "محظور"],
      default: "نشط",
    },

    earnings: [EarningsSchema],

    months: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Month" }
    ],

    lectures: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }
    ],
  },
  { timestamps: true }
);

// -------- BEFORE SAVE: HASH THE PASSWORD --------
TeacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// -------- COMPARE PASSWORD METHOD --------
TeacherSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// -------- INDEXES --------
TeacherSchema.index({ email: 1 }, { unique: true, sparse: true });
TeacherSchema.index({ phone: 1 }, { unique: true, sparse: true });
TeacherSchema.index({ subject: 1 });
TeacherSchema.index({ lastLogin: -1 });
TeacherSchema.index({ deviceId: 1 });

export default mongoose.model("Teacher", TeacherSchema);
