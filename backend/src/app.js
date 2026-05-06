const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit  = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const setupSwagger = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes       = require('./routes/authRoutes');
const userRoutes       = require('./routes/userRoutes');
const facultyRoutes    = require('./routes/facultyRoutes');
const groupRoutes      = require('./routes/groupRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const teacherRoutes    = require('./routes/teacherRoutes');
const subjectRoutes    = require('./routes/subjectRoutes');
const scheduleRoutes   = require('./routes/scheduleRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes      = require('./routes/gradeRoutes');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── Request logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, cb) => {
      // Swagger UI, curl, Postman (origin yo'q) — dev da ruxsat
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} is not allowed`));
    },
    credentials: true, // cookie uchun
  })
);

// ── Body parsing + cookie ──────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());

// ── NoSQL injection oldini olish ──────────────────────────────────────────────
app.use(mongoSanitize());

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Auth endpointlarga qattiqroq cheklov
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Umumiy API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api',      apiLimiter);

// ── Swagger ───────────────────────────────────────────────────────────────────
setupSwagger(app);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/faculties',  facultyRoutes);
app.use('/api/groups',     groupRoutes);
app.use('/api/students',   studentRoutes);
app.use('/api/teachers',   teacherRoutes);
app.use('/api/subjects',   subjectRoutes);
app.use('/api/schedules',  scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades',     gradeRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
