// models/admin.model.js
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [ true, '❌ اسم المستخدم مطلوب' ],
    unique: [ true, '❌ هذا المستخدم موجود بالفعل!' ],
    trim: true,
    lowercase: true,
    index: true,    
  },
  email: {
    type: String,
    required: [true, '❌ الإيميل مطلوب!'],
    unique: [true, '❌ هذا المستخدم موجود بالفعل!'],
    trim: true,
    index: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '❌ صيغة الإيميل غير صحيحة!']
  },  
  password: {
    type : String,
    required: [ true, '❌ كلمة المرور مطلوبة!' ],
    select: false
  },
  role: {
    type: String,
    enum : ['ADMIN'],
    defualt: 'ADMIN',
    immutable: true,
  },
  status: {
    type: String,
    enum: [ 'active', 'hidden', 'inactive' ],
    default: 'معلق'
  },
  lastLogin:{
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
    default: null,
    select: false 
  },
  otpExpires: {
    type: Date,
    default: null,
    select: false
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  failedOtpAttempts: {
    type: Number,
    default: 0
  },
  otpLockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

// -------- PRE-SAVE: HASH PASSWORD & OTP (Merged Check) --------
AdminSchema.pre('save', async function () {
  if (
    (this.isModified('password') && typeof this.password === 'string') ||
    (this.isModified('otpCode') && typeof this.otpCode === 'string')
  ) {
    const salt = await bcrypt.genSalt(12);

    // Hash Password if modified
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
AdminSchema.methods.comparePassword = async function ( password ) {
  return bcrypt.compare( password, this.password );
};

AdminSchema.methods.compareOtpCode = async function ( otp ) {
  if ( !this.otpCode ) return false;
  return bcrypt.compare( otp, this.otpCode );
};


// Export Admin Model
export default mongoose.model( 'Admin', AdminSchema );