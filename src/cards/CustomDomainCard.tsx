import React, { useState } from 'react';
import { FaGlobe, FaTrash, FaSync, FaLink, FaUnlink, FaEdit } from 'react-icons/fa';
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

  const handleEdit = () => {
    navigate(`/admin/custom-domains/edit/${domain.id}`);
  };

  const handleLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (domain.id) {
      navigate(`/admin/custom-domains/link/${domain.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ajouté pour empêcher la propagation
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (domain.id) {
        // Appel direct au service sans confirmation supplémentaire
        await customDomainService.delete(domain.id);
        onRefresh(); // Rafraîchir la liste après suppression
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
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                  <FaGlobe className="text-indigo-600 dark:text-indigo-400 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                    {domain.domain}
                  </h3>
                  <div className="mt-1">
                    <StatusBadge status={domain.status} />
                  </div>
                </div>
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

          <div className="mt-6 flex flex-col gap-3">
            {domain.status === 'pending' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  domain.id && onVerify(domain.id);
                }}
                className="flex items-center justify-center px-3 py-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg transition-all border border-blue-500/30"
              >
                <FaSync className="mr-1.5" />
                Verify Domain
              </button>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center justify-center flex-1 px-3 py-2 text-sm bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded-lg transition-all border border-gray-500/30"
              >
                <FaEdit className="mr-1.5" />
                Edit
              </button>

              {domain.vcardId ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    domain.id && customDomainService.unlinkFromVCard(domain.id).then(onRefresh);
                  }}
                  className="flex items-center justify-center flex-1 px-3 py-2 text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition-all border border-amber-500/30"
                >
                  <FaUnlink className="mr-1.5" />
                  Unlink
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLink}
                  className="flex items-center justify-center flex-1 px-3 py-2 text-sm bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg transition-all border border-green-500/30"
                >
                  <FaLink className="mr-1.5" />
                  Link
                </button>
              )}

              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex items-center justify-center flex-1 px-3 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all border border-red-500/30"
              >
                <FaTrash className="mr-1.5" />
                Delete
              </button>
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