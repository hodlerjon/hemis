import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import TeacherForm from './TeacherForm';
import { getErrorMessage, fullName } from '../../utils/helpers';

const LIMIT = 15;

const DEGREE_COLORS = {
  bachelor: 'bg-gray-100 text-gray-600',
  master: 'bg-blue-100 text-blue-700',
  phd: 'bg-purple-100 text-purple-700',
  professor: 'bg-amber-100 text-amber-700',
};

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers', { params: { page, limit: LIMIT } });
      setTeachers(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success('Teacher deleted');
      fetchTeachers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'name', label: 'Full Name', render: (r) => fullName(r.user) },
    { key: 'email', label: 'Email', render: (r) => r.user?.email || '—' },
    { key: 'faculty', label: 'Faculty', render: (r) => r.faculty?.name || '—' },
    {
      key: 'degree', label: 'Degree',
      render: (r) => <Badge className={DEGREE_COLORS[r.degree] || 'bg-gray-100 text-gray-600'}>{r.degree}</Badge>,
    },
    { key: 'specialization', label: 'Specialization', render: (r) => r.specialization || '—' },
  ];

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (t) => { setEditing(t); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchTeachers(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Teachers</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total teachers</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Teacher</Button>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={teachers} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'} size="lg">
        <TeacherForm teacher={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default TeachersList;
