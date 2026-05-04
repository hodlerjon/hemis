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

const buildSchema = (isEditing) =>
  yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: isEditing
      ? yup.string().optional()
      : yup.string().min(6, 'Min 6 characters').required('Password is required'),
    studentId: yup.string().required('Student ID is required'),
    faculty: yup.string().required('Faculty is required'),
    group: yup.string().required('Group is required'),
    phone: yup.string().optional(),
    address: yup.string().optional(),
    dateOfBirth: yup.string().optional(),
  });

const StudentForm = ({ student, onSaved, onCancel }) => {
  const isEditing = !!student;
  const [faculties, setFaculties] = useState([]);
  const [groups, setGroups] = useState([]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(buildSchema(isEditing)),
    defaultValues: {
      firstName: student?.user?.firstName || '',
      lastName: student?.user?.lastName || '',
      email: student?.user?.email || '',
      studentId: student?.studentId || '',
      faculty: student?.faculty?._id || student?.faculty || '',
      group: student?.group?._id || student?.group || '',
      phone: student?.phone || '',
      address: student?.address || '',
      dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.substring(0, 10) : '',
    },
  });

  const selectedFaculty = watch('faculty');

  useEffect(() => {
    api.get('/faculties?limit=100&isActive=true').then(({ data }) => setFaculties(data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      api.get(`/groups?limit=100&faculty=${selectedFaculty}`).then(({ data }) => setGroups(data.data)).catch(() => {});
    } else {
      setGroups([]);
    }
  }, [selectedFaculty]);

  const onSubmit = async (data) => {
    try {
      if (!data.password) delete data.password;
      if (isEditing) {
        await api.put(`/students/${student._id}`, data);
        toast.success('Student updated');
      } else {
        await api.post('/students', data);
        toast.success('Student created');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isEditing && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
          A linked user account will be created automatically.
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" required {...register('firstName')} error={errors.firstName?.message} />
        <Input label="Last Name" required {...register('lastName')} error={errors.lastName?.message} />
      </div>
      <Input label="Email" type="email" required {...register('email')} error={errors.email?.message} />
      <Input
        label={isEditing ? 'Password (leave blank to keep)' : 'Password'}
        type="password"
        placeholder="••••••••"
        required={!isEditing}
        {...register('password')}
        error={errors.password?.message}
      />
      <Input label="Student ID" required {...register('studentId')} error={errors.studentId?.message} />
      <Select label="Faculty" required {...register('faculty')} error={errors.faculty?.message}>
        <option value="">Select faculty</option>
        {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
      </Select>
      <Select label="Group" required {...register('group')} error={errors.group?.message} disabled={!selectedFaculty}>
        <option value="">Select group</option>
        {groups.map((g) => <option key={g._id} value={g._id}>{g.name} ({g.code})</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Date of Birth" type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
      </div>
      <Input label="Address" {...register('address')} error={errors.address?.message} />
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default StudentForm;
