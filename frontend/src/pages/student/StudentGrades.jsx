import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';

const letterColor = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
};

const StudentGrades = () => {
  const { user } = useSelector((s) => s.auth);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear]       = useState('2025-2026');
  const [semester, setSem]    = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({ academicYear: year });
    if (semester) params.set('semester', semester);
    api.get(`/grades/student/${user._id}?${params}`)
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, year, semester]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="2025-2026">2025-2026</option>
          <option value="2024-2025">2024-2025</option>
        </select>
        <select
          value={semester}
          onChange={(e) => setSem(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha semestr</option>
          <option value="1">1-semestr</option>
          <option value="2">2-semestr</option>
        </select>
      </div>

      {/* GPA card */}
      {data && (
        <div className="card p-5 flex items-center gap-4 bg-gradient-to-r from-violet-50 to-blue-50">
          <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">GPA (o'rtacha ball)</p>
            <p className="text-3xl font-bold text-gray-900">{Number(data.gpa || 0).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Grades table */}
      {loading ? (
        <Spinner />
      ) : !data?.data?.length ? (
        <div className="card p-8 text-center text-gray-500">Hali baho yo'q</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Fan</th>
                <th className="px-4 py-3 text-center">Semestr</th>
                <th className="px-4 py-3 text-center">JN</th>
                <th className="px-4 py-3 text-center">ON</th>
                <th className="px-4 py-3 text-center">YN</th>
                <th className="px-4 py-3 text-center">Jami</th>
                <th className="px-4 py-3 text-center">Baho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.data.map((g) => (
                <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {g.subject?.name || '—'}
                    <p className="text-xs text-gray-400 font-normal">{g.subject?.code}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{g.semester}</td>
                  <td className="px-4 py-3 text-center">{g.midterm ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{g.final ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{g.exam ?? '—'}</td>
                  <td className="px-4 py-3 text-center font-semibold">{g.total ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {g.letterGrade ? (
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${letterColor[g.letterGrade] || ''}`}>
                        {g.letterGrade}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
