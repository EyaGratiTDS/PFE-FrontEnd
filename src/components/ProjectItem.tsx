import React from 'react';
import { Project } from '../services/Project';

interface ProjectItemProps {
  project: Project;
  onDeleteSuccess: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onDeleteSuccess }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{project.name}</h3>
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: project.color || '#4f46e5' }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
          {project.description || 'No description provided'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'No date'}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            project.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : project.status === 'archived'
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Unknown'}
          </span>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => console.log('View project', project.id)}
        >
          View Details
        </button>
        <button 
          className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          onClick={() => {
            console.log('Delete project', project.id);
            onDeleteSuccess();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectItem;
