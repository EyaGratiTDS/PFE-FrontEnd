import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaCheck, FaRedo, FaEye, FaEnvelope, FaPhone, FaGlobe,
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaTelegram, 
  FaYoutube, FaInstagram, FaGithub, FaMapMarkerAlt, FaLink
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Block, BlockIconConfig } from '../services/vcard';
import ContactBlock from '../cards/ContactBlock';

interface VCardPreviewData {
  name: string;
  description: string;
  logo: string | null;
  favicon: string | null;
  background_value: string;
  background_type: 'color' | 'custom-image' | 'gradient' | 'gradient-preset';
  font_family: string;
  font_size: number;
  is_share: boolean;
  remove_branding: boolean;
  search_engine_visibility: boolean;
  blocks: Block[];
}

interface VCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (vcardData: VCardPreviewData) => Promise<void>;
  onRegenerate: () => void;
  vcardData: VCardPreviewData | null;
  isLoading?: boolean;
}

const VCardPreviewModal: React.FC<VCardPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept, 
  onRegenerate, 
  vcardData, 
  isLoading = false 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  console.log('VCard Data for Preview:', vcardData);

  // ✅ Détection du mode sombre
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setIsDarkMode(
        document.documentElement.classList.contains('dark') || 
        mediaQuery.matches
      );
    };

    mediaQuery.addListener(handleChange);
    const observer = new MutationObserver(handleChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => {
      mediaQuery.removeListener(handleChange);
      observer.disconnect();
    };
  }, []);

  // Configuration des icônes pour les blocks
  const blockIcons: Record<string, BlockIconConfig> = {
    'Phone': {
      icon: FaPhone,
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20'
    },
    'Email': {
      icon: FaEnvelope,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20'
    },
    'Address': {
      icon: FaMapMarkerAlt,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Website': {
      icon: FaGlobe,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'Facebook': {
      icon: FaFacebook,
      gradient: 'from-blue-600 to-blue-700',
      shadow: 'shadow-blue-500/20'
    },
    'Twitter': {
      icon: FaTwitter,
      gradient: 'from-sky-400 to-sky-500',
      shadow: 'shadow-sky-500/20'
    },
    'LinkedIn': {
      icon: FaLinkedin,
      gradient: 'from-blue-600 to-blue-700',
      shadow: 'shadow-blue-500/20'
    },
    'WhatsApp': {
      icon: FaWhatsapp,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Instagram': {
      icon: FaInstagram,
      gradient: 'from-pink-500 to-purple-600',
      shadow: 'shadow-pink-500/20'
    },
    'YouTube': {
      icon: FaYoutube,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20'
    },
    'GitHub': {
      icon: FaGithub,
      gradient: 'from-gray-700 to-gray-800',
      shadow: 'shadow-gray-500/20'
    },
    'Telegram': {
      icon: FaTelegram,
      gradient: 'from-sky-500 to-sky-600',
      shadow: 'shadow-sky-500/20'
    },
    'default': {
      icon: FaLink,
      gradient: 'from-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/20'
    }
  };

  const handleAccept = async () => {
    if (!vcardData) return;
    
    try {
      setIsSaving(true);
      await onAccept(vcardData);
      toast.success('VCard saved successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Error saving VCard:', error);
      toast.error('Failed to save VCard. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    onRegenerate();
    onClose();
  };

  const handleBlockAction = (blockType: string, description: string) => {
    // Mock action pour la prévisualisation
    console.log(`Preview action: ${blockType} - ${description}`);
  };

  if (!isOpen) return null;

  // Classes CSS adaptatives pour le mode sombre/clair
  const modalClasses = `
    fixed inset-0 flex items-center justify-center z-50
    ${isDarkMode ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-50'}
  `;

  const containerClasses = `
    rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto
    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
  `;

  const headerClasses = `
    relative text-white p-6 rounded-t-2xl
    ${isDarkMode 
      ? 'bg-gradient-to-r from-green-700 to-blue-700' 
      : 'bg-gradient-to-r from-green-600 to-blue-600'
    }
  `;

  const textClasses = {
    primary: isDarkMode ? 'text-white' : 'text-gray-900',
    secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
  };

  const buttonClasses = {
    accept: `
      px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center justify-center space-x-2 flex-1
      ${isDarkMode 
        ? 'bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700' 
        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
      }
      text-white
    `,
    regenerate: `
      px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
      flex items-center justify-center space-x-2 flex-1
      ${isDarkMode 
        ? 'bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700' 
        : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600'
      }
      text-white
    `,
    cancel: `
      px-6 py-3 rounded-lg transition-all
      ${isDarkMode 
        ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
      }
    `
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={modalClasses}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={containerClasses}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={headerClasses}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              disabled={isSaving}
            >
              <FaTimes size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <FaEye size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">VCard Preview</h2>
                <p className="text-green-100">Review your AI-generated VCard</p>
              </div>
            </div>
          </div>

          {/* VCard Preview Content */}
          <div className="p-6">
            {vcardData ? (
              <div className="space-y-6">
                {/* VCard Simulation */}
                <div className="relative">
                  {/* Background */}
                  <motion.div
                    className="min-h-screen relative overflow-hidden"
                    style={{
                      background: vcardData.background_type === 'color' 
                        ? vcardData.background_value
                        : vcardData.background_type === 'gradient'
                        ? `linear-gradient(135deg, ${vcardData.background_value})`
                        : vcardData.background_type === 'gradient-preset'
                        ? `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                        : '#f8fafc',
                      fontFamily: vcardData.font_family || 'Inter, sans-serif',
                      fontSize: `${vcardData.font_size || 16}px`
                    }}
                  >
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
                      {/* VCard Header */}
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <div className="text-center mb-12">
                          {vcardData.logo && (
                            <motion.div
                              initial={{ scale: 0.95 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                              className="relative mx-auto mb-6"
                            >
                              <img
                                src={vcardData.logo}
                                alt={`${vcardData.name} logo`}
                                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-md"
                              />
                            </motion.div>
                          )}
                          <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-white mb-3"
                          >
                            {vcardData.name}
                          </motion.h1>
                          {vcardData.description && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-lg text-white/90 max-w-2xl mx-auto"
                            >
                              {vcardData.description}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>

                      {/* Contact Blocks */}
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.1
                            }
                          }
                        }}
                        initial="hidden"
                        animate="show"
                      >
                        {vcardData.blocks?.filter((block: Block) => block.status).map((block) => {
                          const iconConfig = blockIcons[block.type_block as keyof typeof blockIcons] || blockIcons.default;
                          return (
                            <motion.div
                              key={block.id}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                              }}
                              whileHover={{
                                scale: 1.02,
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                              }}
                              transition={{ duration: 0.2 }}
                              className="cursor-pointer"
                              onClick={() => handleBlockAction(block.type_block, block.description)}
                            >
                              <ContactBlock
                                block={block}
                                iconConfig={iconConfig}
                                onClick={() => handleBlockAction(block.type_block, block.description)}
                              />
                            </motion.div>
                          );
                        })}
                      </motion.div>

                      {/* Branding */}
                      {!vcardData.remove_branding && (
                        <div className="absolute bottom-2 w-full text-center text-xs text-white/50 opacity-70 z-10">
                          <p>Powered by Digital Business Card</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleAccept}
                    disabled={isSaving || isLoading}
                    className={buttonClasses.accept}
                  >
                    <FaCheck />
                    <span>{isSaving ? 'Saving...' : 'Accept & Save VCard'}</span>
                  </button>
                  
                  <button
                    onClick={handleRegenerate}
                    disabled={isSaving || isLoading}
                    className={buttonClasses.regenerate}
                  >
                    <FaRedo />
                    <span>Regenerate Content</span>
                  </button>

                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className={buttonClasses.cancel}
                  >
                    Cancel
                  </button>
                </div>

                {/* Tips */}
                <div className={`mx-6 mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    💡 Review your VCard:
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    <li>• This is how your VCard will appear to visitors</li>
                    <li>• Check the design, colors, and contact blocks</li>
                    <li>• Click "Regenerate" if you want different content or style</li>
                    <li>• Click "Accept" to save this VCard to your account</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={textClasses.muted}>No VCard data to preview</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VCardPreviewModal;