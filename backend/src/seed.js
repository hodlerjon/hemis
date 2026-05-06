require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User       = require('./models/User');
const Faculty    = require('./models/Faculty');
const Teacher    = require('./models/Teacher');
const Group      = require('./models/Group');
const Student    = require('./models/Student');
const Subject    = require('./models/Subject');
const Schedule   = require('./models/Schedule');
const Attendance = require('./models/Attendance');
const Grade      = require('./models/Grade');

// ---------- helpers ----------
const upsertUser = async (data) => {
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = await new User(data).save();
    console.log(`  [User]  Created  ${data.role}: ${data.email}`);
  } else {
    console.log(`  [User]  Exists   ${data.role}: ${data.email}`);
  }
  return user;
};

const upsert = async (Model, query, data, label) => {
  let doc = await Model.findOne(query);
  if (!doc) {
    doc = await Model.create(data);
    console.log(`  [${label}]  Created  ${JSON.stringify(query)}`);
  } else {
    console.log(`  [${label}]  Exists   ${JSON.stringify(query)}`);
  }
  return doc;
};

// Returns the most recent past date whose weekday matches dayOfWeek (1=Mon … 7=Sun)
// weeksAgo: 0 = this/last occurrence, 1 = one week before that, etc.
const pastDate = (dayOfWeek, weeksAgo = 0) => {
  const now = new Date();
  const jsDay = dayOfWeek === 7 ? 0 : dayOfWeek; // convert to JS 0=Sun
  const diff = (now.getDay() - jsDay + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(now.getDate() - diff - weeksAgo * 7);
  d.setHours(9, 0, 0, 0);
  return d;
};

// ---------- main ----------
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('\nMongoDB connected\n');

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  console.log('── Users ──');
  const adminUser    = await upsertUser({ firstName: 'Admin',   lastName: 'User',        email: 'admin@hemis.uz',    password: 'admin123',   role: 'admin'   });
  const teacherUser1 = await upsertUser({ firstName: 'Alisher', lastName: 'Karimov',     email: 'teacher1@hemis.uz', password: 'teacher123', role: 'teacher' });
  const teacherUser2 = await upsertUser({ firstName: 'Nilufar', lastName: 'Toshmatova',  email: 'teacher2@hemis.uz', password: 'teacher123', role: 'teacher' });
  const studentUser1 = await upsertUser({ firstName: 'Jasur',   lastName: 'Rahimov',     email: 'student1@hemis.uz', password: 'student123', role: 'student' });
  const studentUser2 = await upsertUser({ firstName: 'Malika',  lastName: 'Yusupova',    email: 'student2@hemis.uz', password: 'student123', role: 'student' });
  const studentUser3 = await upsertUser({ firstName: 'Bobur',   lastName: 'Xasanov',     email: 'student3@hemis.uz', password: 'student123', role: 'student' });

  // ── 2. FACULTIES ──────────────────────────────────────────────────────────
  console.log('\n── Faculties ──');
  const facKI = await upsert(Faculty, { code: 'KI' }, {
    name: "Kompyuter Injiniringi",
    code: 'KI',
    description: "Dasturiy injiniring, sun'iy intellekt va tarmoqlar yo'nalishi",
  }, 'Faculty');

  const facIQ = await upsert(Faculty, { code: 'IQ' }, {
    name: "Iqtisodiyot",
    code: 'IQ',
    description: "Iqtisodiyot va boshqaruv yo'nalishi",
  }, 'Faculty');

  // ── 3. TEACHERS ───────────────────────────────────────────────────────────
  console.log('\n── Teachers ──');
  const teacher1 = await upsert(Teacher, { user: teacherUser1._id }, {
    user:           teacherUser1._id,
    faculty:        facKI._id,
    employeeId:     'EMP-001',
    degree:         'phd',
    specialization: 'Dasturlash tillari va algoritmlar',
    phone:          '+998901234567',
  }, 'Teacher');

  const teacher2 = await upsert(Teacher, { user: teacherUser2._id }, {
    user:           teacherUser2._id,
    faculty:        facKI._id,
    employeeId:     'EMP-002',
    degree:         'master',
    specialization: "Ma'lumotlar bazasi va axborot tizimlari",
    phone:          '+998907654321',
  }, 'Teacher');

  // Dekan belgilash (already exists — just update if not set)
  if (!facKI.dean) {
    await Faculty.findByIdAndUpdate(facKI._id, { dean: teacher1._id });
    console.log('  [Faculty]  Dean set for KI');
  }

  // ── 4. GROUPS ─────────────────────────────────────────────────────────────
  console.log('\n── Groups ──');
  const group1 = await upsert(Group, { code: 'KI-101' }, {
    name:     'KI-101-guruh',
    code:     'KI-101',
    faculty:  facKI._id,
    year:     1,
    semester: 1,
  }, 'Group');

  const group2 = await upsert(Group, { code: 'KI-102' }, {
    name:     'KI-102-guruh',
    code:     'KI-102',
    faculty:  facKI._id,
    year:     1,
    semester: 2,
  }, 'Group');

  // ── 5. STUDENTS ───────────────────────────────────────────────────────────
  console.log('\n── Students ──');
  const student1 = await upsert(Student, { user: studentUser1._id }, {
    user:           studentUser1._id,
    faculty:        facKI._id,
    group:          group1._id,
    studentId:      'STU-001',
    dateOfBirth:    new Date('2004-03-15'),
    phone:          '+998901112233',
    address:        "Toshkent, Yunusobod tumani",
    enrollmentDate: new Date('2023-09-01'),
  }, 'Student');

  const student2 = await upsert(Student, { user: studentUser2._id }, {
    user:           studentUser2._id,
    faculty:        facKI._id,
    group:          group1._id,
    studentId:      'STU-002',
    dateOfBirth:    new Date('2004-07-22'),
    phone:          '+998902223344',
    address:        "Toshkent, Chilonzor tumani",
    enrollmentDate: new Date('2023-09-01'),
  }, 'Student');

  const student3 = await upsert(Student, { user: studentUser3._id }, {
    user:           studentUser3._id,
    faculty:        facKI._id,
    group:          group2._id,
    studentId:      'STU-003',
    dateOfBirth:    new Date('2003-11-05'),
    phone:          '+998903334455',
    address:        "Toshkent, Mirzo Ulug'bek tumani",
    enrollmentDate: new Date('2023-09-01'),
  }, 'Student');

  // ── 6. SUBJECTS ───────────────────────────────────────────────────────────
  console.log('\n── Subjects ──');
  const subjProg = await upsert(Subject, { code: 'PROG101' }, {
    name:        'Dasturlash Asoslari',
    code:        'PROG101',
    faculty:     facKI._id,
    teacher:     teacher1._id,
    credits:     4,
    description: "Python va JavaScript orqali dasturlash asoslari",
    type:        'lecture',
  }, 'Subject');

  const subjDB = await upsert(Subject, { code: 'DB101' }, {
    name:        "Ma'lumotlar Bazasi",
    code:        'DB101',
    faculty:     facKI._id,
    teacher:     teacher2._id,
    credits:     3,
    description: "SQL va NoSQL ma'lumotlar bazalarini loyihalash",
    type:        'lab',
  }, 'Subject');

  const subjMath = await upsert(Subject, { code: 'MATH101' }, {
    name:        'Matematika',
    code:        'MATH101',
    faculty:     facKI._id,
    teacher:     teacher1._id,
    credits:     4,
    description: "Diskret matematika va chiziqli algebra",
    type:        'lecture',
  }, 'Subject');

  const subjAlgo = await upsert(Subject, { code: 'ALGO101' }, {
    name:        'Algoritmlar va Murakkablik',
    code:        'ALGO101',
    faculty:     facKI._id,
    teacher:     teacher1._id,
    credits:     3,
    description: "Saralash, qidiruv va graflar nazariyasi",
    type:        'seminar',
  }, 'Subject');

  // ── 7. SCHEDULES ──────────────────────────────────────────────────────────
  console.log('\n── Schedules ──');
  // group1 (KI-101) — semester 1
  const sch1 = await upsert(Schedule,
    { group: group1._id, subject: subjProg._id, dayOfWeek: 1, startTime: '08:30' },
    { group: group1._id, subject: subjProg._id, teacher: teacher1._id,
      dayOfWeek: 1, startTime: '08:30', endTime: '10:00',
      room: '101-xona', semester: 1, academicYear: '2025-2026' },
    'Schedule');

  const sch2 = await upsert(Schedule,
    { group: group1._id, subject: subjProg._id, dayOfWeek: 3, startTime: '08:30' },
    { group: group1._id, subject: subjProg._id, teacher: teacher1._id,
      dayOfWeek: 3, startTime: '08:30', endTime: '10:00',
      room: '101-xona', semester: 1, academicYear: '2025-2026' },
    'Schedule');

  const sch3 = await upsert(Schedule,
    { group: group1._id, subject: subjDB._id, dayOfWeek: 2, startTime: '10:15' },
    { group: group1._id, subject: subjDB._id, teacher: teacher2._id,
      dayOfWeek: 2, startTime: '10:15', endTime: '11:45',
      room: 'Lab-1', semester: 1, academicYear: '2025-2026' },
    'Schedule');

  const sch4 = await upsert(Schedule,
    { group: group1._id, subject: subjMath._id, dayOfWeek: 4, startTime: '10:15' },
    { group: group1._id, subject: subjMath._id, teacher: teacher1._id,
      dayOfWeek: 4, startTime: '10:15', endTime: '11:45',
      room: '201-xona', semester: 1, academicYear: '2025-2026' },
    'Schedule');

  // group2 (KI-102) — semester 2
  const sch5 = await upsert(Schedule,
    { group: group2._id, subject: subjProg._id, dayOfWeek: 1, startTime: '12:00' },
    { group: group2._id, subject: subjProg._id, teacher: teacher1._id,
      dayOfWeek: 1, startTime: '12:00', endTime: '13:30',
      room: '101-xona', semester: 2, academicYear: '2025-2026' },
    'Schedule');

  const sch6 = await upsert(Schedule,
    { group: group2._id, subject: subjDB._id, dayOfWeek: 3, startTime: '10:15' },
    { group: group2._id, subject: subjDB._id, teacher: teacher2._id,
      dayOfWeek: 3, startTime: '10:15', endTime: '11:45',
      room: 'Lab-1', semester: 2, academicYear: '2025-2026' },
    'Schedule');

  const sch7 = await upsert(Schedule,
    { group: group2._id, subject: subjAlgo._id, dayOfWeek: 5, startTime: '08:30' },
    { group: group2._id, subject: subjAlgo._id, teacher: teacher1._id,
      dayOfWeek: 5, startTime: '08:30', endTime: '10:00',
      room: '301-xona', semester: 2, academicYear: '2025-2026' },
    'Schedule');

  // ── 8. ATTENDANCE ─────────────────────────────────────────────────────────
  console.log('\n── Attendance ──');

  // { schedule, student, subject, statuses per week [0=this, 1=last, 2=two weeks ago] }
  const attendancePlan = [
    // --- group1: student1, student2 ---
    { sch: sch1, subj: subjProg, students: [student1, student2],
      statuses: [['present','present'], ['present','late'], ['present','present']] },
    { sch: sch2, subj: subjProg, students: [student1, student2],
      statuses: [['present','present'], ['absent','present'], ['present','present']] },
    { sch: sch3, subj: subjDB,   students: [student1, student2],
      statuses: [['present','present'], ['late','present'],   ['present','absent']] },
    { sch: sch4, subj: subjMath, students: [student1, student2],
      statuses: [['present','excused'], ['present','present'], ['absent','present']] },
    // --- group2: student3 ---
    { sch: sch5, subj: subjProg, students: [student3],
      statuses: [['present'], ['present'], ['late']] },
    { sch: sch6, subj: subjDB,   students: [student3],
      statuses: [['present'], ['absent'], ['present']] },
    { sch: sch7, subj: subjAlgo, students: [student3],
      statuses: [['present'], ['present'], ['present']] },
  ];

  let attCreated = 0, attSkipped = 0;
  for (const plan of attendancePlan) {
    for (let week = 0; week < 3; week++) {
      const date = pastDate(plan.sch.dayOfWeek, week);
      for (let si = 0; si < plan.students.length; si++) {
        const stu = plan.students[si];
        const status = plan.statuses[week][si];
        const exists = await Attendance.findOne({
          student: stu._id, schedule: plan.sch._id, date,
        });
        if (!exists) {
          await Attendance.create({
            student:    stu._id,
            schedule:   plan.sch._id,
            subject:    plan.subj._id,
            date,
            status,
            recordedBy: adminUser._id,
          });
          attCreated++;
        } else {
          attSkipped++;
        }
      }
    }
  }
  console.log(`  Created: ${attCreated}  |  Skipped (exists): ${attSkipped}`);

  // ── 9. GRADES ─────────────────────────────────────────────────────────────
  console.log('\n── Grades ──');

  const gradesPlan = [
    // student1 (group1, semester 1)
    { student: student1, subject: subjProg,  teacher: teacher1, sem: 1, midterm: 85, final: 80, exam: 90 },
    { student: student1, subject: subjDB,    teacher: teacher2, sem: 1, midterm: 75, final: 70, exam: 80 },
    { student: student1, subject: subjMath,  teacher: teacher1, sem: 1, midterm: 90, final: 88, exam: 92 },
    // student2 (group1, semester 1)
    { student: student2, subject: subjProg,  teacher: teacher1, sem: 1, midterm: 70, final: 65, exam: 72 },
    { student: student2, subject: subjDB,    teacher: teacher2, sem: 1, midterm: 60, final: 55, exam: 65 },
    { student: student2, subject: subjMath,  teacher: teacher1, sem: 1, midterm: 45, final: 50, exam: 48 },
    // student3 (group2, semester 2)
    { student: student3, subject: subjProg,  teacher: teacher1, sem: 2, midterm: 80, final: 82, exam: 85 },
    { student: student3, subject: subjDB,    teacher: teacher2, sem: 2, midterm: 88, final: 90, exam: 92 },
    { student: student3, subject: subjAlgo,  teacher: teacher1, sem: 2, midterm: 78, final: 75, exam: 80 },
  ];

  let gradeCreated = 0, gradeSkipped = 0;
  for (const g of gradesPlan) {
    const exists = await Grade.findOne({
      student: g.student._id, subject: g.subject._id,
      semester: g.sem, academicYear: '2025-2026',
    });
    if (!exists) {
      await Grade.create({
        student:      g.student._id,
        subject:      g.subject._id,
        teacher:      g.teacher._id,
        midterm:      g.midterm,
        final:        g.final,
        exam:         g.exam,
        semester:     g.sem,
        academicYear: '2025-2026',
      });
      gradeCreated++;
    } else {
      gradeSkipped++;
    }
  }
  console.log(`  Created: ${gradeCreated}  |  Skipped (exists): ${gradeSkipped}`);

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n✓ Seed completed successfully!\n');
  console.log('Login credentials:');
  console.log('  admin@hemis.uz    / admin123');
  console.log('  teacher1@hemis.uz / teacher123');
  console.log('  teacher2@hemis.uz / teacher123');
  console.log('  student1@hemis.uz / student123');
  console.log('  student2@hemis.uz / student123');
  console.log('  student3@hemis.uz / student123\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
