import React from 'react';
import { FaFileCsv, FaFileCode, FaSpinner } from 'react-icons/fa';

interface ExportMenuSuperAdminProps {
  onExport: (format: 'csv' | 'json') => void;
  exporting: boolean;
}

const ExportMenuSuperAdmin: React.FC<ExportMenuSuperAdminProps> = ({ onExport, exporting }) => {
  return (
    <div 
      className="absolute mt-2 w-48 min-w-[12rem] max-w-[90vw] rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-[9999] right-0"
    >
      <div className="py-1">
        <button
          className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 whitespace-nowrap ${
            exporting 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => onExport('csv')}
          disabled={exporting}
        >
          {exporting ? (
            <FaSpinner className="animate-spin text-blue-500 flex-shrink-0" />
          ) : (
            <FaFileCsv className="text-green-500 flex-shrink-0" />
          )}
          <span className="flex-grow">Export as CSV</span>
        </button>
        <button
          className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 whitespace-nowrap ${
            exporting 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => onExport('json')}
          disabled={exporting}
        >
          {exporting ? (
            <FaSpinner className="animate-spin text-blue-500 flex-shrink-0" />
          ) : (
            <FaFileCode className="text-blue-500 flex-shrink-0" />
          )}
          <span className="flex-grow">Export as JSON</span>
        </button>
      </div>
    </div>
  );
};

export default ExportMenuSuperAdmin;
