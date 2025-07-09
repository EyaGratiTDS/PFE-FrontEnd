import React from 'react';
import { FaBan, FaCheck, FaAddressCard, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import EmptyState from '../../cards/EmptyState';
import { Pixel } from '../../services/Pixel';

interface PixelTableProps {
  pixels: Pixel[];
  hasActiveFilters: boolean;
  onToggleBlocked: (pixelId: string, isBlocked: boolean) => void;
}

const renderStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      <FaToggleOn className="mr-1" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
      <FaToggleOff className="mr-1" /> Inactive
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

const PixelRow: React.FC<{ 
  pixel: Pixel; 
  onToggleBlocked: (pixelId: string, isBlocked: boolean) => void;
}> = ({ pixel, onToggleBlocked }) => {
  const userName = pixel.vcard?.user?.name || 'N/A';
  const userEmail = pixel.vcard?.user?.email || 'N/A';
  const vcardUrl = pixel.vcard?.url ? `/vcard/${pixel.vcard.url}` : '#';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {pixel.name || 'Unnamed Pixel'}
            </div>
          </div>
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
        {renderStatusBadge(pixel.is_active)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {renderBlockedBadge(pixel.is_blocked)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(pixel.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          {pixel.vcard?.url && (
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
          
          <button
            onClick={() => onToggleBlocked(pixel.id, !pixel.is_blocked)}
            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
              pixel.is_blocked 
                ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
                : 'text-red-600 hover:text-red-900 dark:text-red-400'
            }`}
            title={pixel.is_blocked ? "Unblock" : "Block"}
          >
            {pixel.is_blocked ? <FaCheck /> : <FaBan />}
          </button>
        </div>
      </td>
    </tr>
  );
};

const PixelTable: React.FC<PixelTableProps> = ({
  pixels,
  hasActiveFilters,
  onToggleBlocked
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pixel
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Blocked
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
          {pixels && pixels.length > 0 ? (
            pixels.map((pixel) => (
              <PixelRow
                key={pixel.id}
                pixel={pixel}
                onToggleBlocked={onToggleBlocked}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <EmptyState
                  title={hasActiveFilters ? "No pixels match your filters" : "No pixels found"}
                  description={hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Create your first pixel to get started"}
                  actionText="Add Pixel"
                  icon={<span className="text-4xl mx-auto text-gray-400 mb-4">📊</span>}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PixelTable;