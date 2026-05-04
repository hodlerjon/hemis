import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { getErrorMessage, DAY_NAMES, fullName } from '../../utils/helpers';

const schema = yup.object({
  group: yup.string().required('Group is required'),
  subject: yup.string().required('Subject is required'),
  teacher: yup.string().required('Teacher is required'),
  // register() returns strings from <select>; cast explicitly to number
  dayOfWeek: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : Number(o)))
    .min(1)
    .max(7)
    .required('Day of week is required'),
  startTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format: HH:MM')
    .required('Start time is required'),
  endTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format: HH:MM')
    .required('End time is required'),
  room: yup.string().required('Room is required'),
  semester: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : Number(o)))
    .min(1)
    .max(2)
    .required('Semester is required'),
  academicYear: yup
    .string()
    .matches(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY')
    .required('Academic year is required'),
});

const ScheduleForm = ({ schedule, onSaved, onCancel }) => {
  const isEditing = !!schedule;
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/groups?limit=100&isActive=true'),
      api.get('/subjects?limit=100&isActive=true'),
      api.get('/teachers?limit=100&isActive=true'),
    ])
      .then(([g, s, t]) => {
        setGroups(g.data.data);
        setSubjects(s.data.data);
        setTeachers(t.data.data);
      })
      .catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      group: schedule?.group?._id || schedule?.group || '',
      subject: schedule?.subject?._id || schedule?.subject || '',
      teacher: schedule?.teacher?._id || schedule?.teacher || '',
      dayOfWeek: schedule?.dayOfWeek ?? 1,
      startTime: schedule?.startTime || '09:00',
      endTime: schedule?.endTime || '10:30',
      room: schedule?.room || '',
      semester: schedule?.semester ?? 1,
      academicYear:
        schedule?.academicYear ||
        `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/schedules/${schedule._id}`, data);
        toast.success('Schedule updated');
      } else {
        await api.post('/schedules', data);
        toast.success('Schedule created');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select label="Group" required {...register('group')} error={errors.group?.message}>
        <option value="">Select group</option>
        {groups.map((g) => (
          <option key={g._id} value={g._id}>
            {g.name} ({g.code})
          </option>
        ))}
      </Select>

      <Select label="Subject" required {...register('subject')} error={errors.subject?.message}>
        <option value="">Select subject</option>
        {subjects.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name} ({s.code})
          </option>
        ))}
      </Select>

      <Select label="Teacher" required {...register('teacher')} error={errors.teacher?.message}>
        <option value="">Select teacher</option>
        {teachers.map((t) => (
          <option key={t._id} value={t._id}>
            {fullName(t.user)}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        {/* Values are strings from the DOM; the schema transform converts to number */}
        <Select label="Day of Week" required {...register('dayOfWeek')} error={errors.dayOfWeek?.message}>
          {Object.entries(DAY_NAMES).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>
        <Input label="Room" required {...register('room')} error={errors.room?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Time" type="time" required {...register('startTime')} error={errors.startTime?.message} />
        <Input label="End Time" type="time" required {...register('endTime')} error={errors.endTime?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Semester" required {...register('semester')} error={errors.semester?.message}>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </Select>
        <Input
          label="Academic Year"
          placeholder="2024-2025"
          required
          {...register('academicYear')}
          error={errors.academicYear?.message}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
