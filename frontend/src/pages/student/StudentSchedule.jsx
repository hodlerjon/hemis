import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, MapPin } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { fetchUserProfile } from '../../features/auth/authSlice';

const DAYS = ['', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

const typeColor = {
  lecture:  'bg-blue-100 text-blue-700',
  seminar:  'bg-purple-100 text-purple-700',
  lab:      'bg-green-100 text-green-700',
  practice: 'bg-orange-100 text-orange-700',
};

const StudentSchedule = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((s) => s.auth);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [profile, dispatch]);

  useEffect(() => {
    const groupId = profile?.group?._id;
    if (!groupId) return;

    api.get(`/schedules?group=${groupId}&limit=50`)
      .then(({ data }) => {
        const sorted = (data.data || []).sort((a, b) =>
          a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)
        );
        setSchedules(sorted);
      })
      .catch(() => setError("Jadval yuklanmadi"))
      .finally(() => setLoading(false));
  }, [profile]);

  if (loading) return <Spinner />;
  if (error)   return <div className="card p-6 text-red-500">{error}</div>;

  // Kunlar bo'yicha guruhlash
  const byDay = schedules.reduce((acc, s) => {
    (acc[s.dayOfWeek] = acc[s.dayOfWeek] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.keys(byDay).length === 0 ? (
        <div className="card p-8 text-center text-gray-500">Dars jadvali yo'q</div>
      ) : (
        Object.entries(byDay).map(([day, slots]) => (
          <div key={day} className="card overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{DAYS[day] || `Kun ${day}`}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {slots.map((s) => (
                <div key={s._id} className="px-5 py-4 flex items-start gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-500 w-28 shrink-0 pt-0.5">
                    <Clock size={14} />
                    <span>{s.startTime}–{s.endTime}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{s.subject?.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {s.teacher?.user?.firstName} {s.teacher?.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor[s.subject?.type] || 'bg-gray-100 text-gray-600'}`}>
                      {s.subject?.type || 'dars'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 justify-end">
                      <MapPin size={11} />
                      <span>{s.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentSchedule;
