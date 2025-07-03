import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaShare, 
  FaDownload, 
  FaEllipsisV, 
  FaEdit,
  FaTrash,
  FaLock,
  FaIdCard,
  FaTh,
  FaChartLine
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { vcardService } from '../services/api';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from './../modals/DeleteConfirmationModal';
import { VCard } from "./../services/vcard";

interface VCardItemProps {
  vcard: VCard;
  onDeleteSuccess?: () => void;
}

const VCardItem: React.FC<VCardItemProps> = ({ vcard, onDeleteSuccess }) => {
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

  const getBackgroundStyle = () => {
    switch (vcard.background_type) {
      case 'color':
        return { backgroundColor: vcard.background_value };
      case 'custom-image':
        return { 
          backgroundImage: `url(${vcard.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'gradient':
      case 'gradient-preset':
        return { 
          background: vcard.background_value,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return {};
    }
  };

  const handleDoubleClick = () => {
    if (vcard.url) {
      navigate(`/vcard/${vcard.url}`);
    }
  };

  const handleEditClick = () => {
    navigate(`/admin/vcard/edit-vcard/${vcard.id}`);
  };

  const handleViewVCard = () => {
    if (vcard.url) {
      window.open(`/vcard/${vcard.url}`, '_blank');
    }
  };

  const handleBlocksClick = () => {
    navigate(`/admin/vcard/edit-vcard/${vcard.id}/blocks`);
  };

  const handleStatsClick = () => {
    navigate(`/admin/vcard/stats/${vcard.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowDropdown(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await vcardService.delete(vcard.id);
      toast.success(`VCard "${vcard.name}" deleted successfully`);
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Error deleting VCard:', error);
      toast.error(`Failed to delete VCard "${vcard.name}"`);
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
    setShowDropdown(!showDropdown);
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-700 relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-72 w-64 cursor-pointer"
        style={getBackgroundStyle()}
        onDoubleClick={handleDoubleClick}
      >
        {vcard.isDisabled && ( 
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
        {vcard.background_type === 'custom-image' && (
          <div className="absolute inset-0 bg-black/10 dark:bg-gray-800/30"></div>
        )}

        {vcard.favicon && vcard.favicon !== 'default' && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-gray-300 bg-white dark:bg-gray-800">
            <img 
              src={vcard.favicon} 
              alt="Favicon" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative h-full flex flex-col p-6">
          <div className="flex justify-center mb-4">
            {vcard.logo ? (
              <img
                src={vcard.logo}
                alt={`${vcard.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary dark:border-gray-200"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center bg-gray-100 border-primary dark:bg-gray-800"
                style={{ border: `2px solid` }}
              >
                <span className='text-primary'>{vcard.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center text-center">
            <h2 className="text-xl font-bold mb-2 line-clamp-1 text-cool-gray-900 dark:text-white">
              {vcard.name}
            </h2>
            {vcard.description && (
              <p 
                className="text-sm mb-4 line-clamp-3 text-cool-gray-900 dark:text-white"
                style={{opacity: 0.9 }}
              >
                {vcard.description}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <span 
                className={`px-2 py-1 rounded-full text-xs flex items-center ${
                  vcard.is_active ? 'bg-green-500' : 'bg-gray-500'
                }`}
                style={{ 
                  color: '#ffffff',
                  boxShadow: 'none' 
                }}
              >
                {vcard.is_active ? (
                  <>
                    <FaEye className="mr-1" /> Active
                  </>
                ) : (
                  <>
                    <FaEyeSlash className="mr-1" /> Inactive
                  </>
                )}
              </span>
              
              <span 
                className="px-2 py-1 rounded-full text-xs flex items-center backdrop-blur-sm"
                style={{
                  boxShadow: 'none',
                  position: 'relative',
                  minWidth: '60px' 
                }}
              >
                <FaEye className="mr-1 text-blue-500" style={{ flexShrink: 0 }} />
                <span className="font-medium" style={{ flexShrink: 0 }}>
                  {vcard.views ?? 0}
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {vcard.is_share && (
                <button 
                  className="p-1 rounded-full hover:bg-white/20 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaShare size={14} />
                </button>
              )}
              {vcard.is_downloaded && (
                <button 
                  className="p-1 rounded-full hover:bg-white/20 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaDownload size={14} />
                </button>
              )}

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="p-1 rounded-full hover:bg-white/20 transition"
                  disabled={isDeleting}
                >
                  <FaEllipsisV size={14} />
                </button>
                
                {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                >
                  <button
                    onClick={handleViewVCard}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaIdCard className="mr-3 text-blue-500" />
                    View VCard
                  </button>
                  <button
                    onClick={handleBlocksClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaTh className="mr-3 text-green-500" />
                    VCard Blocks
                  </button>
                  <button
                    onClick={handleStatsClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaChartLine className="mr-3 text-purple-500" />
                    Stats
                  </button>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaEdit className="mr-3 text-blue-500" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <FaTrash className="mr-3" />
                    Delete
                  </button>
                </motion.div>
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
        itemName={vcard.name}
      />
    </>
  );
};

export default VCardItem;