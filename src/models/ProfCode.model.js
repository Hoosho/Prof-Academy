// /src/models/ProfCode.model.js
import mongoose from 'mongoose';

const ProfCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [ true, 'كود بروف مطلوب!' ],
    unique: [ true, 'هذا الكود موجود بالفعل!' ],
    trim: true,
    uppercase: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: [ 'active', 'used', 'expired' ],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [ true, 'معرف المعلم مطلوب!' ]
  },
}, {
  timestamps: true
});

// Auto Expire 
ProfCodeSchema.methods.checkExpireation = function(){
  if( this.expiresAt < new Date() ){
    this.status = 'expired'
  };
};

// Export Prof Code Model
export default mongoose.model( 'ProfCode', ProfCodeSchema );