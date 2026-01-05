// Server Entry Point
import 'dotenv/config.js';
import app from'./src/app.js';
import { connectDB } from './src/config/db.config.js';

// -----------------------------
// Connect DB
// -----------------------------
connectDB();

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT;
app.listen( PORT, ()=> {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// // -----------------------------
// // Handle Unhandled Rejections
// // -----------------------------
// process.on('unhandledRejection', (err) => {
//   console.log(`❌ رفض غير معالج: ${err.message}`);
//   server.close(() => process.exit(1));
// });

// // -----------------------------
// // Handle Uncaught Exceptions
// // -----------------------------
// process.on('uncaughtException', (err) => {
//   logger.error(`❌ استثناء غير معالج: ${err.message}`);
//   process.exit(1);
// });