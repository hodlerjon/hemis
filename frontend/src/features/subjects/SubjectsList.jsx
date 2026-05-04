import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import SubjectForm from './SubjectForm';
import { getErrorMessage, fullName } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const LIMIT = 15;

const TYPE_COLORS = {
  lecture: 'bg-blue-100 text-blue-700',
  seminar: 'bg-purple-100 text-purple-700',
  lab: 'bg-green-100 text-green-700',
  practice: 'bg-orange-100 text-orange-700',
};

const SubjectsList = () => {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [subjects, setSubjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subjects', { params: { page, limit: LIMIT } });
      setSubjects(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Subject Name' },
    { key: 'faculty', label: 'Faculty', render: (r) => r.faculty?.name || '—' },
    { key: 'teacher', label: 'Teacher', render: (r) => fullName(r.teacher?.user) },
    { key: 'credits', label: 'Credits' },
    {
      key: 'type', label: 'Type',
      render: (r) => <Badge className={TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-600'}>{r.type}</Badge>,
    },
  ];

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchSubjects(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Subjects</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total subjects</p>
        </div>
        {isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Subject</Button>}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={subjects}
          loading={loading}
          onEdit={isAdmin ? openEdit : null}
          onDelete={isAdmin ? handleDelete : null}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Subject' : 'Add Subject'} size="lg">
        <SubjectForm subject={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default SubjectsList;
