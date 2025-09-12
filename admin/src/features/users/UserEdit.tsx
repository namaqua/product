import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import userService from '../../services/user.service';
import { UpdateUserDto, UserRole, UserResponseDto, ResetPasswordDto } from '../../types/dto/users';
import { NotificationWrapper } from '../../components/common/NotificationWrapper';
import { Modal } from '../../components/common/Modal';

// Validation schema for user update
const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

// Validation schema for password reset
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof updateUserSchema>;
type PasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
    watch: watchPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUser(id!);
      setUser(userData);
      
      // Set form values
      reset({
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive,
        phoneNumber: userData.phoneNumber || '',
        department: userData.department || '',
        jobTitle: userData.jobTitle || '',
      });
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load user',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      
      const updateDto: UpdateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive,
        phoneNumber: data.phoneNumber || undefined,
        department: data.department || undefined,
        jobTitle: data.jobTitle || undefined,
      };

      const response = await userService.updateUser(id, updateDto);
      
      setNotification({
        type: 'success',
        message: response.message || 'User updated successfully',
      });

      // Refresh user data
      fetchUser();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update user',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordReset = async (data: PasswordFormData) => {
    if (!id) return;

    try {
      const resetDto: ResetPasswordDto = {
        newPassword: data.newPassword,
      };

      const response = await userService.resetPassword(id, resetDto);
      
      setNotification({
        type: 'success',
        message: response.message || 'Password reset successfully',
      });

      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reset password',
      });
    }
  };

  const newPasswordValue = watchPassword('newPassword');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-danger-600">User not found</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 text-primary-600 hover:text-primary-800"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotificationWrapper
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/users')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="mt-2 text-sm text-gray-700">
              Update user information and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            
            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Password Reset Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <LockClosedIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className={`block w-full px-3 py-2 border ${
                      errors.firstName ? 'border-danger-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    className={`block w-full px-3 py-2 border ${
                      errors.lastName ? 'border-danger-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    id="phoneNumber"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1">
                  <input
                    {...register('department')}
                    type="text"
                    id="department"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="sm:col-span-2">
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <div className="mt-1">
                  <input
                    {...register('jobTitle')}
                    type="text"
                    id="jobTitle"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Role & Permissions</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role <span className="text-danger-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    {...register('role')}
                    id="role"
                    className={`block w-full px-3 py-2 border ${
                      errors.role ? 'border-danger-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  >
                    <option value={UserRole.VIEWER}>Viewer</option>
                    <option value={UserRole.EDITOR}>Editor</option>
                    <option value={UserRole.MANAGER}>Manager</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-danger-600">{errors.role.message}</p>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    {...register('isActive')}
                    id="isActive"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role Description */}
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Role Permissions:</h3>
              <div className="text-sm text-gray-600">
                {watch('role') === UserRole.ADMIN && (
                  <p>Full system access including user management and settings</p>
                )}
                {watch('role') === UserRole.MANAGER && (
                  <p>Manage products, categories, and attributes. View users and settings</p>
                )}
                {watch('role') === UserRole.EDITOR && (
                  <p>Create and edit products. View categories and attributes</p>
                )}
                {watch('role') === UserRole.VIEWER && (
                  <p>Read-only access to products, categories, and attributes</p>
                )}
                {watch('role') === UserRole.USER && (
                  <p>Read-only access to products, categories, and attributes (Legacy role)</p>
                )}
              </div>
            </div>
          </div>

          {/* User Metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Information</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
              </div>
            </dl>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-700 border border-transparent rounded-md hover:bg-primary-800 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Reset Modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
          setShowPasswordFields(false);
        }}
        title="Reset Password"
      >
        <form onSubmit={handlePasswordSubmit(onPasswordReset)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reset password for <strong>{user.firstName} {user.lastName}</strong>
            </p>
            
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password <span className="text-danger-500">*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  {...registerPassword('newPassword')}
                  type={showPasswordFields ? 'text' : 'password'}
                  id="newPassword"
                  className={`block w-full pr-10 px-3 py-2 border ${
                    passwordErrors.newPassword ? 'border-danger-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="text-sm text-gray-600">
                    {showPasswordFields ? 'Hide' : 'Show'}
                  </span>
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-danger-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-danger-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  {...registerPassword('confirmPassword')}
                  type={showPasswordFields ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`block w-full px-3 py-2 border ${
                    passwordErrors.confirmPassword ? 'border-danger-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            {newPasswordValue && (
              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1">
                  <li className={newPasswordValue.length >= 8 ? 'text-success-600' : ''}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPasswordValue) ? 'text-success-600' : ''}>
                    ✓ One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newPasswordValue) ? 'text-success-600' : ''}>
                    ✓ One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(newPasswordValue) ? 'text-success-600' : ''}>
                    ✓ One number
                  </li>
                  <li className={/[!@#$%^&*]/.test(newPasswordValue) ? 'text-success-600' : ''}>
                    ✓ One special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                resetPasswordForm();
                setShowPasswordFields(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-700 border border-transparent rounded-md hover:bg-primary-800"
            >
              Reset Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
