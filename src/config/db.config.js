
// DB Connection
import mongoose from 'mongoose';

export const connectDB = async () => {
  try{
    await mongoose.connect('mongodb+srv://hooshodev_db_user:LiQAL0P90Uop1ppr@profacademy.ua7qfro.mongodb.net/ProfAcademy');
    console.log('✅ MongoDB Connected');
  }catch(err){
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Stop the app if DB fails
  };
};