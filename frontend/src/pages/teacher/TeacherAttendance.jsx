import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, AlertCircle, Send } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { fetchUserProfile } from '../../features/auth/authSlice';

const STATUSES = [
  { value: 'present', label: 'Kelgan',      icon: CheckCircle, cls: 'text-green-600' },
  { value: 'absent',  label: 'Kelmagan',    icon: XCircle,     cls: 'text-red-500'   },
  { value: 'late',    label: 'Kech keldi',  icon: Clock,       cls: 'text-yellow-500'},
  { value: 'excused', label: 'Uzrli',       icon: AlertCircle, cls: 'text-blue-500'  },
];

const TeacherAttendance = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((s) => s.auth);

  const [schedules, setSchedules]   = useState([]);
  const [students, setStudents]     = useState([]);
  const [selSch, setSelSch]         = useState('');
  const [selDate, setSelDate]       = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows]             = useState([]);   // { student, status }
  const [existing, setExisting]     = useState([]);   // mavjud yozuvlar
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) { dispatch(fetchUserProfile()); return; }
    api.get(`/schedules?teacher=${profile._id}&limit=100`)
      .then(({ data }) => setSchedules(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile, dispatch]);

  // Jadval tanlanganida guruhning talabalarini yuklash
  useEffect(() => {
    if (!selSch) { setStudents([]); setRows([]); return; }
    const sch = schedules.find((s) => s._id === selSch);
    if (!sch?.group?._id) return;

    api.get(`/students?group=${sch.group._id}&limit=100`)
      .then(({ data }) => {
        const studs = data.data || [];
        setStudents(studs);
        setRows(studs.map((s) => ({ studentId: s._id, status: 'present', note: '' })));
      })
      .catch(() => {});
  }, [selSch, schedules]);

  // Tanlangan jadval + sana uchun mavjud davomat
  useEffect(() => {
    if (!selSch || !selDate) return;
    api.get(`/attendance?schedule=${selSch}&date=${selDate}&limit=100`)
      .then(({ data }) => setExisting(data.data || []))
      .catch(() => setExisting([]));
  }, [selSch, selDate]);

  // Mavjud yozuvlar bilan rows ni to'ldirish
  useEffect(() => {
    if (!existing.length || !rows.length) return;
    setRows((prev) =>
      prev.map((r) => {
        const found = existing.find((e) => e.student?._id === r.studentId || e.student === r.studentId);
        return found ? { ...r, status: found.status, note: found.note || '', existingId: found._id } : r;
      })
    );
  }, [existing]);

  const updateRow = (studentId, field, value) =>
    setRows((prev) => prev.map((r) => r.studentId === studentId ? { ...r, [field]: value } : r));

  const handleSubmit = async () => {
    if (!selSch || !selDate) return toast.error("Jadval va sanani tanlang");
    const sch = schedules.find((s) => s._id === selSch);
    if (!sch) return;

    setSubmitting(true);
    try {
      const records = rows.map((r) => ({
        student:  r.studentId,
        schedule: selSch,
        subject:  sch.subject?._id || sch.subject,
        date:     selDate,
        status:   r.status,
        note:     r.note || undefined,
      }));
      await api.post('/attendance/bulk', { records });
      toast.success("Davomat saqlandi!");
      // Mavjud yozuvlarni yangilash
      const { data } = await api.get(`/attendance?schedule=${selSch}&date=${selDate}&limit=100`);
      setExisting(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  const selectedSch = schedules.find((s) => s._id === selSch);

  return (
    <div className="space-y-5">
      {/* Jadval va sana tanlash */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Dars va sana tanlash</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jadval (dars)</label>
            <select
              value={selSch}
              onChange={(e) => setSelSch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Jadval tanlang —</option>
              {schedules.map((s) => (
                <option key={s._id} value={s._id}>
                  {['', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Yak'][s.dayOfWeek]} {s.startTime}–{s.endTime} · {s.subject?.name} · {s.group?.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sana</label>
            <input
              type="date"
              value={selDate}
              onChange={(e) => setSelDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {selectedSch && (
          <p className="mt-3 text-sm text-gray-500">
            Guruh: <span className="font-medium text-gray-700">{selectedSch.group?.name}</span> ·
            Xona: <span className="font-medium text-gray-700">{selectedSch.room}</span>
          </p>
        )}
      </div>

      {/* Talabalar jadvali */}
      {selSch && students.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Talabalar ({students.length} ta)</h3>
            {existing.length > 0 && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Bu sana uchun davomat allaqachon belgilangan
              </span>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((stu, i) => {
              const row = rows.find((r) => r.studentId === stu._id) || { status: 'present', note: '' };
              return (
                <div key={stu._id} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-6 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {stu.user?.firstName} {stu.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{stu.studentId}</p>
                  </div>
                  {/* Status tugmalari */}
                  <div className="flex gap-1 shrink-0">
                    {STATUSES.map(({ value, label, icon: Icon, cls }) => (
                      <button
                        key={value}
                        type="button"
                        title={label}
                        onClick={() => updateRow(stu._id, 'status', value)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          row.status === value
                            ? 'border-transparent bg-gray-100 ' + cls
                            : 'border-gray-200 text-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon size={16} />
                      </button>
                    ))}
                  </div>
                  {/* Izoh */}
                  <input
                    type="text"
                    placeholder="Izoh..."
                    value={row.note}
                    onChange={(e) => updateRow(stu._id, 'note', e.target.value)}
                    className="hidden sm:block w-32 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={15} />
              {submitting ? 'Saqlanmoqda...' : 'Davomatni saqlash'}
            </button>
          </div>
        </div>
      )}

      {selSch && students.length === 0 && (
        <div className="card p-8 text-center text-gray-500">Bu guruhda talaba yo'q</div>
      )}
    </div>
  );
};

export default TeacherAttendance;
