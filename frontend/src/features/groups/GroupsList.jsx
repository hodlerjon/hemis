import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import GroupForm from './GroupForm';
import { getErrorMessage } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const LIMIT = 15;

const GroupsList = () => {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [groups, setGroups] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/groups', { params: { page, limit: LIMIT } });
      setGroups(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success('Group deleted');
      fetchGroups();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Group Name' },
    { key: 'faculty', label: 'Faculty', render: (r) => r.faculty?.name || '—' },
    { key: 'year', label: 'Year', render: (r) => `Year ${r.year}` },
    { key: 'semester', label: 'Semester', render: (r) => `Semester ${r.semester}` },
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
  const openEdit = (g) => { setEditing(g); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchGroups(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Groups</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total groups</p>
        </div>
        {isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Group</Button>}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={groups}
          loading={loading}
          onEdit={isAdmin ? openEdit : null}
          onDelete={isAdmin ? handleDelete : null}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Group' : 'Add Group'}>
        <GroupForm group={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default GroupsList;
