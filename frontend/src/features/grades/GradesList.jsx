import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
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
import { LETTER_GRADE_COLORS, getErrorMessage, fullName } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const LIMIT = 20;

const gradeSchema = yup.object({
  student: yup.string().required('Student is required'),
  subject: yup.string().required('Subject is required'),
  teacher: yup.string().required('Teacher is required'),
  midterm: yup.number().min(0).max(100).nullable().transform((v, o) => (o === '' ? null : v)),
  final: yup.number().min(0).max(100).nullable().transform((v, o) => (o === '' ? null : v)),
  exam: yup.number().min(0).max(100).nullable().transform((v, o) => (o === '' ? null : v)),
  semester: yup.number().min(1).max(2).required('Semester is required'),
  academicYear: yup.string().matches(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY').required('Academic year is required'),
});

const GradesList = () => {
  const { user } = useSelector((s) => s.auth);
  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  const [grades, setGrades] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [filters, setFilters] = useState({ semester: '', academicYear: '', letterGrade: '' });

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (canEdit) {
      Promise.all([
        api.get('/students?limit=200'),
        api.get('/subjects?limit=100'),
        api.get('/teachers?limit=100'),
      ]).then(([s, sub, t]) => {
        setStudents(s.data.data);
        setSubjects(sub.data.data);
        setTeachers(t.data.data);
      }).catch(() => {});
    }
  }, [canEdit]);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.semester) params.semester = filters.semester;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      if (filters.letterGrade) params.letterGrade = filters.letterGrade;
      const { data } = await api.get('/grades', { params });
      setGrades(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(gradeSchema),
    defaultValues: {
      semester: 1,
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
  });

  const openCreate = () => { setEditingGrade(null); reset({ semester: 1, academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` }); setShowModal(true); };
  const openEdit = (g) => {
    setEditingGrade(g);
    setValue('student', g.student?._id || g.student);
    setValue('subject', g.subject?._id || g.subject);
    setValue('teacher', g.teacher?._id || g.teacher);
    setValue('midterm', g.midterm ?? '');
    setValue('final', g.final ?? '');
    setValue('exam', g.exam ?? '');
    setValue('semester', g.semester);
    setValue('academicYear', g.academicYear);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingGrade) {
        await api.put(`/grades/${editingGrade._id}`, data);
        toast.success('Grade updated');
      } else {
        await api.post('/grades', data);
        toast.success('Grade recorded');
      }
      setShowModal(false);
      setEditingGrade(null);
      reset();
      fetchGrades();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade?')) return;
    try {
      await api.delete(`/grades/${id}`);
      toast.success('Grade deleted');
      fetchGrades();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (r) => fullName(r.student?.user) },
    { key: 'subject', label: 'Subject', render: (r) => r.subject?.name || '—' },
    { key: 'midterm', label: 'Midterm', render: (r) => r.midterm ?? '—' },
    { key: 'final', label: 'Final', render: (r) => r.final ?? '—' },
    { key: 'exam', label: 'Exam', render: (r) => r.exam ?? '—' },
    { key: 'total', label: 'Total', render: (r) => r.total != null ? <span className="font-semibold">{r.total}</span> : '—' },
    {
      key: 'letterGrade', label: 'Grade',
      render: (r) => r.letterGrade
        ? <Badge className={LETTER_GRADE_COLORS[r.letterGrade]}>{r.letterGrade}</Badge>
        : '—',
    },
    { key: 'academicYear', label: 'Year' },
    { key: 'semester', label: 'Sem.', render: (r) => `S${r.semester}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Grades</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} grade records</p>
        </div>
        {canEdit && <Button onClick={openCreate}><Plus size={16} /> Add Grade</Button>}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          value={filters.semester}
          onChange={(e) => { setFilters((p) => ({ ...p, semester: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <select
          value={filters.letterGrade}
          onChange={(e) => { setFilters((p) => ({ ...p, letterGrade: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All grades</option>
          {['A', 'B', 'C', 'D', 'F'].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <input
          type="text"
          placeholder="Academic year (e.g. 2024-2025)"
          value={filters.academicYear}
          onChange={(e) => { setFilters((p) => ({ ...p, academicYear: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(filters.semester || filters.letterGrade || filters.academicYear) && (
          <button onClick={() => { setFilters({ semester: '', academicYear: '', letterGrade: '' }); setPage(1); }} className="text-sm text-blue-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={grades}
          loading={loading}
          onEdit={canEdit ? openEdit : null}
          onDelete={canEdit ? handleDelete : null}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      {/* Grade Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingGrade(null); reset(); }}
        title={editingGrade ? 'Edit Grade' : 'Add Grade'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
            Total score and letter grade are calculated automatically (Midterm 30% + Final 30% + Exam 40%).
          </p>
          <Select label="Student" required {...register('student')} error={errors.student?.message}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{fullName(s.user)} — {s.studentId}</option>
            ))}
          </Select>
          <Select label="Subject" required {...register('subject')} error={errors.subject?.message}>
            <option value="">Select subject</option>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
          </Select>
          <Select label="Teacher" required {...register('teacher')} error={errors.teacher?.message}>
            <option value="">Select teacher</option>
            {teachers.map((t) => <option key={t._id} value={t._id}>{fullName(t.user)}</option>)}
          </Select>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Midterm (0-100)" type="number" min={0} max={100} {...register('midterm')} error={errors.midterm?.message} />
            <Input label="Final (0-100)" type="number" min={0} max={100} {...register('final')} error={errors.final?.message} />
            <Input label="Exam (0-100)" type="number" min={0} max={100} {...register('exam')} error={errors.exam?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Semester" required {...register('semester')} error={errors.semester?.message}>
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </Select>
            <Input label="Academic Year" placeholder="2024-2025" required {...register('academicYear')} error={errors.academicYear?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingGrade(null); reset(); }}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editingGrade ? 'Update Grade' : 'Save Grade'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradesList;
