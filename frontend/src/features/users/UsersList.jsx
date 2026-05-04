import { useState, useEffect, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import UserForm from './UserForm';
import { ROLE_COLORS, formatDate, getErrorMessage } from '../../utils/helpers';

const LIMIT = 15;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', {
        params: { page, limit: LIMIT, ...(roleFilter && { role: roleFilter }) },
      });
      setUsers(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (user) => { setEditing(user); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchUsers(); };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (r) => <Badge className={ROLE_COLORS[r.role]}>{r.role}</Badge>,
    },
    {
      key: 'isActive', label: 'Status',
      render: (r) => (
        <Badge className={r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
          {r.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} total users</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3">
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={users}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit User' : 'Add New User'}
      >
        <UserForm user={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default UsersList;
