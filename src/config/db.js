
// DB Connection
import mongoose from 'mongoose';

export const connectDB = async () => {
  try{
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ MongoDB Connected');
  }catch(err){
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Stop the app if DB fails
  };
};