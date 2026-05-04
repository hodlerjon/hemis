import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { getErrorMessage, fullName } from '../../utils/helpers';

const schema = yup.object({
  name: yup.string().required('Subject name is required'),
  code: yup.string().required('Subject code is required'),
  faculty: yup.string().required('Faculty is required'),
  teacher: yup.string().required('Teacher is required'),
  credits: yup.number().min(1).max(10).required('Credits are required'),
  type: yup.string().oneOf(['lecture', 'seminar', 'lab', 'practice']).required('Type is required'),
  description: yup.string().optional(),
});

const SubjectForm = ({ subject, onSaved, onCancel }) => {
  const isEditing = !!subject;
  const [faculties, setFaculties] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/faculties?limit=100&isActive=true'),
      api.get('/teachers?limit=100&isActive=true'),
    ]).then(([f, t]) => {
      setFaculties(f.data.data);
      setTeachers(t.data.data);
    }).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: subject?.name || '',
      code: subject?.code || '',
      faculty: subject?.faculty?._id || subject?.faculty || '',
      teacher: subject?.teacher?._id || subject?.teacher || '',
      credits: subject?.credits || 3,
      type: subject?.type || 'lecture',
      description: subject?.description || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/subjects/${subject._id}`, data);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', data);
        toast.success('Subject created');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Subject Name" required {...register('name')} error={errors.name?.message} />
        <Input label="Code" required placeholder="e.g. CS301" {...register('code')} error={errors.code?.message} />
      </div>
      <Select label="Faculty" required {...register('faculty')} error={errors.faculty?.message}>
        <option value="">Select faculty</option>
        {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
      </Select>
      <Select label="Teacher" required {...register('teacher')} error={errors.teacher?.message}>
        <option value="">Select teacher</option>
        {teachers.map((t) => (
          <option key={t._id} value={t._id}>
            {fullName(t.user)} — {t.employeeId}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Credits" type="number" min={1} max={10} required {...register('credits')} error={errors.credits?.message} />
        <Select label="Type" required {...register('type')} error={errors.type?.message}>
          <option value="lecture">Lecture</option>
          <option value="seminar">Seminar</option>
          <option value="lab">Lab</option>
          <option value="practice">Practice</option>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default SubjectForm;
