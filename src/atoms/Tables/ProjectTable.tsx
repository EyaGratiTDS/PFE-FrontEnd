import React from 'react';
import { FaFolder, FaFolderOpen, FaFolderMinus, FaBan, FaCheck, FaAddressCard } from 'react-icons/fa';
import EmptyState from '../../cards/EmptyState';
import { Project } from '../../services/Project';
import { API_BASE_URL } from '../../config/constants';

interface ProjectTableProps {
  projects: Project[];
  hasActiveFilters: boolean;
  onToggleBlocked: (projectId: string, isBlocked: boolean) => void;
  onShowVcards: (projectId: string) => void; 
}

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <FaFolderOpen className="mr-1" /> Active
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <FaFolderMinus className="mr-1" /> Archived
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FaFolder className="mr-1" /> Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <FaFolder className="mr-1" /> Unknown
        </span>
      );
  }
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

const ProjectRow: React.FC<{ 
  project: Project; 
  onToggleBlocked: (projectId: string, isBlocked: boolean) => void;
  onShowVcards: (projectId: string) => void;
}> = ({ project, onToggleBlocked, onShowVcards }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          {project.logo ? (
            <img 
              className="h-10 w-10 rounded-full" 
              src={`${API_BASE_URL}${project.logo}`} 
              alt={project.name} 
            />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center text-gray-400">
              <FaFolder />
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {project.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {project.description || 'No description'}
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 dark:text-white">
          {project.Users?.name || 'N/A'} 
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {project.Users?.email || 'N/A'} 
        </span>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {renderStatusBadge(project.status)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {renderBlockedBadge(project.is_blocked)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onShowVcards(project.id)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-blue-600 hover:text-blue-900 dark:text-blue-400"
          title="View vCards"
        >
          <FaAddressCard />
        </button>
        
        <button
          onClick={() => onToggleBlocked(project.id, !project.is_blocked)}
          className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
            project.is_blocked 
              ? 'text-green-600 hover:text-green-900 dark:text-green-400' 
              : 'text-red-600 hover:text-red-900 dark:text-red-400'
          }`}
          title={project.is_blocked ? "Unblock" : "Block"}
        >
          {project.is_blocked ? <FaCheck /> : <FaBan />}
        </button>
      </div>
    </td>
  </tr>
);

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  hasActiveFilters,
  onToggleBlocked,
  onShowVcards 
}) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Project
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
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onToggleBlocked={onToggleBlocked}
                onShowVcards={onShowVcards} 
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <EmptyState
                  title={hasActiveFilters ? "No projects match your filters" : "No projects found"}
                  description={hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Create your first project to get started"}
                  actionText="Add Project"
                  icon={<span className="text-4xl mx-auto text-gray-400 mb-4">📂</span>}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;