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
    role: yup.string().oneOf(['admin', 'teacher', 'student']).required('Role is required'),
    // isActive comes in as string "true"/"false" from the select — cast explicitly
    isActive: yup.boolean().transform((_, orig) => orig === true || orig === 'true'),
  });

const UserForm = ({ user, onSaved, onCancel }) => {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(buildSchema(isEditing)),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || 'student',
      isActive: user?.isActive ?? true,
    },
  });

  const onSubmit = async (data) => {
    try {
      if (!data.password) delete data.password;
      if (isEditing) {
        await api.put(`/users/${user._id}`, data);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', data);
        toast.success('User created successfully');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      <Select label="Role" required {...register('role')} error={errors.role?.message}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </Select>
      {isEditing && (
        <Select label="Status" {...register('isActive')} error={errors.isActive?.message}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      )}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
