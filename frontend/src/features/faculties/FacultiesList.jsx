import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import FacultyForm from './FacultyForm';
import { getErrorMessage } from '../../utils/helpers';

const LIMIT = 15;

const FacultiesList = () => {
  const [faculties, setFaculties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/faculties', { params: { page, limit: LIMIT } });
      setFaculties(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchFaculties(); }, [fetchFaculties]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty?')) return;
    try {
      await api.delete(`/faculties/${id}`);
      toast.success('Faculty deleted');
      fetchFaculties();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Faculty Name' },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
    {
      key: 'isActive', label: 'Status',
      render: (r) => (
        <Badge className={r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (f) => { setEditing(f); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchFaculties(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Faculties</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total faculties</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Faculty</Button>
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns} data={faculties} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Faculty' : 'Add Faculty'}>
        <FacultyForm faculty={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default FacultiesList;
