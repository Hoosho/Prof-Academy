import cors from 'cors';

const allowedOrigins = [
  'https://prof-academy-ruby.vercel.app',
  'http://localhost:5173'
];

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow Postman & Server-to-Server (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // مهم علشان الكوكي (token)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
