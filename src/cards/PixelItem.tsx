import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FaTrash,
  FaEdit,
  FaChartLine,
  FaEllipsisV,
  FaLock,
  FaCalendarAlt,
  FaIdCard
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Pixel } from '../services/Pixel';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

interface PixelItemProps {
  pixel: Pixel;
  onDelete: (id: string) => void;
}

const PixelItem: React.FC<PixelItemProps> = ({ pixel, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('top');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  // Calculate dropdown position based on button position and screen size
  const calculateDropdownPosition = () => {
    if (!dropdownButtonRef.current) return;

    const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    const dropdownHeight = 120; // Approximate height of dropdown (2 buttons)
    
    // Check if there's enough space below and above the button
    const spaceAbove = buttonRect.top;
    const spaceBelow = screenHeight - buttonRect.bottom;
    
    // Prefer showing below (bottom) unless there's not enough space
    if (spaceBelow >= dropdownHeight) {
      setDropdownPosition('bottom');
    } else if (spaceAbove >= 80) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom'); // Default to bottom even if cramped
    }
  };

  // Get dropdown classes based on position and screen size
  const getDropdownClasses = () => {
    // Base classes with improved mobile visibility
    const baseClasses = "absolute right-0 min-w-[180px] w-48 sm:w-44 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden";
    
    // Different z-index strategy for mobile vs desktop
    const zIndex = window.innerWidth < 768 ? "z-[9999]" : "z-[60]";
    
    if (dropdownPosition === 'bottom') {
      return `${baseClasses} ${zIndex} top-full mt-2`;
    } else {
      return `${baseClasses} ${zIndex} bottom-full mb-2`;
    }
  };

  const handleEditClick = () => {
    setShowDropdown(false);
    navigate(`/admin/pixel/edit/${pixel.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setIsDeleting(true);
    try {
      onDelete(pixel.id);
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
    if (!showDropdown) {
      calculateDropdownPosition();
    }
    setShowDropdown(!showDropdown);
  };

  const handleDoubleClick = () => {
    navigate(`/admin/pixel/edit/${pixel.id}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ 
          y: -5,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        className="relative group cursor-pointer w-full h-80"
        onDoubleClick={handleDoubleClick}
      >
        <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                pixel.is_active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  pixel.is_active ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                {pixel.is_active ? 'Active' : 'Inactive'}
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  ref={dropdownButtonRef}
                  onClick={toggleDropdown}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isDeleting}
                >
                  <FaEllipsisV className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <>
                    {/* Mobile backdrop - covers entire screen */}
                    <div 
                      className="fixed inset-0 bg-black/40 z-[9998] md:hidden" 
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: dropdownPosition === 'bottom' ? -20 : 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: dropdownPosition === 'bottom' ? -20 : 20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={getDropdownClasses()}
                    >
                      <button
                        onClick={handleEditClick}
                        className="flex items-center w-full px-4 py-2 text-base md:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                      >
                        <FaEdit className="mr-3 text-blue-500 flex-shrink-0" />
                        <span>Edit Pixel</span>
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex items-center w-full px-4 py-2 text-base md:text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 touch-manipulation"
                      >
                        <FaTrash className="mr-3 flex-shrink-0" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <FaChartLine className="text-2xl text-white" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2 line-clamp-2">
              {pixel.name}
            </h3>

            {pixel.vcard?.name && (
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-700">
                  <FaIdCard className="mr-1.5 text-xs" />
                  <span className="truncate max-w-[120px]">{pixel.vcard.name}</span>
                </div>
              </div>
            )}

            <div className="mt-auto">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FaCalendarAlt className="mr-2" />
                <span>
                  {new Date(pixel.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {pixel.isDisabled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl z-10">
              <div className="text-center p-6">
                <FaLock className="text-white text-2xl mb-3 mx-auto" />
                <div className="text-white text-sm font-medium mb-3">
                  Upgrade plan to activate
                </div>
                <button
                  onClick={() => navigate('/admin/account/plan')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        itemName={pixel.name}
      />
    </>
  );
};

export default PixelItem;