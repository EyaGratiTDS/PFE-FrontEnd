import React from 'react';
import EmptyState from '../../cards/EmptyState';
import { Subscription } from '../../services/Subscription';
import Pagination from '../Pagination/Pagination';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  hasActiveFilters: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCancelSubscription: (subscriptionId: number) => void;
}

const renderStatusBadge = (status: string) => {
  const statusMap: Record<string, { className: string; icon: React.ReactNode }> = {
    active: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <span className="mr-1">✓</span>
    },
    expired: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <span className="mr-1">⌛</span>
    },
    canceled: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <span className="mr-1">✗</span>
    },
    pending: {
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: <span className="mr-1">⏱</span>
    }
  };

  const statusConfig = statusMap[status] || statusMap.pending;
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
      {statusConfig.icon} {statusText}
    </span>
  );
};

const SubscriptionRow: React.FC<{ 
  subscription: Subscription; 
  onCancelSubscription: (subscriptionId: number) => void;
}> = ({ subscription, onCancelSubscription }) => {
  const userName = subscription.user?.name || 'N/A';
  const userEmail = subscription.user?.email || 'N/A';
  const planName = subscription.plan?.name || 'N/A';
  const planPrice = subscription.plan?.price ? `$${subscription.plan.price}` : 'N/A';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
              {userName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
              {userEmail}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[120px]">{planName}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{planPrice}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {renderStatusBadge(subscription.status)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(subscription.start_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(subscription.end_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
        {subscription.status === 'active' && (
          <button
            onClick={() => onCancelSubscription(subscription.id)}
            className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
};

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  hasActiveFilters,
  currentPage,
  totalPages,
  onPageChange,
  onCancelSubscription
}) => {
  return (
    <div className="overflow-hidden rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[180px]">
                User
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[150px]">
                Plan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                Start Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                End Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((subscription) => (
                <SubscriptionRow
                  key={subscription.id}
                  subscription={subscription}
                  onCancelSubscription={onCancelSubscription}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <EmptyState
                    title={hasActiveFilters ? "No subscriptions match your filters" : "No subscriptions found"}
                    description={hasActiveFilters
                      ? "Try adjusting your search or filters"
                      : "There are no subscriptions to display"}
                    actionText=""
                    icon={<span className="text-4xl mx-auto text-gray-400 mb-4">📊</span>}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {subscriptions && subscriptions.length > 0 && totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionTable;