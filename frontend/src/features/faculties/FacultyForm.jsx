import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/helpers';

const schema = yup.object({
  name: yup.string().required('Faculty name is required'),
  code: yup.string().required('Faculty code is required'),
  description: yup.string().optional(),
});

const FacultyForm = ({ faculty, onSaved, onCancel }) => {
  const isEditing = !!faculty;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: faculty?.name || '',
      code: faculty?.code || '',
      description: faculty?.description || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await api.put(`/faculties/${faculty._id}`, data);
        toast.success('Faculty updated');
      } else {
        await api.post('/faculties', data);
        toast.success('Faculty created');
      }
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Faculty Name" required {...register('name')} error={errors.name?.message} />
      <Input label="Code" required placeholder="e.g. CS, ENG" {...register('code')} error={errors.code?.message} />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief description of the faculty..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default FacultyForm;
