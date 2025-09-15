import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { vcardService, authService, projectService, limitService } from "../../services/api";
import { FaCopy, FaCube, FaSyncAlt } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import LogoUploader from "../../atoms/uploads/LogoUploader";
import FaviconUploader from "../../atoms/uploads/FaviconUploader";
import BackgroundSettings from "../../atoms/settings/BackgroundSettings";
import Checkbox from "../../atoms/checkboxs/Checkbox";
import { Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import { VCard } from "../../services/vcard";

interface GoogleFont {
  family: string;
}

interface Project {
  id: string;
  name: string;
}

// Memoized popular fonts array
const POPULAR_FONTS = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Raleway", "Oswald",
  "Source Sans Pro", "Nunito", "Ubuntu", "Fira Sans", "PT Sans", "Noto Sans",
  "Work Sans", "Quicksand", "Inter", "Manrope", "Rubik", "Jost", "Karla",
  "Merriweather", "Playfair Display", "Lora", "PT Serif", "Libre Baskerville",
  "Alegreya", "Crimson Text", "Vollkorn", "Bitter", "Arvo", "Bebas Neue",
  "Anton", "Fredoka One", "Luckiest Guy", "Righteous", "Lobster", "Pacifico",
  "Chewy", "Sigmar One", "Abril Fatface", "Roboto Mono", "Source Code Pro",
  "Fira Code", "Inconsolata", "Courier Prime", "Space Mono", "IBM Plex Mono",
  "JetBrains Mono", "Overpass Mono", "Anonymous Pro", "Dancing Script",
  "Caveat", "Great Vibes", "Sacramento", "Parisienne", "Cookie",
  "Kaushan Script", "Satisfy", "Yellowtail"
] as const;

// File type validation constants
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif'] as const;
const ALLOWED_FAVICON_TYPES = [...ALLOWED_IMAGE_TYPES, 'image/x-icon'] as const;

// Initial vCard state
const INITIAL_VCARD_STATE: VCard = {
  id: "",
  name: "",
  description: "",
  logo: "",
  favicon: "",
  background_type: "color",
  background_value: "",
  font_family: "Arial, sans-serif",
  font_size: 16,
  search_engine_visibility: true,
  opengraph: "",
  url: "",
  remove_branding: false,
  qr_code: "",
  views: 0,
  status: true,
  projectId: 0,
  is_share: true,
  is_downloaded: true,
  is_active: true,
};

const EditVCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Main state
  const [vcard, setVCard] = useState<VCard>(INITIAL_VCARD_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  // Preview states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Background settings states
  const [selectedOption, setSelectedOption] = useState('gradient-preset');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#000000');
  const [gradientEnd, setGradientEnd] = useState('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);

  // Data states
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedPixelId, setSelectedPixelId] = useState<string>("");

  // Custom domain state
  const [hasCustomDomain, setHasCustomDomain] = useState(false);
  const [customDomainInfo, setCustomDomainInfo] = useState<any>(null);
  
  // User subscription state
  const [userPlan, setUserPlan] = useState<string>('free'); // 'free', 'pro', 'premium', etc.

  // Helper function to check if user has URL customization access
  const hasUrlAccess = useMemo(() => {
    return userPlan !== 'free';
  }, [userPlan]);

  // Memoized CSS classes for URL field to avoid recalculation
  const urlFieldClasses = useMemo(() => ({
    container: `inputForm-vcard ${!hasUrlAccess ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`,
    icon: `h-5 w-5 ${!hasUrlAccess ? 'text-gray-400' : 'text-gray-500'}`,
    input: `input-vcard w-full ${!hasUrlAccess ? 'cursor-not-allowed opacity-50' : ''}`,
    placeholder: !hasUrlAccess ? 'Upgrade to Basic/Pro to customize URL' : 'Enter your custom URL'
  }), [hasUrlAccess]);

  // Memoized breadcrumb links
  const breadcrumbLinks = useMemo(() => [
    { name: "vCard", path: "/admin/vcard" },
    { name: "Edit vCard", path: `/admin/vcard/edit-vcard/${id || ''}` },
  ], [id]);

  // Memoized full URL with custom domain logic - minimal recalculation
  const fullUrl = useMemo(() => {
    if (hasCustomDomain && customDomainInfo?.custom_index_url) {
      return customDomainInfo.custom_index_url;
    }
    // Use a simple, fast calculation without complex operations
    const baseUrl = window.location.origin;
    const urlValue = vcard.url || '';
    return `${baseUrl}/${urlValue}`;
  }, [hasCustomDomain, customDomainInfo?.custom_index_url, vcard.url]);

  // Utility function to extract colors from gradient
  const extractColorsFromGradient = useCallback((gradient: string) => {
    const regex = /linear-gradient\(.*?,\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/i;
    const matches = gradient.match(regex);

    if (matches && matches.length === 3) {
      return {
        start: matches[1],
        end: matches[2],
      };
    }
    return null;
  }, []);

  // File validation utility
  const validateFileType = useCallback((file: File, allowedTypes: readonly string[], typeName: string) => {
    const fileType = file.type.toLowerCase();
    if (!allowedTypes.includes(fileType as any)) {
      toast.error(`Unsupported file format for ${typeName}. Use ${allowedTypes.join(', ')}`);
      return false;
    }
    return true;
  }, []);

  // Generic file reader utility
  const readFileAsDataURL = useCallback((file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // Fetch fonts effect
  useEffect(() => {
    let isMounted = true;

    const fetchFonts = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
        );
        const data = await response.json();

        if (!isMounted) return;

        const filteredFonts = data?.items
          ?.filter((font: GoogleFont) => POPULAR_FONTS.includes(font.family as any))
          ?.map((font: GoogleFont) => ({ family: font.family })) || [];

        setFonts(filteredFonts);
      } catch (error) {
        console.error("Error loading fonts:", error);
        if (isMounted) setFonts([]);
      }
    };

    fetchFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load user and projects effect
  useEffect(() => {
    let isMounted = true;

    const loadUserAndProjects = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!isMounted || !user?.data.id) return;

        const projectsData = await projectService.getUserProjects(user.data.id);
        if (isMounted) {
          const activeProjects = projectsData.filter((project: any) => project.status === 'active');
          setProjects(activeProjects || []);
        }

        // Load user plan using fast limitService approach (same as VCardPage.tsx)
        if (isMounted) {
          try {

            
            // Use limitService like VCardPage.tsx - much faster than subscription API calls
            const limits = await limitService.checkVcardLimit();
            console.log('� VCard limits received:', limits);
            
            // Determine plan based on limits (same logic as VCardPage.tsx)
            // If max is 1 or very low, it's likely a free plan
            // If max is higher or unlimited, it's a paid plan
            let detectedPlan = 'free';
            if (limits.max === -1 || limits.max === Infinity) {
              detectedPlan = 'premium'; // Unlimited
            } else if (limits.max > 3) {
              detectedPlan = 'pro'; // Multiple vcards allowed
            } else if (limits.max > 1) {
              detectedPlan = 'basic'; // Few vcards allowed
            }
            // else remains 'free' for max = 1
            
            setUserPlan(detectedPlan);
            
          } catch (limitError) {
            console.error('❌ Error fetching plan limits:', limitError);
            setUserPlan('free');
          }
        }
      } catch (error) {
        console.error("Error loading user/projects:", error);
        if (isMounted) {
          toast.error("Failed to load projects");
        }
      }
    };

    loadUserAndProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch vCard data effect
  useEffect(() => {
    if (!id) {
      toast.error("Invalid vCard ID.");
      return;
    }

    let isMounted = true;

    const fetchVCard = async () => {
      try {
        const data = await vcardService.getById(id);
        
        if (!isMounted) return;

        setVCard(data);

        // Gérer les informations du domaine personnalisé
        if (data.hasCustomDomain && data.customDomainInfo) {
          setHasCustomDomain(true);
          setCustomDomainInfo(data.customDomainInfo);
        } else {
          setHasCustomDomain(false);
          setCustomDomainInfo(null);
        }

        // Set pixel ID if exists
        if (data.pixel?.id) {
          setSelectedPixelId(data.pixel.id);
        }

        // Handle background settings
        if (data.background_type === "gradient-preset") {
          setSelectedGradient(data.background_value);
          setSelectedOption("gradient-preset");
        } else if (data.background_type === "color") {
          setSolidColor(data.background_value);
          setSelectedOption("color");
        } else if (data.background_type === "gradient") {
          const gradientColors = extractColorsFromGradient(data.background_value);
          if (gradientColors) {
            setGradientStart(gradientColors.start);
            setGradientEnd(gradientColors.end);
          }
          setSelectedOption("gradient");
        } else if (data.background_type === "custom-image") {
          setImagePreview(data.background_value);
          setSelectedOption("custom-image");
        }

        // Set previews
        if (data.logo) setLogoPreview(data.logo);
        if (data.favicon) setFaviconPreview(data.favicon);
      } catch (error) {
        toast.error("Failed to fetch vCard data.");
        console.error(error);
      }
    };

    fetchVCard();

    return () => {
      isMounted = false;
    };
  }, [id, extractColorsFromGradient]);

  // Event handlers
  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVCard(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Optimize by avoiding object spread for every keystroke
    if (type === "checkbox") {
      setVCard(prev => {
        if (prev[name as keyof VCard] === (e.target as HTMLInputElement).checked) return prev;
        return { ...prev, [name]: (e.target as HTMLInputElement).checked };
      });
    } else {
      setVCard(prev => {
        if (prev[name as keyof VCard] === value) return prev;
        return { ...prev, [name]: value };
      });
    }
  }, []);

  const handleFileUploadBackground = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file, ALLOWED_IMAGE_TYPES, "background image")) return;

    readFileAsDataURL(file, (result) => {
      setImagePreview(result);
    });

    setBackgroundFile(file);
    setVCard(prev => ({ ...prev, background_type: 'custom-image' as const }));
  }, [validateFileType, readFileAsDataURL]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file, ALLOWED_IMAGE_TYPES, "logo")) return;

    readFileAsDataURL(file, setLogoPreview);
    setLogoFile(file);
  }, [validateFileType, readFileAsDataURL]);

  const handleFaviconUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileType(file, ALLOWED_FAVICON_TYPES, "favicon")) return;

    readFileAsDataURL(file, setFaviconPreview);
    setFaviconFile(file);
  }, [validateFileType, readFileAsDataURL]);

  const handleGradientPresetSelect = useCallback((preset: string) => {
    setSelectedGradient(preset);
    setVCard(prev => ({
      ...prev,
      background_type: 'gradient-preset' as const,
      background_value: preset,
    }));
  }, []);

  // New handlers for background settings
  const handleSolidColorChange = useCallback((color: string) => {
    setSolidColor(color);
    setVCard(prev => ({
      ...prev,
      background_type: 'color' as const,
      background_value: color,
    }));
  }, []);

  const handleGradientChange = useCallback((start: string, end: string) => {
    setGradientStart(start);
    setGradientEnd(end);
    const gradientValue = `linear-gradient(45deg, ${start}, ${end})`;
    setVCard(prev => ({
      ...prev,
      background_type: 'gradient' as const,
      background_value: gradientValue,
    }));
  }, []);

  const handleBackgroundOptionChange = useCallback((option: string) => {
    setSelectedOption(option);
    let backgroundValue = '';
    let backgroundType: 'color' | 'custom-image' | 'gradient' | 'gradient-preset' = 'color';

    switch (option) {
      case 'color':
        backgroundValue = solidColor;
        backgroundType = 'color';
        break;
      case 'gradient':
        backgroundValue = `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})`;
        backgroundType = 'gradient';
        break;
      case 'gradient-preset':
        backgroundValue = selectedGradient || '';
        backgroundType = 'gradient-preset';
        break;
      case 'custom-image':
        backgroundValue = vcard.background_value || '';
        backgroundType = 'custom-image';
        break;
      default:
        backgroundValue = solidColor;
        backgroundType = 'color';
    }

    setVCard(prev => ({
      ...prev,
      background_type: backgroundType,
      background_value: backgroundValue,
    }));
  }, [solidColor, gradientStart, gradientEnd, selectedGradient, vcard.background_value]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy URL");
    }
  }, [fullUrl]);

  const handleBlocks = useCallback(() => {
    if (!id) {
      toast.error("Invalid vCard ID.");
      return;
    }
    navigate(`/admin/vcard/edit-vcard/${id}/blocks`);
  }, [navigate, id]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error("Invalid vCard ID.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Helper function to safely add form fields
      const addFormField = (key: string, value: any) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      };

      // Add all form fields with proper validation
      addFormField('name', vcard.name || '');
      addFormField('description', vcard.description || '');
      addFormField('url', vcard.url || '');
      addFormField('remove_branding', vcard.remove_branding ? 'true' : 'false');
      addFormField('search_engine_visibility', vcard.search_engine_visibility ? 'true' : 'false');
      addFormField('is_share', vcard.is_share ? 'true' : 'false');
      addFormField('is_downloaded', vcard.is_downloaded ? 'true' : 'false');
      addFormField('is_active', vcard.is_active ? 'true' : 'false');
      addFormField('background_type', vcard.background_type || 'color');
      
      // Handle background value based on selected option
      let backgroundValue = '';
      switch (selectedOption) {
        case 'color':
          backgroundValue = solidColor;
          break;
        case 'gradient':
          backgroundValue = `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})`;
          break;
        case 'gradient-preset':
          backgroundValue = selectedGradient || '';
          break;
        case 'custom-image':
          backgroundValue = vcard.background_value || '';
          break;
        default:
          backgroundValue = vcard.background_value || solidColor;
      }
      addFormField('background_value', backgroundValue);
      
      addFormField('font_family', vcard.font_family || 'Arial, sans-serif');
      addFormField('font_size', vcard.font_size || 16);
      
      // Only add projectId if it's a valid number
      if (vcard.projectId && vcard.projectId > 0) {
        addFormField('projectId', vcard.projectId);
      }
      
      // Only add pixelId if it's selected
      if (selectedPixelId && selectedPixelId.trim() !== '') {
        addFormField('pixelId', selectedPixelId);
      }

      // Add files if they exist
      if (logoFile) {
        formData.append("logoFile", logoFile);
      }
      if (backgroundFile) {
        formData.append("backgroundFile", backgroundFile);
      }
      if (faviconFile) {
        formData.append("faviconFile", faviconFile);
      }

      console.log('🚀 Submitting form data for vCard update:', id);
      await vcardService.update(id, formData);
      toast.success("vCard updated successfully!");
      
      // Optionally refresh the page data or navigate
      // window.location.reload(); // Uncomment if you want to refresh
      
    } catch (error: any) {
      console.error('❌ VCard update error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update vCard.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    id, vcard, selectedPixelId, logoFile, backgroundFile, faviconFile, 
    selectedOption, solidColor, gradientStart, gradientEnd, selectedGradient
  ]);



  // Render JSX
  return (
    <div className="pt-4 pb-8 px-0 sm:px-4 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Breadcrumb */}
      <div className="mb-6 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <Breadcrumb className="mb-6">
          {breadcrumbLinks.map((link, index) => (
            <Breadcrumb.Item
              key={index}
              linkAs={Link}
              linkProps={{ to: link.path }}
              active={index === breadcrumbLinks.length - 1}
              className={`text-sm font-medium ${
                index === breadcrumbLinks.length - 1 
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              {index < breadcrumbLinks.length - 1 ? (
                <div className="flex items-center">
                  {link.name}
                  <FiChevronRight className="mx-2 text-gray-400" size={14} />
                </div>
              ) : (
                link.name
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-col bg-gray-50 dark:bg-gray-900 mx-auto max-w-6xl rounded-lg shadow-sm px-4 py-6 sm:p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full">
            {/* Header */}
            <div className="text-center mb-6 w-full px-2 sm:px-0">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Edit {vcard.name} vCard
              </h3>
              <div className="flex justify-center items-center gap-2 flex-wrap">
                {hasCustomDomain && customDomainInfo?.custom_index_url ? (
                  // Afficher l'URL personnalisée
                  <a
                    href={customDomainInfo.custom_index_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-purple-400 text-sm sm:text-base break-all"
                  >
                    {customDomainInfo.custom_index_url}
                  </a>
                ) : (
                  // Afficher l'URL par défaut
                  <a
                    href={`/${vcard.url.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-purple-400 text-sm sm:text-base break-all"
                  >
                    {fullUrl}
                  </a>
                )}
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  title="Copy URL"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
              </div>
              {/* Afficher un badge pour le domaine personnalisé */}
              {hasCustomDomain && customDomainInfo && (
                <div className="mt-2 flex justify-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Custom Domain: {customDomainInfo.domain}
                  </span>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="w-full px-2 sm:px-0">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="input-vcard w-full"
                      placeholder="Enter the Name"
                      name="name"
                      value={vcard.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute top-3 left-3">
                      <svg className="h-5 w-5 text-gray-500 mt-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0 4h7v2H7z" />
                      </svg>
                    </div>
                    <textarea
                      className="input-vcard min-h-[120px] pt-3 w-full"
                      placeholder="Enter the Description"
                      name="description"
                      value={vcard.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* URL Alias Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL Alias
                    {!hasUrlAccess && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Basic/Pro Feature
                      </span>
                    )}
                  </label>
                  <div className={urlFieldClasses.container}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className={urlFieldClasses.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      className={urlFieldClasses.input}
                      placeholder={urlFieldClasses.placeholder}
                      name="url"
                      value={vcard.url}
                      onChange={handleInputChange}
                      disabled={!hasUrlAccess}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    The main URL that your vcard is going to be able accessed from.
                    {!hasUrlAccess && (
                      <span className="block text-yellow-600 dark:text-yellow-400 mt-1">
                        🔒 Custom URL aliases are available with Basic/Pro plans. 
                        <Link to="/admin/subscription" className="underline hover:text-yellow-700">
                          Upgrade now
                        </Link>
                      </span>
                    )}
                  </p>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LogoUploader logoPreview={logoPreview} handleLogoUpload={handleLogoUpload} />
                  <FaviconUploader faviconPreview={faviconPreview} handleFaviconUpload={handleFaviconUpload} />
                </div>

                {/* Background Settings */}
                <BackgroundSettings
                  selectedOption={selectedOption}
                  setSelectedOption={handleBackgroundOptionChange}
                  solidColor={solidColor}
                  setSolidColor={handleSolidColorChange}
                  gradientStart={gradientStart}
                  setGradientStart={(color) => handleGradientChange(color, gradientEnd)}
                  gradientEnd={gradientEnd}
                  setGradientEnd={(color) => handleGradientChange(gradientStart, color)}
                  imagePreview={imagePreview}
                  handleFileUploadBackground={handleFileUploadBackground}
                  selectedGradient={selectedGradient}
                  handleGradientPresetSelect={handleGradientPresetSelect}
                  setVCard={setVCard}
                />

                {/* Project Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Associated Project
                  </label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9.76c0 .41-.34.75-.75.75H12v1.75c0 .41-.34.75-.75.75s-.75-.34-.75-.75V13.5h-1.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.5v-1.5c0-.41.34-.75.75-.75s.75.34.75.75v1.5h1.25c.41 0 .75.34.75.75zM18 11v6H6v-6h12z"/>
                      </svg>
                    </div>
                    <select
                      name="projectId"
                      className="input-vcard pl-10 pr-8 bg-transparent dark:bg-gray-800 dark:text-white w-full"
                      value={vcard.projectId || ""}
                      onChange={handleSelectChange}
                    >
                      <option value="" className="dark:bg-gray-800 dark:text-white">Select a project</option>
                      {projects.map((project) => (
                        <option
                          key={project.id}
                          value={project.id}
                          className="dark:bg-gray-800 dark:text-white"
                        >
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Don't have a project?{' '}
                    <Link
                      to="/admin/project"
                      className="text-primary hover:text-purple-400 font-medium"
                    >
                      Create one
                    </Link>
                  </p>
                </div>

                {/* Font Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</label>
                    <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                      <select
                        name="font_family"
                        value={vcard.font_family}
                        onChange={handleSelectChange}
                        className="input-vcard pl-3 pr-8 bg-transparent dark:bg-gray-800 dark:text-white w-full"
                      >
                        {fonts.map((font) => (
                          <option
                            key={font.family}
                            value={font.family}
                            className="dark:bg-gray-800 dark:text-white"
                          >
                            {font.family}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</label>
                    <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                      <input
                        type="number"
                        name="font_size"
                        className="input-vcard w-full"
                        value={vcard.font_size}
                        onChange={handleInputChange}
                        min={10}
                        max={50}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Checkbox
                      name="is_share"
                      checked={vcard.is_share}
                      onChange={handleInputChange}
                      label="Display share button"
                    />
                    <Checkbox
                      name="is_downloaded"
                      checked={vcard.is_downloaded}
                      onChange={handleInputChange}
                      label="Display vcard download button"
                    />
                    <Checkbox
                      name="is_active"
                      checked={vcard.is_active}
                      onChange={handleInputChange}
                      label="Vcard is active"
                    />
                  </div>

                  <div className="space-y-2">
                    <Checkbox
                      name="search_engine_visibility"
                      checked={vcard.search_engine_visibility}
                      onChange={handleInputChange}
                      label="Search Engine Visibility"
                    />
                    <Checkbox
                      name="remove_branding"
                      checked={vcard.remove_branding}
                      onChange={handleInputChange}
                      label="Remove Branding"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 w-full">
                  <button
                    type="button"
                    onClick={handleBlocks}
                    className="flex items-center justify-center bg-purple-500 hover:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors w-full"
                  >
                    <FaCube className="mr-2" />
                    Settings Blocks
                  </button>

                  <button
                    type="submit"
                    className="flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full"
                    disabled={isSubmitting}
                  >
                    <FaSyncAlt className="mr-2" />
                    {isSubmitting ? "Updating..." : "Update VCard"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVCard;