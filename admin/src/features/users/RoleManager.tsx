import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { UserRole, defaultRolePermissions } from '../../types/dto/users';
import { NotificationWrapper } from '../../components/common/NotificationWrapper';

interface RoleCard {
  role: UserRole;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  userCount?: number;
}

const roleCards: RoleCard[] = [
  {
    role: UserRole.ADMIN,
    name: 'Administrator',
    description: 'Full system access with complete control over all modules including user management and system settings.',
    color: 'purple',
    icon: ShieldCheckIcon,
  },
  {
    role: UserRole.MANAGER,
    name: 'Manager',
    description: 'Can manage products, categories, and attributes. Has view access to users and settings but cannot modify them.',
    color: 'blue',
    icon: UserGroupIcon,
  },
  {
    role: UserRole.EDITOR,
    name: 'Editor',
    description: 'Can create and edit products, view and update categories. Limited access to attributes and no user management.',
    color: 'green',
    icon: LockClosedIcon,
  },
  {
    role: UserRole.VIEWER,
    name: 'Viewer',
    description: 'Read-only access to products, categories, and attributes. Cannot make any modifications to the system.',
    color: 'gray',
    icon: InformationCircleIcon,
  },
];

export default function RoleManager() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const permissions = defaultRolePermissions[selectedRole];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      purple: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
      },
      blue: {
        bg: 'bg-primary-50 hover:bg-primary-100',
        text: 'text-primary-700',
        border: 'border-primary-200',
      },
      green: {
        bg: 'bg-success-50 hover:bg-success-100',
        text: 'text-success-700',
        border: 'border-success-200',
      },
      gray: {
        bg: 'bg-gray-50 hover:bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
      },
    };
    return colors[color] || colors.gray;
  };

  const renderPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircleIcon className="h-5 w-5 text-success-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-danger-500" />
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NotificationWrapper
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage user roles and their associated permissions
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
            <button
              onClick={() => navigate('/users')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-700 hover:bg-primary-800"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {roleCards.map((card) => {
          const colorClasses = getColorClasses(card.color);
          const Icon = card.icon;
          const isSelected = selectedRole === card.role;

          return (
            <button
              key={card.role}
              onClick={() => setSelectedRole(card.role)}
              className={`relative rounded-lg border-2 p-6 transition-all ${
                isSelected
                  ? `${colorClasses.border} ${colorClasses.bg} ring-2 ring-offset-2 ring-${card.color}-500`
                  : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${isSelected ? colorClasses.text : 'text-gray-400'}`} />
                {isSelected && (
                  <span className={`text-xs font-semibold ${colorClasses.text}`}>SELECTED</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.name}</h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </button>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      {!showComparison ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Permissions for {roleCards.find(r => r.role === selectedRole)?.name}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Products */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Products
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Products</span>
                    {renderPermissionIcon(permissions.products.view)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Create Products</span>
                    {renderPermissionIcon(permissions.products.create)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Products</span>
                    {renderPermissionIcon(permissions.products.update)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delete Products</span>
                    {renderPermissionIcon(permissions.products.delete)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Archive Products</span>
                    {renderPermissionIcon(permissions.products.archive)}
                  </li>
                </ul>
              </div>

              {/* Categories */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-success-500 rounded-full mr-2"></span>
                  Categories
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Categories</span>
                    {renderPermissionIcon(permissions.categories.view)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Create Categories</span>
                    {renderPermissionIcon(permissions.categories.create)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Categories</span>
                    {renderPermissionIcon(permissions.categories.update)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delete Categories</span>
                    {renderPermissionIcon(permissions.categories.delete)}
                  </li>
                </ul>
              </div>

              {/* Attributes */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-2"></span>
                  Attributes
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Attributes</span>
                    {renderPermissionIcon(permissions.attributes.view)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Create Attributes</span>
                    {renderPermissionIcon(permissions.attributes.create)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Attributes</span>
                    {renderPermissionIcon(permissions.attributes.update)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delete Attributes</span>
                    {renderPermissionIcon(permissions.attributes.delete)}
                  </li>
                </ul>
              </div>

              {/* Media */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Media
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Media</span>
                    {renderPermissionIcon(permissions.media.view)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Upload Media</span>
                    {renderPermissionIcon(permissions.media.upload)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delete Media</span>
                    {renderPermissionIcon(permissions.media.delete)}
                  </li>
                </ul>
              </div>

              {/* Users */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-danger-500 rounded-full mr-2"></span>
                  Users
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Users</span>
                    {renderPermissionIcon(permissions.users.view)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Create Users</span>
                    {renderPermissionIcon(permissions.users.create)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Users</span>
                    {renderPermissionIcon(permissions.users.update)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delete Users</span>
                    {renderPermissionIcon(permissions.users.delete)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Change Roles</span>
                    {renderPermissionIcon(permissions.users.changeRole)}
                  </li>
                </ul>
              </div>

              {/* Settings */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Settings
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">View Settings</span>
                    {renderPermissionIcon(permissions.settings.view)}
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Update Settings</span>
                    {renderPermissionIcon(permissions.settings.update)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Comparison Table */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Role Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-purple-600 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-success-600 uppercase tracking-wider">
                    Editor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Viewer
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Products Permissions */}
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-2 text-xs font-semibold text-gray-900 uppercase">
                    Products
                  </td>
                </tr>
                {Object.entries(defaultRolePermissions[UserRole.ADMIN].products).map(([action, _]) => (
                  <tr key={`products-${action}`}>
                    <td className="px-6 py-3 text-sm text-gray-900 capitalize">
                      {action} Products
                    </td>
                    {[UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR, UserRole.VIEWER].map(role => (
                      <td key={role} className="px-6 py-3 text-center">
                        {defaultRolePermissions[role].products[action as keyof typeof defaultRolePermissions[UserRole.ADMIN]['products']] ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Categories Permissions */}
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-2 text-xs font-semibold text-gray-900 uppercase">
                    Categories
                  </td>
                </tr>
                {Object.entries(defaultRolePermissions[UserRole.ADMIN].categories).map(([action, _]) => (
                  <tr key={`categories-${action}`}>
                    <td className="px-6 py-3 text-sm text-gray-900 capitalize">
                      {action} Categories
                    </td>
                    {[UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR, UserRole.VIEWER].map(role => (
                      <td key={role} className="px-6 py-3 text-center">
                        {defaultRolePermissions[role].categories[action as keyof typeof defaultRolePermissions[UserRole.ADMIN]['categories']] ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Users Permissions */}
                <tr className="bg-gray-50">
                  <td colSpan={5} className="px-6 py-2 text-xs font-semibold text-gray-900 uppercase">
                    Users
                  </td>
                </tr>
                {Object.entries(defaultRolePermissions[UserRole.ADMIN].users).map(([action, _]) => (
                  <tr key={`users-${action}`}>
                    <td className="px-6 py-3 text-sm text-gray-900 capitalize">
                      {action === 'changeRole' ? 'Change Role' : `${action} Users`}
                    </td>
                    {[UserRole.ADMIN, UserRole.MANAGER, UserRole.EDITOR, UserRole.VIEWER].map(role => (
                      <td key={role} className="px-6 py-3 text-center">
                        {defaultRolePermissions[role].users[action as keyof typeof defaultRolePermissions[UserRole.ADMIN]['users']] ? (
                          <CheckCircleIcon className="h-5 w-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-danger-500 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-primary-50 border-l-4 border-primary-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-primary-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800">Role Management Information</h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>
                Roles define what users can do in the system. Each role has a specific set of permissions
                that control access to different modules and actions. Users can only have one role at a time.
              </p>
              <p className="mt-2">
                To change a user's role, go to the <button onClick={() => navigate('/users')} className="underline font-medium">Users</button> page
                and edit the specific user, or use the bulk actions to update multiple users at once.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
