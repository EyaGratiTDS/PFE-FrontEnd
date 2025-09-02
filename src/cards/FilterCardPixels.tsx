import React from 'react';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterState {
  status: 'all' | 'active' | 'inactive';
  dateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
}

interface FilterCardPixelsProps {
  activeFilters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: any) => void;
  onResetFilters: () => void;
  onClose: () => void;
}

const FilterCardPixels: React.FC<FilterCardPixelsProps> = ({
  activeFilters,
  onFilterChange,
  onResetFilters,
  onClose
}) => {
  return (
    <div className="fixed sm:absolute inset-0 sm:inset-auto sm:right-0 sm:mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 rounded-none sm:rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          aria-label="Close filters"
        >
          <FaTimes className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4 pb-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={activeFilters.status}
            onChange={(e) => onFilterChange('status', e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all" className="dark:bg-gray-800 dark:text-gray-300">All Statuses</option>
            <option value="active" className="dark:bg-gray-800 dark:text-gray-300">Active</option>
            <option value="inactive" className="dark:bg-gray-800 dark:text-gray-300">Inactive</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Creation Date Range
          </label>
          <div className="space-y-3">
            <div className="relative">
              <DatePicker
                selected={activeFilters.dateRange.start}
                onChange={(date: Date | null) => onFilterChange('dateRange', {
                  ...activeFilters.dateRange,
                  start: date || undefined
                })}
                selectsStart
                startDate={activeFilters.dateRange.start}
                endDate={activeFilters.dateRange.end}
                maxDate={activeFilters.dateRange.end || new Date()}
                placeholderText="Start date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <DatePicker
                selected={activeFilters.dateRange.end}
                onChange={(date: Date | null) => onFilterChange('dateRange', {
                  ...activeFilters.dateRange,
                  end: date || undefined
                })}
                selectsEnd
                startDate={activeFilters.dateRange.start}
                endDate={activeFilters.dateRange.end}
                minDate={activeFilters.dateRange.start || undefined}
                maxDate={new Date()}
                placeholderText="End date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="pt-2">
          <button
            onClick={onResetFilters}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterCardPixels;
