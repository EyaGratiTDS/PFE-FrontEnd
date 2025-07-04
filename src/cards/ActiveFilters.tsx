import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ActiveFiltersProps {
  activeFilters: {
    status: string;
    role: string;
    verified: string;
    search: string;
  };
  resetFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ activeFilters, resetFilters }) => (
  <div className="mb-4 flex items-center gap-2 flex-wrap">
    <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
    {activeFilters.status !== 'all' && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Status: {activeFilters.status === 'active' ? 'Active' : 'Inactive'}
      </span>
    )}
    {activeFilters.role !== 'all' && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Role: {activeFilters.role}
      </span>
    )}
    {activeFilters.verified !== 'all' && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        Verified: {activeFilters.verified === 'verified' ? 'Yes' : 'No'}
      </span>
    )}
    {activeFilters.search && (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        Search: "{activeFilters.search}"
      </span>
    )}
    <button
      onClick={resetFilters}
      className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full"
    >
      <FaTimes className="mr-1" /> Clear all
    </button>
  </div>
);

export default ActiveFilters;