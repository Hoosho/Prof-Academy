// /app.js
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';
import { configDotenv } from 'dotenv';

import { errorHandler } from './middlewares/errorHandler.middleware.js';

// Import Routes 
// Admin

// Teacher

// User


const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(compression());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minute
  max: process.env.API_RATE_LIMIT,
  message: '❌ طلبات كثيرة، حاول مرة أخرى لاحقا.'
});
app.use(limiter);

// View Setup
app.set('views', path.join(path.resolve(), 'views'));
app.set('view engine', 'ejs');

// Static File
app.use(express.static(path.join(path.resolve(), 'public')));

// Routes


// Celebrate Errors
app.use(celebrateErrors());

// Centralized Error Handler
app.use(errorHandler);

// Export App
export default app;