import React, { useState } from "react";
import { 
  FaTimes, 
  FaRobot, 
  FaMagic, 
  FaCheck, 
  FaSpinner, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaLink, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaGlobe,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
  FaTelegram,
  FaSpotify,
  FaPinterest,
  FaSnapchat,
  FaTwitch,
  FaDiscord,
  FaReddit,
  FaGithub,
  FaFacebookMessenger
} from "react-icons/fa";
import { toast } from "react-toastify";
import LoadingSpinner from "../Loading/LoadingSpinner";
import { aiVCardService } from "../services/aiVCardService";
import { AIGenerateVCardFullResponse } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import ContactBlock from "../cards/ContactBlock";
import { BlockIconConfig } from "../services/vcard";

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: AIGenerateVCardFullResponse) => void;
}

interface FormData {
  job: string;
  skills: string;
}

interface FormErrors {
  job?: string;
  skills?: string;
}

const AIGenerateModal: React.FC<AIGenerateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({ job: "", skills: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<AIGenerateVCardFullResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'preview' | 'generating'>('form');
  const [isPreviewMode, setIsPreviewMode] = useState(true); // true = preview, false = confirmed

  // Configuration des icônes pour les blocks (identique à VCardViewPage)
  const blockIcons: Record<string, BlockIconConfig> = {
    // Official BlockTypes (with exact capitalization)
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
    'Link': {
      icon: FaLink,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'Facebook': {
      icon: FaFacebook,
      gradient: 'from-blue-600 to-blue-700',
      shadow: 'shadow-blue-600/20'
    },
    'Twitter': {
      icon: FaTwitter,
      gradient: 'from-blue-400 to-blue-500',
      shadow: 'shadow-blue-400/20'
    },
    'Instagram': {
      icon: FaInstagram,
      gradient: 'from-pink-500 via-red-500 to-yellow-500',
      shadow: 'shadow-pink-500/20'
    },
    'Youtube': {
      icon: FaYoutube,
      gradient: 'from-red-600 to-red-700',
      shadow: 'shadow-red-600/20'
    },
    'Whatsapp': {
      icon: FaWhatsapp,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Tiktok': {
      icon: FaTiktok,
      gradient: 'from-gray-900 via-gray-800 to-gray-700',
      shadow: 'shadow-gray-900/20'
    },
    'Telegram': {
      icon: FaTelegram,
      gradient: 'from-blue-400 to-blue-500',
      shadow: 'shadow-blue-400/20'
    },
    'Spotify': {
      icon: FaSpotify,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Pinterest': {
      icon: FaPinterest,
      gradient: 'from-red-600 to-red-700',
      shadow: 'shadow-red-600/20'
    },
    'Linkedin': {
      icon: FaLinkedin,
      gradient: 'from-blue-700 to-blue-800',
      shadow: 'shadow-blue-700/20'
    },
    'Snapchat': {
      icon: FaSnapchat,
      gradient: 'from-yellow-400 to-yellow-500',
      shadow: 'shadow-yellow-400/20'
    },
    'Twitch': {
      icon: FaTwitch,
      gradient: 'from-purple-600 to-purple-700',
      shadow: 'shadow-purple-600/20'
    },
    'Discord': {
      icon: FaDiscord,
      gradient: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20'
    },
    'Reddit': {
      icon: FaReddit,
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/20'
    },
    'GitHub': {
      icon: FaGithub,
      gradient: 'from-gray-700 to-gray-800',
      shadow: 'shadow-gray-700/20'
    },
    'Messenger': {
      icon: FaFacebookMessenger,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    // Common lowercase variations for API compatibility
    'phone': {
      icon: FaPhone,
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20'
    },
    'email': {
      icon: FaEnvelope,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20'
    },
    'link': {
      icon: FaLink,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'website': {
      icon: FaGlobe,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'Website': {
      icon: FaGlobe,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'linkedin': {
      icon: FaLinkedin,
      gradient: 'from-blue-700 to-blue-800',
      shadow: 'shadow-blue-700/20'
    },
    'github': {
      icon: FaGithub,
      gradient: 'from-gray-700 to-gray-800',
      shadow: 'shadow-gray-700/20'
    },
    'Github': {  // Alternative capitalization
      icon: FaGithub,
      gradient: 'from-gray-700 to-gray-800',
      shadow: 'shadow-gray-700/20'
    },
    'default': {
      icon: FaGlobe,
      gradient: 'from-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/20'
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ job: "", skills: "" });
      setErrors({});
      setGeneratedResult(null);
      setCurrentStep('form');
      setIsPreviewMode(true);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.job.trim()) {
      newErrors.job = "Job title is required";
    } else if (formData.job.trim().length < 2) {
      newErrors.job = "Job title must contain at least 2 characters";
    }
    
    if (!formData.skills.trim()) {
      newErrors.skills = "Skills are required";
    } else if (formData.skills.trim().length < 3) {
      newErrors.skills = "Please describe your skills (min. 3 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getCurrentUserId = (): number => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = currentUser.id;
    
    if (!userId) {
      throw new Error("Utilisateur non authentifié");
    }
    
    return userId;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      toast.warning("Veuillez corriger les erreurs du formulaire");
      return;
    }

    try {
      setLoading(true);
      setCurrentStep('generating');

      // Get current user ID from localStorage or token
      const userId = getCurrentUserId();

      // Utiliser la méthode unique generateVCard
      const result = await aiVCardService.generateVCard({
        job: formData.job.trim(),
        skills: formData.skills.trim(),
        userId: userId
      });

      console.log('✅ AI Generation Success:', {
        project: result.project,
        vcard: result.vcard,
        blocksCount: result.blocks?.length || 0
      });
      
      setGeneratedResult(result);
      setCurrentStep('preview');
      setIsPreviewMode(true); // Toujours en mode preview initialement
      toast.success("VCard generated successfully!");
      
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Error generating VCard");
      setCurrentStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!generatedResult) return;

    try {
      setConfirmLoading(true);
      
      // Get current user ID
      const userId = getCurrentUserId();
      
      // Utiliser la nouvelle signature avec les données complètes
      const savedResult = await aiVCardService.notifyUserAction('accept', userId, generatedResult);
      
      if (savedResult) {
        console.log('✅ VCard accepted and saved:', savedResult);
        setGeneratedResult(savedResult); // Mettre à jour avec les données sauvegardées (avec IDs)
        setIsPreviewMode(false);
        
        if (onSuccess) {
          onSuccess(savedResult);
        }
      } else {
        // Fallback si pas de données retournées
        if (onSuccess) {
          onSuccess(generatedResult);
        }
      }
      
      toast.success("VCard accepted and saved successfully!");
      onClose();
      
    } catch (error: any) {
      console.error("Error accepting VCard:", error);
      toast.error(error.message || "Error saving VCard");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRegenerate = async () => {
    // Notifier le backend que l'utilisateur a choisi de régénérer
    if (generatedResult?.vcard.id) {
      try {
        // Get current user ID
        const userId = getCurrentUserId();
        
        await aiVCardService.notifyUserAction('regenerate', userId, undefined, generatedResult.vcard.id);
        console.log('✅ Regenerate action notified to backend - VCard should be discarded');
      } catch (error) {
        console.warn('Failed to notify regenerate action:', error);
      }
    }
    
    // Reset all states to regenerate
    setGeneratedResult(null);
    setCurrentStep('form');
    setIsPreviewMode(true);
    console.log('🔄 Regenerating VCard - previous version discarded');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 relative flex-shrink-0">
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              <FaTimes size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaRobot size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Generation</h2>
                <p className="text-white/90 text-sm">Create your VCard with AI</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-200">
            <div className="p-6">
            {currentStep === 'form' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Job Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title / Profession *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Web Developer, Designer, Consultant..."
                    value={formData.job}
                    onChange={(e) => handleInputChange('job', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.job 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-purple-200 focus:border-purple-500'
                    } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    disabled={loading}
                  />
                  {errors.job && (
                    <p className="text-red-500 text-sm mt-1">{errors.job}</p>
                  )}
                </div>

                {/* Skills Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills *
                  </label>
                  <textarea
                    placeholder="Ex: JavaScript, React, Node.js, UI/UX Design, Project Management..."
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                      errors.skills 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-purple-200 focus:border-purple-500'
                    } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                    disabled={loading}
                  />
                  {errors.skills && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Generation in progress...</span>
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      <span>Generate my VCard</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  AI will automatically create your project, VCard and professional blocks
                </p>
              </motion.div>
            )}

            {currentStep === 'generating' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-6">
                  <LoadingSpinner />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4">
                    Generation in progress...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    AI analyzes your information and creates your personalized VCard
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 'preview' && generatedResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Preview mode indicator */}
                {isPreviewMode && (
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm">
                      <FaMagic />
                      <span>Preview Mode - Not saved yet</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                    <FaCheck />
                    <span>VCard generated successfully!</span>
                  </div>
                </div>

                {/* VCard Preview - Adaptive height to show all blocks */}
                <div 
                  className="relative overflow-hidden rounded-xl shadow-lg mb-4 min-h-[500px] scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
                  style={{
                    backgroundColor: generatedResult.vcard?.background_value || '#f8fafc',
                    backgroundImage: generatedResult.vcard?.background_type === 'custom-image'
                      ? `url(${generatedResult.vcard.background_value})`
                      : generatedResult.vcard?.background_type === 'gradient' || generatedResult.vcard?.background_type === 'gradient-preset'
                      ? generatedResult.vcard.background_value
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    fontFamily: generatedResult.vcard?.font_family || 'Inter',
                    fontSize: `${generatedResult.vcard?.font_size || 16}px`
                  }}
                  onLoad={() => console.log('VCard preview rendered with:', {
                    background_type: generatedResult.vcard?.background_type,
                    background_value: generatedResult.vcard?.background_value,
                    logo: generatedResult.vcard?.logo,
                    favicon: generatedResult.vcard?.favicon
                  })}
                >
                  {/* Overlay pour les images de fond */}
                  {generatedResult.vcard?.background_type === 'custom-image' && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                  )}
                  
                  {/* Effets décoratifs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full filter blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
                  
                  {/* Indicateur du type de background */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white/90">
                      Background: {generatedResult.vcard?.background_type || 'color'}
                    </div>
                  </div>
                  
                  {/* Header du projet */}
                  {generatedResult.project && (
                    <div className="relative z-10 p-4 border-b border-white/20">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: generatedResult.project.color || '#6366f1' }}
                          ></div>
                          <span className="text-white/90 font-medium text-sm">
                            {generatedResult.project.name}
                          </span>
                        </div>
                        <span className="text-white/60 text-xs">•</span>
                        <span className="text-white/70 text-xs capitalize">
                          {generatedResult.project.status || 'active'}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Contenu de la VCard */}
                  <div className="relative z-10 p-6 text-center">
                    {/* Logo et Favicon */}
                    <div className="mb-6 flex justify-center items-center space-x-4">
                      {/* Logo principal */}
                      <div className="relative">
                        {generatedResult.vcard?.logo ? (
                          <>
                            <img
                              src={generatedResult.vcard.logo}
                              alt={`${generatedResult.vcard.name} logo`}
                              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                              onLoad={() => console.log('✅ Logo loaded successfully:', generatedResult.vcard?.logo)}
                              onError={(e) => {
                                console.warn('⚠️ Logo failed to load, using fallback:', generatedResult.vcard?.logo);
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            {/* Fallback logo */}
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center" style={{ display: 'none' }}>
                              <span className="text-white text-2xl font-bold">
                                {generatedResult.vcard?.name?.charAt(0)?.toUpperCase() || 'V'}
                              </span>
                            </div>
                          </>
                        ) : (
                          /* Placeholder si pas de logo */
                          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              {generatedResult.vcard?.name?.charAt(0)?.toUpperCase() || 'V'}
                            </span>
                          </div>
                        )}
                        
                        {/* Favicon en overlay */}
                        {generatedResult.vcard?.favicon && (
                          <div className="absolute -bottom-2 -right-2">
                            <img
                              src={generatedResult.vcard.favicon}
                              alt="Favicon"
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                              onLoad={() => console.log('✅ Favicon loaded successfully:', generatedResult.vcard?.favicon)}
                              onError={(e) => {
                                console.warn('⚠️ Favicon failed to load:', generatedResult.vcard?.favicon);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Nom */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {generatedResult.vcard?.name || 'Generated VCard'}
                    </h3>
                    
                    {/* Description */}
                    {generatedResult.vcard?.description && (
                      <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                        {generatedResult.vcard.description}
                      </p>
                    )}
                    
                    {/* Blocks individuels comme dans VCardViewPage */}
                    {generatedResult.blocks && generatedResult.blocks.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">
                          Professional Blocks Generated ({generatedResult.blocks.length}):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                          {generatedResult.blocks.map((block, index) => {
                            const blockType = block.type_block || 'default';
                            const iconConfig = blockIcons[blockType as keyof typeof blockIcons] || blockIcons.default;
                            
                            // Debug logging
                            if (!blockIcons[blockType as keyof typeof blockIcons]) {
                              console.warn(`⚠️ No icon config found for block type: "${blockType}", using default`);
                            } else {
                              console.log(`✅ Icon config found for block type: "${blockType}"`);
                            }
                            
                            return (
                              <motion.div
                                key={block.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="w-full"
                              >
                                <ContactBlock
                                  block={{
                                    id: block.id?.toString() || index.toString(),
                                    name: block.name || `Block ${index + 1}`,
                                    description: block.description || '',
                                    type_block: blockType,
                                    status: block.status !== undefined ? block.status : true,
                                    vcardId: generatedResult.vcard?.id || 0
                                  }}
                                  iconConfig={iconConfig}
                                  onClick={() => {}} // Pas d'action dans la preview
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Block count info */}
                        <div className="mt-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <FaCheck className="w-3 h-3 mr-1" />
                            {generatedResult.blocks.length} block{generatedResult.blocks.length > 1 ? 's' : ''} generated
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Section projet en bas (comme dans VCardViewPage) */}
                  {generatedResult.project && (
                    <div className="relative z-10 mx-4 mb-4">
                      <div className="relative overflow-hidden rounded-xl shadow-lg bg-white backdrop-blur-sm bg-opacity-90 p-4 border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: generatedResult.project.color || '#6366f1' }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">
                              {generatedResult.project.name}
                            </h4>
                            {generatedResult.project.description && (
                              <p className="text-sm text-gray-600 truncate">
                                {generatedResult.project.description}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                            generatedResult.project.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {generatedResult.project.status === 'active' ? 'Active' : generatedResult.project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations détaillées - Pliables */}
                <details className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <summary className="cursor-pointer p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300">Technical Details</h5>
                      <span className="text-xs text-gray-500">▼</span>
                    </div>
                  </summary>
                  <div className="p-4 pt-0 space-y-2 text-sm border-t border-gray-200 dark:border-gray-600">
                  
                  {/* Status de sauvegarde */}
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <div className="flex items-center space-x-2">
                      {isPreviewMode ? (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-yellow-600 dark:text-yellow-400 text-xs">Preview Mode - Not saved</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 dark:text-green-400 text-xs">Saved in Database</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {generatedResult.project && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Project:</span>
                        <span className="text-gray-600 dark:text-gray-400">{generatedResult.project.name}</span>
                      </div>
                      {generatedResult.project.description && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                          <span className="text-gray-600 dark:text-gray-400 text-right max-w-xs truncate">
                            {generatedResult.project.description}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Project Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          generatedResult.project.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {generatedResult.project.status === 'active' ? 'Active' : generatedResult.project.status}
                        </span>
                      </div>
                    </>
                  )}
                  {generatedResult.vcard && (
                    <>
                      {/* Logo Info */}
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Logo:</span>
                        <div className="flex items-center space-x-2">
                          {generatedResult.vcard.logo ? (
                            <>
                              <img src={generatedResult.vcard.logo} alt="Logo" className="w-6 h-6 rounded object-cover" />
                              <span className="text-green-600 text-xs">✓ Defined</span>
                            </>
                          ) : (
                            <span className="text-yellow-600 text-xs">⚠ Placeholder used</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Favicon Info */}
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Favicon:</span>
                        <div className="flex items-center space-x-2">
                          {generatedResult.vcard.favicon ? (
                            <>
                              <img src={generatedResult.vcard.favicon} alt="Favicon" className="w-4 h-4 rounded object-cover" />
                              <span className="text-green-600 text-xs">✓ Defined</span>
                            </>
                          ) : (
                            <span className="text-yellow-600 text-xs">⚠ Not defined</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">URL VCard:</span>
                        <span className="text-gray-600 dark:text-gray-400 truncate ml-2 font-mono text-xs">
                          {generatedResult.vcard.url || 'To be generated'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Background:</span>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-6 rounded border border-gray-300"
                            style={{ 
                              background: generatedResult.vcard.background_type === 'gradient' || generatedResult.vcard.background_type === 'gradient-preset'
                                ? generatedResult.vcard.background_value
                                : generatedResult.vcard.background_type === 'custom-image'
                                ? `url(${generatedResult.vcard.background_value})`
                                : generatedResult.vcard.background_value,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          ></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {generatedResult.vcard.background_type || 'color'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Font:</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {generatedResult.vcard.font_family || 'Inter'} - {generatedResult.vcard.font_size || 16}px
                        </span>
                      </div>
                    </>
                  )}
                  {generatedResult.blocks && (
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total Blocks:</span>
                      <span className="text-gray-600 dark:text-gray-400 font-semibold">
                        {generatedResult.blocks.length} item(s)
                      </span>
                    </div>
                  )}
                  </div>
                </details>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleAccept}
                    disabled={confirmLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {confirmLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        <span>Accept & Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={confirmLoading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaMagic />
                    <span>Regenerate</span>
                  </button>
                </div>

                {/* Info supplémentaire */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Click "Accept & Save" to save your VCard to database, or "Regenerate" to create a new one
                </p>
              </motion.div>
            )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIGenerateModal;