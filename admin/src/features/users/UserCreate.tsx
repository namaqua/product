import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, EnvelopeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import userService from '../../services/user.service';
import { CreateUserDto, UserRole } from '../../types/dto/users';
import { NotificationWrapper } from '../../components/common/NotificationWrapper';

// Validation schema
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof createUserSchema>;

export default function UserCreate() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: UserRole.VIEWER,
      isActive: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      const createDto: CreateUserDto = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive,
        phoneNumber: data.phoneNumber || undefined,
        department: data.department || undefined,
        jobTitle: data.jobTitle || undefined,
      };

      const response = await userService.createUser(createDto);
      
      setNotification({
        type: 'success',
        message: response.message || 'User created successfully',
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create user',
      });
      setIsSubmitting(false);
    }
  };

  const passwordValue = watch('password');

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
            <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
            <p className="mt-2 text-sm text-gray-700">
              Add a new user to the system
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
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Email */}
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="user@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {showPassword ? 'Hide' : 'Show'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                {passwordValue && !errors.password && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-medium">Password requirements:</p>
                    <ul className="mt-1 space-y-1">
                      <li className={passwordValue.length >= 8 ? 'text-green-600' : ''}>
                        ✓ At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(passwordValue) ? 'text-green-600' : ''}>
                        ✓ One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(passwordValue) ? 'text-green-600' : ''}>
                        ✓ One lowercase letter
                      </li>
                      <li className={/[0-9]/.test(passwordValue) ? 'text-green-600' : ''}>
                        ✓ One number
                      </li>
                      <li className={/[!@#$%^&*]/.test(passwordValue) ? 'text-green-600' : ''}>
                        ✓ One special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-sm text-gray-600">
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
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
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className={`block w-full px-3 py-2 border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    className={`block w-full px-3 py-2 border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    {...register('role')}
                    id="role"
                    className={`block w-full px-3 py-2 border ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    <option value={UserRole.VIEWER}>Viewer</option>
                    <option value={UserRole.EDITOR}>Editor</option>
                    <option value={UserRole.MANAGER}>Manager</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
