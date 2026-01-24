// /src/models/Payment.model.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [ true, 'معرف الطالب مطلوب!' ],
    index: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [ true, 'معرف المعلم مطلوب!' ],
    index: true
  },
  monthId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Month',
    required: [ true, 'معرف الشهر مطلوب!' ],
    index: true
  },
  amount: {
    type: Number,
    required: [ true, 'قيمة الفاتورة مطلوبة!' ],
    min: 0
  },

  method: {
    type: String,
    enum: [ 'prof_code', 'vodafone_cash', 'instapay' ],
    default: 'prof_code'
  },

  status: {
    type: String,
    enum: [ 'pending', 'paid', 'failed', 'refunded' ],
    default: 'paid'
  },

  paidAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("Payment", PaymentSchema);
