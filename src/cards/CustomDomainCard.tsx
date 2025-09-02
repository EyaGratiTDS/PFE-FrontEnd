import React, { useState, useEffect, useRef } from 'react';
import { FaGlobe, FaTrash, FaSync, FaEdit, FaLock, FaEllipsisV } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from './../atoms/Badge/StatusBadge';
import { CustomDomain } from '../services/CustomDomain';
import { customDomainService } from '../services/api';
import DeleteConfirmationModal from '../modals/DeleteConfirmationModal';

interface CustomDomainCardProps {
  domain: CustomDomain;
  onDelete: (id: number) => void;
  onVerify: (id: number) => void;
  onRefresh: () => void;
}

const CustomDomainCard: React.FC<CustomDomainCardProps> = ({
  domain,
  onVerify,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('top');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

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
    const dropdownHeight = domain.status === 'pending' ? 160 : 120; // More height if verify button is present
    
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

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      calculateDropdownPosition();
    }
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    if (!domain.isDisabled) {
      setShowDropdown(false);
      navigate(`/admin/custom-domains/edit/${domain.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    setIsDeleteModalOpen(true);
  };

  const handleVerifyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDropdown(false);
    if (domain.id) {
      onVerify(domain.id);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (domain.id) {
        await customDomainService.delete(domain.id);
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 relative"
      >
        {domain.isDisabled && (
          <div className="absolute inset-0 bg-black/30 dark:bg-gray-900/50 flex items-center justify-center rounded-xl z-10">
            <div className="text-center p-4">
              <FaLock className="text-white text-2xl mb-2 mx-auto" />
              <div className="text-white text-sm font-medium mb-2">
                Upgrade plan to activate
              </div>
              <button
                onClick={() => navigate('/admin/account/plan')}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                  <FaGlobe className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    {domain.domain}
                  </h3>
                  <div className="mt-1">
                    <StatusBadge status={domain.status} />
                  </div>
                </div>
                
                {/* Dropdown menu */}
                {!domain.isDisabled && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      ref={dropdownButtonRef}
                      onClick={toggleDropdown}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                          {domain.status === 'pending' && (
                            <button
                              onClick={handleVerifyClick}
                              className="flex items-center w-full px-4 py-2 text-base md:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors touch-manipulation"
                            >
                              <FaSync className="mr-3 flex-shrink-0" />
                              <span>Verify Domain</span>
                            </button>
                          )}
                          <button
                            onClick={handleEdit}
                            className="flex items-center w-full px-4 py-2 text-base md:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                          >
                            <FaEdit className="mr-3 text-blue-500 flex-shrink-0" />
                            <span>Edit Domain</span>
                          </button>
                          <button
                            onClick={handleDeleteClick}
                            className="flex items-center w-full px-4 py-2 text-base md:text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                          >
                            <FaTrash className="mr-3 flex-shrink-0" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {domain.custom_index_url && (
                    <a
                      href={domain.custom_index_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Landing Page ↗
                    </a>
                  )}
                </div>

                {domain.vcard ? (
                  <div className="flex items-center gap-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400">Linked to:</span>
                    <Link
                      to={`/vcard/${domain.vcard.url.split('/').pop()}`}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                    >
                      {domain.vcard.name}
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    No vCard linked
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName={domain.domain}
      />
    </>
  );
};

export default CustomDomainCard;