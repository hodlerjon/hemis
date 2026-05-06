import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { User, Lock, Phone } from 'lucide-react';
import api from '../../api/axios';

const pwSchema = yup.object({
  currentPassword: yup.string().required("Joriy parol kiritilishi shart"),
  newPassword:     yup.string().min(6, "Kamida 6 ta belgi").required("Yangi parol kiritilishi shart"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], "Parollar mos emas")
    .required("Parolni tasdiqlang"),
});

const ProfilePage = () => {
  const { user, profile } = useSelector((s) => s.auth);
  const [pwLoading, setPwLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(pwSchema) });

  const onChangePw = async (values) => {
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword:     values.newPassword,
      });
      toast.success("Parol muvaffaqiyatli o'zgartirildi");
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setPwLoading(false);
    }
  };

  const roleLabel = { admin: 'Administrator', teacher: "O'qituvchi", student: 'Talaba' };

  return (
    <div className="max-w-2xl space-y-6">
      {/* User info card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
              {roleLabel[user?.role] || user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={15} className="text-gray-400" />
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={15} className="text-gray-400" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile?.employeeId && (
            <div className="text-gray-500">
              ID: <span className="font-medium text-gray-700">{profile.employeeId}</span>
            </div>
          )}
          {profile?.studentId && (
            <div className="text-gray-500">
              Talaba ID: <span className="font-medium text-gray-700">{profile.studentId}</span>
            </div>
          )}
          {profile?.faculty && (
            <div className="text-gray-500">
              Fakultet: <span className="font-medium text-gray-700">{profile.faculty?.name}</span>
            </div>
          )}
          {profile?.group && (
            <div className="text-gray-500">
              Guruh: <span className="font-medium text-gray-700">{profile.group?.name}</span>
            </div>
          )}
          {profile?.degree && (
            <div className="text-gray-500 capitalize">
              Daraja: <span className="font-medium text-gray-700">{profile.degree}</span>
            </div>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Parolni o'zgartirish</h3>
        </div>
        <form onSubmit={handleSubmit(onChangePw)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joriy parol</label>
            <input
              type="password"
              {...register('currentPassword')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parol</label>
            <input
              type="password"
              {...register('newPassword')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kamida 6 ta belgi"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parolni tasdiqlang</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pwLoading ? "Saqlanmoqda..." : "Parolni saqlash"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
