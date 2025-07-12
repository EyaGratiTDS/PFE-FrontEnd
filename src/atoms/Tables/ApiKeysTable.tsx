import React from 'react';
import EmptyState from '../../cards/EmptyState';
import { ApiKey } from '../../services/ApiKey';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  hasActiveFilters: boolean;
  onToggleApiKey: (apiKeyId: number) => Promise<void>;
}

const renderStatusBadge = (status: string) => {
  let className = "";
  let text = status;

  if (status === 'Active') {
    className = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  } else if (status === 'Disabled') {
    className = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  } else {
    className = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  );
};

const ApiKeyRow: React.FC<{ 
  apiKey: ApiKey; 
  onToggleApiKey: (apiKeyId: number) => Promise<void>;
}> = ({ apiKey, onToggleApiKey }) => {
  const userName = apiKey.Users?.name || 'N/A';
  const userEmail = apiKey.Users?.email || 'N/A';
  const status = apiKey.isActive ? 'Active' : 'Disabled';
  
  const handleClick = async () => {
    const toastId = toast.loading('Updating API key status...');
    try {
      await onToggleApiKey(apiKey.id);
      
      toast.update(toastId, {
        render: `API key ${apiKey.isActive ? 'disabled' : 'enabled'} successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: 'Failed to update API key status',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
              {apiKey.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {apiKey.prefix}...
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{userName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{userEmail}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(status)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(apiKey.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
        <button
          onClick={handleClick}
          className={`p-2 rounded-full transition-colors ${
            apiKey.isActive
              ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20'
              : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20'
          }`}
          title={apiKey.isActive ? "Disable key" : "Enable key"}
        >
          {apiKey.isActive ? (
            <FaToggleOn className="w-5 h-5" />
          ) : (
            <FaToggleOff className="w-5 h-5" />
          )}
        </button>
      </td>
    </tr>
  );
};

const ApiKeyTable: React.FC<ApiKeyTableProps> = ({
  apiKeys,
  hasActiveFilters,
  onToggleApiKey
}) => {
  return (
    <div className="overflow-hidden rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                Key Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                User
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px]">
                Created At
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys && apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <ApiKeyRow
                  key={apiKey.id}
                  apiKey={apiKey}
                  onToggleApiKey={onToggleApiKey}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <EmptyState
                    title={hasActiveFilters ? "No API keys match your filters" : "No API keys found"}
                    description={hasActiveFilters
                      ? "Try adjusting your search or filters"
                      : "There are no API keys to display"}
                    actionText=""
                    icon={<span className="text-4xl mx-auto text-gray-400 mb-4">🔑</span>}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiKeyTable;