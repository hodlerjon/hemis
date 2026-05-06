import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ProtectedRoute from './ProtectedRoute';
import Layout         from '../components/layout/Layout';

import Login    from '../features/auth/Login';
import NotFound from '../pages/NotFound';

// Admin / shared pages
import Dashboard     from '../pages/Dashboard';
import UsersList     from '../features/users/UsersList';
import StudentsList  from '../features/students/StudentsList';
import TeachersList  from '../features/teachers/TeachersList';
import GroupsList    from '../features/groups/GroupsList';
import FacultiesList from '../features/faculties/FacultiesList';
import SubjectsList  from '../features/subjects/SubjectsList';
import ScheduleList  from '../features/schedules/ScheduleList';
import AttendanceList from '../features/attendance/AttendanceList';
import GradesList    from '../features/grades/GradesList';

// Student pages
import StudentDashboard  from '../pages/student/StudentDashboard';
import StudentGrades     from '../pages/student/StudentGrades';
import StudentAttendance from '../pages/student/StudentAttendance';
import StudentSchedule   from '../pages/student/StudentSchedule';

// Teacher pages
import TeacherDashboard  from '../pages/teacher/TeacherDashboard';
import TeacherAttendance from '../pages/teacher/TeacherAttendance';

// Profile (barcha rol)
import ProfilePage from '../pages/profile/ProfilePage';

// Roli bo'yicha bosh sahifaga yo'naltirish
const RoleDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Dashboard />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          {/* Dashboard — rolga qarab redirect */}
          <Route path="/dashboard" element={<RoleDashboard />} />

          {/* ── Admin only ──────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/users"     element={<UsersList />} />
            <Route path="/teachers"  element={<TeachersList />} />
            <Route path="/faculties" element={<FacultiesList />} />
          </Route>

          {/* ── Admin + Teacher ──────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
            <Route path="/students" element={<StudentsList />} />
            <Route path="/groups"   element={<GroupsList />} />
            <Route path="/subjects" element={<SubjectsList />} />
          </Route>

          {/* ── Umumiy (barcha rol) ──────────────────────── */}
          <Route path="/schedules"  element={<ScheduleList />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/grades"     element={<GradesList />} />
          <Route path="/profile"    element={<ProfilePage />} />

          {/* ── Student sahifalari ───────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard"  element={<StudentDashboard />} />
            <Route path="/student/grades"     element={<StudentGrades />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/schedule"   element={<StudentSchedule />} />
          </Route>

          {/* ── Teacher sahifalari ───────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher/dashboard"  element={<TeacherDashboard />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          </Route>

        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
