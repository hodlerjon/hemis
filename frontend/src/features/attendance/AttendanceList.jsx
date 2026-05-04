import { useState, useEffect, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { ATTENDANCE_COLORS, getErrorMessage, formatDate, fullName } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const LIMIT = 20;

const markSchema = yup.object({
  student: yup.string().required('Student is required'),
  schedule: yup.string().required('Schedule is required'),
  subject: yup.string().required('Subject is required'),
  date: yup.string().required('Date is required'),
  status: yup.string().oneOf(['present', 'absent', 'late', 'excused']).required('Status is required'),
  note: yup.string().optional(),
});

const AttendanceList = () => {
  const { user } = useSelector((s) => s.auth);
  const canMark = user?.role === 'admin' || user?.role === 'teacher';

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ status: '', date: '' });

  // Data for form dropdowns
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (canMark) {
      Promise.all([
        api.get('/students?limit=200'),
        api.get('/schedules?limit=200'),
        api.get('/subjects?limit=100'),
      ]).then(([s, sc, sub]) => {
        setStudents(s.data.data);
        setSchedules(sc.data.data);
        setSubjects(sub.data.data);
      }).catch(() => {});
    }
  }, [canMark]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.status) params.status = filters.status;
      if (filters.date) params.date = filters.date;
      const { data } = await api.get('/attendance', { params });
      setRecords(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(markSchema),
    defaultValues: { status: 'present', date: new Date().toISOString().substring(0, 10) },
  });

  const onMark = async (data) => {
    try {
      await api.post('/attendance', data);
      toast.success('Attendance recorded');
      setShowModal(false);
      reset();
      fetchRecords();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await api.delete(`/attendance/${id}`);
      toast.success('Record deleted');
      fetchRecords();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (r) => fullName(r.student?.user) },
    { key: 'subject', label: 'Subject', render: (r) => r.subject?.name || '—' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge className={ATTENDANCE_COLORS[r.status]}>{r.status}</Badge>,
    },
    { key: 'note', label: 'Note', render: (r) => r.note || '—' },
    { key: 'recordedBy', label: 'Recorded By', render: (r) => fullName(r.recordedBy) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total records</p>
        </div>
        {canMark && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Mark Attendance
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => { setFilters((p) => ({ ...p, status: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => { setFilters((p) => ({ ...p, date: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(filters.status || filters.date) && (
          <button onClick={() => { setFilters({ status: '', date: '' }); setPage(1); }} className="text-sm text-blue-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {['present', 'absent', 'late', 'excused'].map((s) => {
          const count = records.filter((r) => r.status === s).length;
          return (
            <span key={s} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${ATTENDANCE_COLORS[s]}`}>
              {s}: {count}
            </span>
          );
        })}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={records}
          loading={loading}
          onDelete={canMark ? handleDelete : null}
          canEdit={false}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      {/* Mark Attendance Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Mark Attendance" size="md">
        <form onSubmit={handleSubmit(onMark)} className="space-y-4">
          <Select label="Student" required {...register('student')} error={errors.student?.message}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {fullName(s.user)} — {s.studentId}
              </option>
            ))}
          </Select>
          <Select label="Schedule" required {...register('schedule')} error={errors.schedule?.message}>
            <option value="">Select schedule</option>
            {schedules.map((sc) => (
              <option key={sc._id} value={sc._id}>
                {sc.subject?.name} — {sc.group?.name} ({sc.startTime})
              </option>
            ))}
          </Select>
          <Select label="Subject" required {...register('subject')} error={errors.subject?.message}>
            <option value="">Select subject</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </Select>
          <Input label="Date" type="date" required {...register('date')} error={errors.date?.message} />
          <Select label="Status" required {...register('status')} error={errors.status?.message}>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </Select>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
            <input
              {...register('note')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a note..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Submit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceList;
