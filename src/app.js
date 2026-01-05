// src/app.js
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';
import MongoStore from 'connect-mongo';

// import helmet from 'helmet';
// import xss from 'xss-clean';
import hpp from 'hpp';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errors as celebrateErrors } from 'celebrate';
import dotenv from 'dotenv';

import { corsConfig } from './config/cors.config.js';

// Import routes
// ADMIN
import adminAuthRoutes from './routes/admin/auth.route.js';
import adminOverviewRoutes from './routes/admin/overview.route.js';
import adminTeacherRoutes from './routes/admin/teacher.route.js';
// TEACHER
// import teacherRoutes from './routes/teacher/index.routes.js';
// STUDENT
// import userRoutes from './routes/user/index.routes.js';

// Import error handler
import { errorHandler } from './middlewares/errorHandler.middleware.js';

dotenv.config();
const app = express();

app.set('trust proxy', 1);


// -----------------------------
// Middleware
// -----------------------------
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use( corsConfig );

// app.use(helmet());
// app.use(xss());
app.use(hpp());
app.use(compression());

// Session Configuration 
app.use(session({
  name: 'admin_sid',             // اسم الكوكي
  secret: process.env.SESSION_SECRET, // سر لتشفير الكوكي
  resave: false,
  saveUninitialized: false,
  
  proxy: true,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI, // أو MONGO_URI
    ttl: 15 * 60, // مدة السشن بالثواني
  }),

  cookie: {
    httpOnly: true,               // يحمي من XSS
    maxAge: 15 * 60 * 1000,        // 15 دقايق (مثلاً فترة OTP)
    secure: false,
    sameSite: 'lax'
  }
}));


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
app.use( '/', adminAuthRoutes );
app.use( '/', adminOverviewRoutes );
app.use( '', adminTeacherRoutes )
// TEACHEER
// app.use('/api/teacher', teacherRoutes);
// STUDENT
// app.use('/api/user', userRoutes);

// TEST
app.get('/api/test', ( req, res ) => {
  return res.status(200).render('test')
})

app.post('/api/test', ( req, res ) => {
  return res.status(200).json({
    test: req.body
  })
})

// Celebrate errors
app.use(celebrateErrors());

// Centralized error handler
app.use(errorHandler);

// -----------------------------
// Export app
// -----------------------------
export default app;
