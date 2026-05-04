import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';

import Login from '../features/auth/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

import UsersList from '../features/users/UsersList';
import StudentsList from '../features/students/StudentsList';
import TeachersList from '../features/teachers/TeachersList';
import GroupsList from '../features/groups/GroupsList';
import FacultiesList from '../features/faculties/FacultiesList';
import SubjectsList from '../features/subjects/SubjectsList';
import ScheduleList from '../features/schedules/ScheduleList';
import AttendanceList from '../features/attendance/AttendanceList';
import GradesList from '../features/grades/GradesList';

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
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<UsersList />} />
            <Route path="/teachers" element={<TeachersList />} />
            <Route path="/faculties" element={<FacultiesList />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
            <Route path="/students" element={<StudentsList />} />
            <Route path="/groups" element={<GroupsList />} />
            <Route path="/subjects" element={<SubjectsList />} />
          </Route>

          <Route path="/schedules" element={<ScheduleList />} />
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/grades" element={<GradesList />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
