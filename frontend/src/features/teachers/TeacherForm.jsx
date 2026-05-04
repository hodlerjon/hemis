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
    faculty: yup.string().required('Faculty is required'),
    employeeId: yup.string().required('Employee ID is required'),
    degree: yup.string().required('Degree is required'),
    specialization: yup.string().optional(),
    phone: yup.string().optional(),
  });

const TeacherForm = ({ teacher, onSaved, onCancel }) => {
  const isEditing = !!teacher;
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    api.get('/faculties?limit=100&isActive=true').then(({ data }) => setFaculties(data.data)).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(buildSchema(isEditing)),
    defaultValues: {
      firstName: teacher?.user?.firstName || '',
      lastName: teacher?.user?.lastName || '',
      email: teacher?.user?.email || '',
      faculty: teacher?.faculty?._id || teacher?.faculty || '',
      employeeId: teacher?.employeeId || '',
      degree: teacher?.degree || 'master',
      specialization: teacher?.specialization || '',
      phone: teacher?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      if (!data.password) delete data.password;
      if (isEditing) {
        await api.put(`/teachers/${teacher._id}`, data);
        toast.success('Teacher updated');
      } else {
        await api.post('/teachers', data);
        toast.success('Teacher created');
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="Employee ID" required {...register('employeeId')} error={errors.employeeId?.message} />
        <Select label="Degree" required {...register('degree')} error={errors.degree?.message}>
          <option value="bachelor">Bachelor</option>
          <option value="master">Master</option>
          <option value="phd">PhD</option>
          <option value="professor">Professor</option>
        </Select>
      </div>
      <Select label="Faculty" required {...register('faculty')} error={errors.faculty?.message}>
        <option value="">Select faculty</option>
        {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Specialization" {...register('specialization')} error={errors.specialization?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default TeacherForm;
