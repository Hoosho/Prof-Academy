// models/Device.model.js
import mongoose from "mongoose";

const DeviceSchema = new Mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [ true, 'معرف المستخدم مطلوب!' ],
    index: true
  },
  devicedHash: {
    type: String,
    required: [ true, 'هاش الجهاز مطلوب!' ],
    index: true, 
  },
  clientToken: {
    type: String,
    required: [ true, 'توكين المستخدم مطلوبة!' ],
    unique: [ true, 'توكين المستخدم موجود من قبل!' ]
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    rquired: [ true, 'عنوان IP مطلوب!' ]
  },
  userAgent: {
    type: String,
    rquired: [ true, 'userAgent مطلوب!' ]
  },
  isActive: {
    type: Boolean,
    default: true,
  },
},{
  versionKey: false
});

// Export Device Model
export default mongoose.model( 'Device', DeviceSchema );