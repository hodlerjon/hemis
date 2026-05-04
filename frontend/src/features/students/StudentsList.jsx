import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import StudentForm from './StudentForm';
import { getErrorMessage, fullName, formatDate } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const LIMIT = 15;

const StudentsList = () => {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ faculty: '', group: '' });
  const [faculties, setFaculties] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api.get('/faculties?limit=100').then(({ data }) => setFaculties(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.faculty) {
      api.get(`/groups?limit=100&faculty=${filters.faculty}`).then(({ data }) => setGroups(data.data)).catch(() => {});
    } else {
      setGroups([]);
    }
  }, [filters.faculty]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.faculty) params.faculty = filters.faculty;
      if (filters.group) params.group = filters.group;
      const { data } = await api.get('/students', { params });
      setStudents(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'name', label: 'Full Name', render: (r) => fullName(r.user) },
    { key: 'email', label: 'Email', render: (r) => r.user?.email || '—' },
    { key: 'faculty', label: 'Faculty', render: (r) => r.faculty?.name || '—' },
    { key: 'group', label: 'Group', render: (r) => r.group?.name || '—' },
    {
      key: 'isActive', label: 'Status',
      render: (r) => (
        <Badge className={r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'enrollmentDate', label: 'Enrolled', render: (r) => formatDate(r.enrollmentDate) },
  ];

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchStudents(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total students</p>
        </div>
        {isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Student</Button>}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          value={filters.faculty}
          onChange={(e) => { setFilters({ faculty: e.target.value, group: '' }); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All faculties</option>
          {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
        <select
          value={filters.group}
          onChange={(e) => { setFilters((p) => ({ ...p, group: e.target.value })); setPage(1); }}
          disabled={!filters.faculty}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
        >
          <option value="">All groups</option>
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        {(filters.faculty || filters.group) && (
          <button
            onClick={() => { setFilters({ faculty: '', group: '' }); setPage(1); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={students}
          loading={loading}
          onEdit={isAdmin ? openEdit : null}
          onDelete={isAdmin ? handleDelete : null}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Student' : 'Add Student'} size="lg">
        <StudentForm student={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default StudentsList;
