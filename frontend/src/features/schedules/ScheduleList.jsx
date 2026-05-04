import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import ScheduleForm from './ScheduleForm';
import { getErrorMessage, DAY_NAMES, fullName } from '../../utils/helpers';
import { useSelector } from 'react-redux';

const LIMIT = 20;

const ScheduleList = () => {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [schedules, setSchedules] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ group: '', academicYear: '' });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    api.get('/groups?limit=100').then(({ data }) => setGroups(data.data)).catch(() => {});
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.group) params.group = filters.group;
      if (filters.academicYear) params.academicYear = filters.academicYear;
      const { data } = await api.get('/schedules', { params });
      setSchedules(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule entry?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted');
      fetchSchedules();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'day', label: 'Day', render: (r) => DAY_NAMES[r.dayOfWeek] || r.dayOfWeek },
    { key: 'time', label: 'Time', render: (r) => `${r.startTime} – ${r.endTime}` },
    { key: 'group', label: 'Group', render: (r) => r.group?.name || '—' },
    { key: 'subject', label: 'Subject', render: (r) => r.subject?.name || '—' },
    { key: 'teacher', label: 'Teacher', render: (r) => fullName(r.teacher?.user) },
    { key: 'room', label: 'Room' },
    { key: 'type', label: 'Type', render: (r) => (
      <Badge className="bg-blue-100 text-blue-700">{r.subject?.type || 'lecture'}</Badge>
    )},
    { key: 'academicYear', label: 'Year' },
  ];

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setShowModal(true); };
  const onSaved = () => { setShowModal(false); setEditing(null); fetchSchedules(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Schedules</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} schedule entries</p>
        </div>
        {isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Schedule</Button>}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select
          value={filters.group}
          onChange={(e) => { setFilters((p) => ({ ...p, group: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All groups</option>
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Academic year (e.g. 2024-2025)"
          value={filters.academicYear}
          onChange={(e) => { setFilters((p) => ({ ...p, academicYear: e.target.value })); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(filters.group || filters.academicYear) && (
          <button onClick={() => { setFilters({ group: '', academicYear: '' }); setPage(1); }} className="text-sm text-blue-600 hover:underline">
            Clear
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns}
          data={schedules}
          loading={loading}
          onEdit={isAdmin ? openEdit : null}
          onDelete={isAdmin ? handleDelete : null}
        />
        <Pagination page={page} total={total} limit={LIMIT} onPageChange={setPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Schedule' : 'Add Schedule'} size="lg">
        <ScheduleForm schedule={editing} onSaved={onSaved} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default ScheduleList;
