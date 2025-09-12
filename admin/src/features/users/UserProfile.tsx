import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import userService from '../../services/user.service';
import { UserResponseDto, UserRole, defaultRolePermissions } from '../../types/dto/users';
import { NotificationWrapper } from '../../components/common/NotificationWrapper';

export default function UserProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity'>('overview');

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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UserRole.MANAGER:
        return 'bg-primary-100 text-primary-800';
      case UserRole.EDITOR:
        return 'bg-success-100 text-success-800';
      case UserRole.VIEWER:
      case UserRole.USER: // USER is same as VIEWER
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Full system access including user management and settings';
      case UserRole.MANAGER:
        return 'Manage products, categories, and attributes. View users and settings';
      case UserRole.EDITOR:
        return 'Create and edit products. View categories and attributes';
      case UserRole.VIEWER:
      case UserRole.USER: // USER is same as VIEWER
        return 'Read-only access to products, categories, and attributes';
      default:
        return 'No permissions defined';
    }
  };

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

  const permissions = defaultRolePermissions[user.role];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotificationWrapper
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/users')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="mt-2 text-sm text-gray-700">
                View user details and permissions
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/users/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-700 hover:bg-primary-800"
          >
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
            Edit User
          </button>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-900 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-primary-100">{user.email}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-white/90 ${getRoleBadgeColor(user.role).replace('bg-', '').replace('-100', '-600')}`}>
                  {user.role.toUpperCase()}
                </span>
                <span className="flex items-center text-white">
                  {user.isActive ? (
                    <>
                      <CheckCircleSolid className="h-5 w-5 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permissions
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.phoneNumber || 'Not provided'}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.jobTitle || 'Not specified'}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Department</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.department || 'Not specified'}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
                        {user.id}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="bg-warning-50 border-l-4 border-warning-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-5 w-5 text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-warning-700">
                      <strong className="font-medium">Role: {user.role}</strong>
                    </p>
                    <p className="mt-1 text-sm text-warning-700">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        View
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Create
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Update
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Products */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Products
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.products.view ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.products.create ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.products.update ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.products.delete ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Categories */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Categories
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.categories.view ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.categories.create ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.categories.update ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.categories.delete ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Attributes */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Attributes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.attributes.view ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.attributes.create ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.attributes.update ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.attributes.delete ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Media */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Media
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.media.view ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.media.upload ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.media.upload ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.media.delete ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Users */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Users
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.users.view ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.users.create ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.users.update ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.users.delete ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    </tr>

                    {/* Settings */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Settings
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {permissions.settings.view ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center" colSpan={2}>
                        {permissions.settings.update ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-400">N/A</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="bg-primary-50 border-l-4 border-primary-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-primary-700">
                      Activity tracking is not yet implemented. This will show user login history, 
                      recent actions, and audit logs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Placeholder for activity timeline */}
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                            <UserIcon className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Account created
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  {user.lastLoginAt && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-success-500 flex items-center justify-center ring-8 ring-white">
                              <CheckCircleIcon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Last login
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {new Date(user.lastLoginAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
