const express = require('express');
const cors = require('cors');
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

setupSwagger(app);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

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

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

module.exports = app;
