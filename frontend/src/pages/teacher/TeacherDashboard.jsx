import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users2, BookMarked, ClipboardCheck, Calendar } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { fetchUserProfile } from '../../features/auth/authSlice';

const StatCard = ({ label, value, icon: Icon, color, to }) => {
  const inner = (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
  return to ? <Link to={to} className="hover:shadow-md transition-shadow block">{inner}</Link> : inner;
};

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((s) => s.auth);
  const [subjects, setSubjects]   = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!profile) dispatch(fetchUserProfile());
  }, [profile, dispatch]);

  useEffect(() => {
    if (!profile?._id) return;
    Promise.all([
      api.get(`/subjects?teacher=${profile._id}&limit=50`),
      api.get(`/schedules?teacher=${profile._id}&limit=50`),
    ])
      .then(([s, sc]) => {
        setSubjects(s.data.data || []);
        setSchedules(sc.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile]);

  // Nechta noyob guruh borligini hisoblash
  const groupCount = new Set(schedules.map((s) => s.group?._id).filter(Boolean)).size;

  // Bugungi darslar
  const todayDay = new Date().getDay() || 7; // JS 0=Yak, biz 7=Yak
  const todaySchedules = schedules
    .filter((s) => s.dayOfWeek === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-emerald-600 to-teal-600 border-0 text-white">
        <p className="text-emerald-200 text-sm">Xush kelibsiz,</p>
        <h2 className="text-2xl font-bold mt-1">{user?.firstName} {user?.lastName}</h2>
        <p className="text-emerald-200 text-sm mt-1 capitalize">
          {profile?.degree} · {profile?.faculty?.name || ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Fanlarim"  value={subjects.length}  icon={BookMarked}    color="bg-blue-500"    to="/subjects" />
        <StatCard label="Guruhlarim" value={groupCount}       icon={Users2}        color="bg-violet-500"  to="/groups" />
        <StatCard label="Jadvaldagi darslar" value={schedules.length} icon={Calendar} color="bg-amber-500" />
      </div>

      {/* Bugungi darslar */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Bugungi darslar</h3>
          <Link to="/teacher/attendance" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ClipboardCheck size={14} />
            Davomat belgilash
          </Link>
        </div>
        {todaySchedules.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">Bugun dars yo'q</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {todaySchedules.map((s) => (
              <div key={s._id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{s.subject?.name}</p>
                  <p className="text-sm text-gray-400">{s.group?.name} · {s.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{s.startTime}–{s.endTime}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fanlar ro'yxati */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Mening fanlarim</h3>
        </div>
        {subjects.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">Fan biriktirilmagan</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {subjects.map((s) => (
              <div key={s._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.code} · {s.credits} kredit</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded capitalize">
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
