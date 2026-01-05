// seeders/createAdmin.seeder.js
import mongoose from "mongoose";
import Admin from '../src/models/Admin.model.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect('mongodb+srv://hooshodev_db_user:LiQAL0P90Uop1ppr@profacademy.ua7qfro.mongodb.net/ProfAcademy', {
      dbName: 'ProfAcademy'
    });
    console.log('🔗 MongoDB connected');

    const exist = await Admin.findOne({
      $or: [
        { username: 'ALShewihi' },
        { email: 'alshwyhym97@gmail.com' }
      ]
    });

    if (exist) {
      console.log('❌ الادمن موجود بالفعل');
      return;
    }

    await Admin.create({
      username: 'ALShewihi',
      email: 'alshwyhym97@gmail.com',
      password: 'SaMT(jp3tg^FQNnT',
      status: 'نشط',
      otpVerified: true
    });

    console.log('✅ تم إنشاء الادمن بنجاح');
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Failed to seed admin:", err.message);
    await mongoose.disconnect();
  }
};

seedAdmin();
