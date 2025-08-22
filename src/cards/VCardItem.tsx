import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized background style calculation
  const backgroundStyle = useMemo(() => {
    if (!vcard.background_type || !vcard.background_value) {
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
    }

    switch (vcard.background_type) {
      case 'color':
        return { backgroundColor: vcard.background_value };
      case 'custom-image':
        return { 
          backgroundImage: `url(${vcard.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'gradient':
      case 'gradient-preset':
        return { 
          background: vcard.background_value,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
    }
  }, [vcard.background_type, vcard.background_value]);

  // Event handlers
  const handleDoubleClick = useCallback(() => {
    if (vcard.url && !vcard.isDisabled) {
      navigate(`/vcard/${vcard.url}`);
    }
  }, [vcard.url, vcard.isDisabled, navigate]);

  const handleEditClick = useCallback(() => {
    if (!vcard.isDisabled) {
      navigate(`/admin/vcard/edit-vcard/${vcard.id}`);
    }
  }, [vcard.id, vcard.isDisabled, navigate]);

  const handleViewVCard = useCallback(() => {
    if (vcard.url && !vcard.isDisabled) {
      window.open(`/vcard/${vcard.url}`, '_blank');
    }
  }, [vcard.url, vcard.isDisabled]);

  const handleBlocksClick = useCallback(() => {
    if (!vcard.isDisabled) {
      navigate(`/admin/vcard/edit-vcard/${vcard.id}/blocks`);
    }
  }, [vcard.id, vcard.isDisabled, navigate]);

  const handleStatsClick = useCallback(() => {
    if (!vcard.isDisabled) {
      navigate(`/admin/vcard/stats/${vcard.id}`);
    }
  }, [vcard.id, vcard.isDisabled, navigate]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vcard.isDisabled) {
      setShowDeleteModal(true);
      setShowDropdown(false);
    }
  }, [vcard.isDisabled]);

  const confirmDelete = useCallback(async () => {
    if (vcard.isDisabled) return;
    
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
  }, [vcard.id, vcard.name, vcard.isDisabled, onDeleteSuccess]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const toggleDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vcard.isDisabled) {
      setShowDropdown(!showDropdown);
    }
  }, [showDropdown, vcard.isDisabled]);

  const handleUpgradeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/admin/account/plan');
  }, [navigate]);

  // Handle image loading errors
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleFaviconError = useCallback(() => {
    setFaviconError(true);
  }, []);

  // Share functionality (placeholder)
  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (vcard.url && !vcard.isDisabled) {
      // Implement share functionality
      if (navigator.share) {
        navigator.share({
          title: vcard.name,
          text: vcard.description || `Check out ${vcard.name}'s digital business card`,
          url: `${window.location.origin}/vcard/${vcard.url}`
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${window.location.origin}/vcard/${vcard.url}`);
        toast.success('VCard URL copied to clipboard');
      }
    }
  }, [vcard.url, vcard.name, vcard.description, vcard.isDisabled]);

  // Download functionality (placeholder)
  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vcard.isDisabled) {
      // Implement download functionality
      toast.info('Download feature coming soon');
    }
  }, [vcard.isDisabled]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: vcard.isDisabled ? 0 : -5 }}
        transition={{ duration: 0.2 }}
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full h-80 overflow-hidden ${
          vcard.isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={backgroundStyle}
        onDoubleClick={handleDoubleClick}
      >
        {/* Disabled overlay - only show on disabled cards */}
        {vcard.isDisabled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-20">
            <div className="text-center p-6">
              <FaLock className="text-white text-2xl mb-3 mx-auto" />
              <div className="text-white text-sm font-medium mb-3">
                Upgrade plan to activate
              </div>
              <button
                onClick={handleUpgradeClick}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Background overlay for better text readability on images */}
        {vcard.background_type === 'custom-image' && (
          <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
        )}

        {/* Favicon */}
        {vcard.favicon && vcard.favicon !== 'default' && !faviconError && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full overflow-hidden border-2 border-white/80 bg-white shadow-sm z-20">
            <img 
              src={vcard.favicon} 
              alt="Favicon" 
              className="w-full h-full object-cover"
              onError={handleFaviconError}
            />
          </div>
        )}

        {/* Main content */}
        <div className="relative h-full flex flex-col p-6 z-10">
          {/* Logo section */}
          <div className="flex justify-center mb-4">
            {vcard.logo && !imageError ? (
              <img
                src={vcard.logo}
                alt={`${vcard.name} logo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                onError={handleImageError}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-xl font-bold text-white">
                  {vcard.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="flex-1 flex flex-col items-center text-center">
            <h2 className={`text-lg font-semibold mb-2 line-clamp-2 leading-tight ${
              vcard.background_type === 'custom-image' || vcard.background_type?.includes('gradient')
                ? 'text-white drop-shadow-md' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {vcard.name}
            </h2>
            
            {vcard.description && (
              <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${
                vcard.background_type === 'custom-image' || vcard.background_type?.includes('gradient')
                  ? 'text-white/90 drop-shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                {vcard.description}
              </p>
            )}
          </div>

          {/* Footer section */}
          <div className="mt-auto">
            {/* Status and views */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                  vcard.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {vcard.is_active ? (
                    <>
                      <FaEye className="mr-1 text-xs" /> Active
                    </>
                  ) : (
                    <>
                      <FaEyeSlash className="mr-1 text-xs" /> Inactive
                    </>
                  )}
                </span>
                
                <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <FaEye className="mr-1 text-xs" />
                  {vcard.views ?? 0}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1">
                {/* Share button */}
                {vcard.is_share && (
                  <button 
                    className={`p-2 rounded-full transition-colors ${
                      vcard.isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/20 active:bg-white/30'
                    }`}
                    onClick={handleShare}
                    disabled={vcard.isDisabled}
                    title="Share VCard"
                  >
                    <FaShare size={14} className={
                      vcard.background_type === 'custom-image' || vcard.background_type?.includes('gradient')
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400'
                    } />
                  </button>
                )}

                {/* Download button */}
                {vcard.is_downloaded && (
                  <button 
                    className={`p-2 rounded-full transition-colors ${
                      vcard.isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/20 active:bg-white/30'
                    }`}
                    onClick={handleDownload}
                    disabled={vcard.isDisabled}
                    title="Download VCard"
                  >
                    <FaDownload size={14} className={
                      vcard.background_type === 'custom-image' || vcard.background_type?.includes('gradient')
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400'
                    } />
                  </button>
                )}

                {/* Dropdown menu */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={toggleDropdown}
                    className={`p-2 rounded-full transition-colors ${
                      vcard.isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-white/20 active:bg-white/30'
                    }`}
                    disabled={isDeleting || vcard.isDisabled}
                    title="More options"
                  >
                    <FaEllipsisV size={14} className={
                      vcard.background_type === 'custom-image' || vcard.background_type?.includes('gradient')
                        ? 'text-white drop-shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400'
                    } />
                  </button>
                  
                  {/* Dropdown menu */}
                  {showDropdown && !vcard.isDisabled && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
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
                        Statistics
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
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
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
      </motion.div>

      {/* Delete confirmation modal */}
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