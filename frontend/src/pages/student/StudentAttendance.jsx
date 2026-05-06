import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';

const statusConfig = {
  present: { label: "Kelgan",      icon: CheckCircle, cls: 'text-green-600',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700' },
  absent:  { label: "Kelmagan",    icon: XCircle,     cls: 'text-red-500',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700'     },
  late:    { label: "Kech kelgan", icon: Clock,       cls: 'text-yellow-500', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700'},
  excused: { label: "Uzrli",       icon: AlertCircle, cls: 'text-blue-500',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700'   },
};

const SummaryCard = ({ type, count, total }) => {
  const cfg = statusConfig[type];
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`card p-4 ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <cfg.icon size={16} className={cfg.cls} />
        <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
      <p className="text-xs text-gray-500 mt-0.5">{pct}% ({count} ta dars)</p>
    </div>
  );
};

const StudentAttendance = () => {
  const { user } = useSelector((s) => s.auth);
  const [data, setData]       = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/attendance/student/${user._id}`),
      api.get(`/attendance?student=${user._id}&limit=50&sort=-date`),
    ])
      .then(([sum, rec]) => {
        setData(sum.data);
        setRecords(rec.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  const summary = data?.summary || {};
  const total   = Object.values(summary).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.keys(statusConfig).map((type) => (
          <SummaryCard key={type} type={type} count={summary[type] ?? 0} total={total} />
        ))}
      </div>

      {/* Attendance log */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Davomat tarixi</h3>
          <p className="text-sm text-gray-500 mt-0.5">Jami {total} ta dars</p>
        </div>
        {records.length === 0 ? (
          <p className="p-5 text-gray-500 text-sm">Hali davomat belgilanmagan</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Sana</th>
                <th className="px-4 py-3 text-left">Fan</th>
                <th className="px-4 py-3 text-left">Holat</th>
                <th className="px-4 py-3 text-left">Izoh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => {
                const cfg = statusConfig[r.status] || {};
                return (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(r.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.subject?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge || ''}`}>
                        {cfg.label || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{r.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
