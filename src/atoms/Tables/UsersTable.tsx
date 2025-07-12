import React, { useState } from 'react';
import { FaUser, FaUserSlash, FaUserCheck, FaCrown, FaUserTie, FaUserAlt, FaEllipsisV } from 'react-icons/fa';
import EmptyState from '../../cards/EmptyState';
import { User } from '../../services/user';
import { API_BASE_URL } from '../../config/constants';

interface UserTableProps {
  filteredUsers: User[];
  hasActiveFilters: boolean;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onChangePlan: (userId: string, planName: string) => void;
}

const renderRoleBadge = (role?: string) => {
  switch (role) {
    case 'superAdmin':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <FaCrown className="mr-1" /> Super Admin
        </span>
      );
    case 'admin':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <FaUserTie className="mr-1" /> Admin
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <FaUserAlt className="mr-1" /> User
        </span>
      );
  }
};

const renderStatusBadge = (isActive?: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Inactive
    </span>
  );
};

const renderPlanBadge = (subscription?: User['activeSubscription']) => {
  if (!subscription || !subscription.plan) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        No plan
      </span>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-white">
        {subscription.plan.name}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ${subscription.plan.price}/mo
      </span>
    </div>
  );
};

const UserRow: React.FC<{ 
  user: User; 
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onChangePlan: (userId: string, planName: string) => void;
}> = ({ user, onToggleStatus, onChangePlan }) => {
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {user.avatar ? (
              <img 
                className="h-10 w-10 rounded-full" 
                src={`${API_BASE_URL}${user.avatar}`} 
                alt={user.name || 'User'} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center text-gray-400">
                <FaUser />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
              {user.name || 'Unnamed User'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {user.email || 'No email'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderRoleBadge(user.role)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(user.isActive)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderPlanBadge(user.activeSubscription)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          {user.role !== 'superAdmin' && (
            <button
              onClick={() => onToggleStatus(user.id, !user.isActive)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title={user.isActive ? "Deactivate user" : "Activate user"}
            >
              {user.isActive ? (
                <FaUserSlash className="text-yellow-500" />
              ) : (
                <FaUserCheck className="text-green-500" />
              )}
            </button>
          )}
          
          {/* Menu déroulant pour changer le plan */}
          <div className="relative">
            <button
              onClick={() => setShowPlanMenu(!showPlanMenu)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Change user plan"
            >
              <FaEllipsisV />
            </button>
            
            {showPlanMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onChangePlan(user.id, 'free');
                      setShowPlanMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Free Plan
                  </button>
                  <button
                    onClick={() => {
                      onChangePlan(user.id, 'basic');
                      setShowPlanMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Basic Plan
                  </button>
                  <button
                    onClick={() => {
                      onChangePlan(user.id, 'pro');
                      setShowPlanMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Pro Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  hasActiveFilters,
  onToggleStatus,
  onChangePlan
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
              User
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px]">
              Plan
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
              Created
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onChangePlan={onChangePlan}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <EmptyState
                  title={hasActiveFilters ? "No users match your filters" : "No users found"}
                  description={hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Create your first user to get started"}
                  actionText="Add User"
                  icon={<span className="text-4xl mx-auto text-gray-400 mb-4">👤</span>}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;