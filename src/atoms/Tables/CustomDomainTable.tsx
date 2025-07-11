import React from 'react';
import { 
  FaGlobe, 
  FaAddressCard
} from 'react-icons/fa';
import EmptyState from '../../cards/EmptyState';
import { CustomDomain } from '../../services/CustomDomain';

interface CustomDomainTableProps {
  domains: CustomDomain[];
  hasActiveFilters: boolean;
  onToggleStatus: (domainId: number, status: 'pending' | 'active' | 'failed' | 'blocked') => void;
  userRole?: string;
}

const renderStatusBadge = (status: string) => {
  const statusMap: Record<string, { className: string; icon: React.ReactNode }> = {
    active: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <span className="mr-1">✓</span>
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <span className="mr-1">⏱</span>
    },
    failed: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <span className="mr-1">✗</span>
    },
    blocked: {
      className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      icon: <span className="mr-1">⛔</span>
    }
  };

  const statusConfig = statusMap[status] || statusMap.blocked;
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
      {statusConfig.icon} {statusText}
    </span>
  );
};

const DomainRow: React.FC<{ 
  domain: CustomDomain; 
  onToggleStatus: (domainId: number, status: 'pending' | 'active' | 'failed' | 'blocked') => void;
  userRole?: string;
}> = ({ domain, onToggleStatus }) => {
  const userName = domain.vcard?.user?.name || 'N/A';
  const userEmail = domain.vcard?.user?.email || 'N/A';
  const vcardUrl = domain.vcard?.url ? `/vcard/${domain.vcard.url}` : '#';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <FaGlobe className="mr-2 text-blue-500" />
              {domain.domain}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {domain.vcard?.name || 'N/A'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {userName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {userEmail}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renderStatusBadge(domain.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(domain.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2 items-center">
          {domain.vcard?.url && (
            <a
              href={vcardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-purple-600 hover:text-purple-900 dark:text-purple-400"
              title="Open vCard"
            >
              <FaAddressCard />
            </a>
          )}
          
          <div className="relative inline-block text-left z-10">
            <select
              value={domain.status}
              onChange={(e) => onToggleStatus(
                domain.id, 
                e.target.value as 'pending' | 'active' | 'failed' | 'blocked'
              )}
              className={`ml-2 p-1.5 border rounded-md bg-white dark:bg-gray-800 text-sm w-full min-w-[100px] `}
              style={{ 
                appearance: 'auto',
                WebkitAppearance: 'menulist',
                MozAppearance: 'menulist'
              }}
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </td>
    </tr>
  );
};

const CustomDomainTable: React.FC<CustomDomainTableProps> = ({
  domains,
  hasActiveFilters,
  onToggleStatus,
  userRole
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Domain
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              vCard
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {domains && domains.length > 0 ? (
            domains.map((domain) => (
              <DomainRow
                key={domain.id}
                domain={domain}
                onToggleStatus={onToggleStatus}
                userRole={userRole}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <EmptyState
                  title={hasActiveFilters ? "No domains match your filters" : "No custom domains found"}
                  description={hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Add your first custom domain to get started"}
                  actionText="Add Domain"
                  icon={<span className="text-4xl mx-auto text-gray-400 mb-4">🌐</span>}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomDomainTable;