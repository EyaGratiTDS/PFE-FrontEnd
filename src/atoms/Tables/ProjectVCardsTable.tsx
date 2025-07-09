import React from 'react';
import { FaEye, FaImage, FaBan, FaCheck } from 'react-icons/fa';
import { VCard } from '../../services/vcard';
import { formatDate } from '../../services/dateUtils';
import { API_BASE_URL } from '../../config/constants';

interface ProjectVCardsTableProps {
  vcards: VCard[];
  hasActiveFilters: boolean;
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
}

const renderActiveBadge = (isActive: boolean) => {
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

const renderBlockedBadge = (isBlocked: boolean) => {
  return isBlocked ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      Blocked
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      Allowed
    </span>
  );
};

// Fonction utilitaire pour construire les URLs d'images
const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  // Gère les URLs absolues (ex: http://...)
  if (path.startsWith('http')) return path;
  // Construit une URL relative à la base API
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

const VCardRow: React.FC<{ 
  vcard: VCard; 
  onToggleBlocked: (vcardId: string, isBlocked: boolean) => void;
}> = ({ vcard, onToggleBlocked }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex justify-center">
        {vcard.logo ? (
          <div className="flex-shrink-0 h-10 w-10">
            <img 
              src={getImageUrl(vcard.logo)} 
              alt={`${vcard.name} logo`}
              className="h-10 w-10 rounded-full object-cover border border-gray-200 block"
              onError={(e) => {
                // Fallback si l'image ne charge pas
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-sm" />
          </div>
        )}
      </div>
    </td>
    
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex justify-center">
        {vcard.favicon ? (
          <div className="flex-shrink-0 h-8 w-8">
            <img 
              src={getImageUrl(vcard.favicon)} 
              alt={`${vcard.name} favicon`}
              className="h-8 w-8 rounded-full object-cover border border-gray-200 block"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 border border-dashed flex items-center justify-center text-gray-400">
            <FaImage className="text-xs" />
          </div>
        )}
      </div>
    </td>
    
    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
      <div className="truncate max-w-[150px]">
        {vcard.name}
      </div>
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {renderActiveBadge(vcard.is_active)}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {renderBlockedBadge(vcard.status)}
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {vcard.createdAt ? formatDate(vcard.createdAt) : 'N/A'}
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {vcard.views || 0}
    </td>
    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex justify-end space-x-2">
        <a 
          href={`/vcard/${vcard.url}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title="View vCard"
        >
          <FaEye className="inline" />
        </a>
        <button
          onClick={() => onToggleBlocked(vcard.id, !vcard.status)}
          className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
            vcard.status 
              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
              : 'text-red-600 hover:text-red-900 dark:text-red-400'
          }`}
          title={vcard.status ? "Unblock" : "Block"}
        >
          {vcard.status ? <FaCheck /> : <FaBan />}
        </button>
      </div>
    </td>
  </tr>
);

const ProjectVCardsTable: React.FC<ProjectVCardsTableProps> = ({
  vcards,
  hasActiveFilters,
  onToggleBlocked
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow w-full max-w-full">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Logo
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Favicon
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Blocked
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Views
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {vcards.length > 0 ? (
            vcards.map((vcard) => (
              <VCardRow
                key={vcard.id}
                vcard={vcard}
                onToggleBlocked={onToggleBlocked}
              />
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center">
                <div className="text-center py-4">
                  <div className="text-gray-400 text-3xl mb-2">📇</div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {hasActiveFilters 
                      ? "No VCards match your filters" 
                      : "No VCards found"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-xs">
                    {hasActiveFilters
                      ? "Try adjusting your search or filters"
                      : "Create your first VCard to get started"}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectVCardsTable;