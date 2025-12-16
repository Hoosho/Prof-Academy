// src/app.js
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
// import helmet from 'helmet';
// import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';
import dotenv from 'dotenv';

// Import routes
// ADMIN
import adminAuthRoute from './routes/admin/auth.route.js';
import adminOverviewRoute from './routes/admin/overview.route.js';
// TEACHER
// import teacherRoutes from './routes/teacher/index.routes.js';
// STUDENT
// import userRoutes from './routes/user/index.routes.js';

// Import error handler
import { errorHandler } from './middlewares/errorHandler.middleware.js';

dotenv.config();
const app = express();

// -----------------------------
// Middleware
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
// app.use(helmet());
// app.use(xss());
app.use(hpp());
app.use(compression());

// Rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.API_RATE_LIMIT || 100,
//   message: 'Too many requests from this IP, please try again later'
// });
// app.use(limiter);

// -----------------------------
// Views setup
// -----------------------------
app.set('views', path.join(path.resolve(), '/src/views/'));
app.set('view engine', 'ejs');

// -----------------------------
// Static files
// -----------------------------
app.use(express.static(path.join(path.resolve(), 'src/public')));

// -----------------------------
// Routes
// -----------------------------
// ADMIN
app.use('/', adminAuthRoute);
app.use('/', adminOverviewRoute);
// TEACHEER
// app.use('/api/teacher', teacherRoutes);
// STUDENT
// app.use('/api/user', userRoutes);

// Celebrate errors
app.use(celebrateErrors());

// Centralized error handler
app.use(errorHandler);

// -----------------------------
// Export app
// -----------------------------
export default app;
