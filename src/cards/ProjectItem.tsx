import React, { useState, useEffect, useRef } from 'react';
import { 
  FaEllipsisV, 
  FaEdit,
  FaTrash,
  FaLock
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from './../modals/DeleteConfirmationModal';
import { Project } from "../services/Project";

interface ProjectItemProps {
  project: Project;
  onDeleteSuccess?: () => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onDeleteSuccess }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDoubleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditClick = () => {
    navigate(`/admin/project/edit/${project.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      toast.success(`Project "${project.name}" deleted successfully`);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting Project:', error);
      toast.error(`Failed to delete Project "${project.name}"`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'active': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-700 relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-72 w-64 cursor-pointer"
        style={{ backgroundColor: project.color || '#4f46e5' }}
        onDoubleClick={handleDoubleClick}
      >
        {project.isDisabled && ( 
          <div className="absolute inset-0 bg-black/30 dark:bg-gray-900/50 flex items-center justify-center rounded-xl z-10">
            <div className="text-center p-4">
              <FaLock className="text-white text-2xl mb-2 mx-auto" />
              <div className="text-white text-sm font-medium mb-2">
                Upgrade plan to activate
              </div>
              <button
                onClick={() => navigate('/account/plan')}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        <div className="relative h-full flex flex-col p-6">
          <div className="flex justify-center mb-4">
            {project.logo ? (
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-200"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center bg-gray-100 border-2 border-white"
              >
                <span className='text-white text-xl font-bold'>{project.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold mb-2 line-clamp-1 text-white">
              {project.name}
            </h2>
            {project.description && (
              <p 
                className="text-sm mb-4 line-clamp-3 text-white/90"
              >
                {project.description}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <span 
                className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor()}`}
              >
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="p-1 rounded-full hover:bg-white/20 transition text-white"
                  disabled={isDeleting}
                >
                  <FaEllipsisV size={14} />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-[1000] border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleEditClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        itemName={project.name}
      />
    </>
  );
};

export default ProjectItem;