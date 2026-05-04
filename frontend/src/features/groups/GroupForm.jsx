import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/helpers';

const schema = yup.object({
  name: yup.string().required('Group name is required'),
  code: yup.string().required('Group code is required'),
  faculty: yup.string().required('Faculty is required'),
  // <select> always delivers strings; cast to number explicitly
  year: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : Number(o)))
    .min(1)
    .max(6)
    .required('Year is required'),
  semester: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : Number(o)))
    .min(1)
    .max(2)
    .required('Semester is required'),
});

const GroupForm = ({ group, onSaved, onCancel }) => {
  const isEditing = !!group;
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    api
      .get('/faculties?limit=100&isActive=true')
      .then(({ data }) => setFaculties(data.data))
      .catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: group?.name || '',
      code: group?.code || '',
      faculty: group?.faculty?._id || group?.faculty || '',
      year: group?.year ?? 1,
      semester: group?.semester ?? 1,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/groups/${group._id}`, data);
        toast.success('Group updated');
      } else {
        await api.post('/groups', data);
        toast.success('Group created');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Group Name" required {...register('name')} error={errors.name?.message} />
        <Input
          label="Code"
          required
          placeholder="e.g. CS-101"
          {...register('code')}
          error={errors.code?.message}
        />
      </div>

      <Select label="Faculty" required {...register('faculty')} error={errors.faculty?.message}>
        <option value="">Select faculty</option>
        {faculties.map((f) => (
          <option key={f._id} value={f._id}>
            {f.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        {/* String option values are cast to number by the schema transform */}
        <Select label="Year" required {...register('year')} error={errors.year?.message}>
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={String(y)}>
              Year {y}
            </option>
          ))}
        </Select>
        <Select label="Semester" required {...register('semester')} error={errors.semester?.message}>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </Select>
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

export default GroupForm;
