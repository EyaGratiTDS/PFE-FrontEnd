import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { pixelService, vcardService } from '../../services/api';
import { VCard } from '../../services/vcard';
import { Breadcrumb } from 'react-bootstrap';
import { FiChevronRight } from 'react-icons/fi';

type PixelFormParams = { id?: string };

const PixelForm: React.FC = () => {
  const { id } = useParams<PixelFormParams>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    name: string;
    vcardId: string;
    is_active: boolean;
    metaAccessToken: string;
    metaAccountId: string;
  }>({
    name: '',
    vcardId: '',
    is_active: true,
    metaAccessToken: '',
    metaAccountId: ''
  });
  const [vcards, setVcards] = useState<VCard[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMetaConnected, setIsMetaConnected] = useState(false);
  const [isLoadingVcards, setIsLoadingVcards] = useState(true);
  const [isLoadingPixel, setIsLoadingPixel] = useState(false);

  useEffect(() => {
    const loadUserAndData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('User not authenticated');
        navigate('/login');
        return;
      }
      const user = JSON.parse(userData);
      setUserId(user.id);

      try {
        setIsLoadingVcards(true);
        const vcardsResponse = await vcardService.getAll(user.id.toString());
        setVcards(vcardsResponse);

        if (!isEditMode && (!vcardsResponse || vcardsResponse.length === 0)) {
          toast.warning('You need to create at least one vCard before creating a pixel.');
          navigate('/admin/vcard/create');
          return;
        }
      } catch (e) {
        console.error('Error fetching vCards:', e);
        toast.error('Failed to load vCards');
        navigate('/admin/pixel');
        return;
      } finally {
        setIsLoadingVcards(false);
      }

      if (isEditMode && id) {
        try {
          setIsLoadingPixel(true);
          const existing = await pixelService.getPixelById(id);
          if (!existing) {
            toast.error('Pixel not found');
            navigate('/admin/pixel');
            return;
          }
          setFormData({
            name: existing.name,
            vcardId: existing.vcard?.id?.toString() || '',
            is_active: existing.is_active,
            metaAccessToken: '',
            metaAccountId: existing.metaAccountId || ''
          });
          setIsMetaConnected(!!existing.metaPixelId);
        } catch (e) {
          console.error('Error loading pixel:', e);
          toast.error('Failed to load pixel data');
          navigate('/admin/pixel');
        } finally {
          setIsLoadingPixel(false);
        }
      }
    };

    loadUserAndData();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!formData.vcardId) {
      newErrors.vcardId = 'Associated vCard is required';
    }

    if (!userId) {
      newErrors.user = 'User not authenticated';
    }

    if (!isMetaConnected) {
      if (!formData.metaAccessToken.trim()) {
        newErrors.metaAccessToken = 'Access token is required';
      } else if (formData.metaAccessToken.trim().length < 10) {
        newErrors.metaAccessToken = 'Access token seems too short';
      }

      if (!formData.metaAccountId.trim()) {
        newErrors.metaAccountId = 'Account ID is required';
      } else if (!/^\d+$/.test(formData.metaAccountId.trim())) {
        newErrors.metaAccountId = 'Account ID must contain only numbers';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let response;
      if (isEditMode && id) {
        const updatePayload = {
          name: formData.name,
          is_active: formData.is_active,
          metaAccessToken: isMetaConnected ? undefined : formData.metaAccessToken,
          metaAccountId: formData.metaAccountId
        };
        response = await pixelService.update(id, updatePayload);
      } else {
        const createPayload = {
          name: formData.name,
          vcardId: Number(formData.vcardId),
          userId: userId || undefined,
          metaAccessToken: formData.metaAccessToken || undefined,
          metaAccountId: formData.metaAccountId || undefined
        };
        response = await pixelService.create(createPayload);
      }

      if (response) {
        toast.success(`Pixel ${isEditMode ? 'updated' : 'created'} successfully!`);
        setTimeout(() => navigate('/admin/pixel'), 1500);
      } else {
        toast.error('Operation failed');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        'Operation failed';
      toast.error(`Error: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbLinks = [
    { name: 'Pixels', path: '/admin/pixel' },
    { name: isEditMode ? 'Edit Pixel' : 'Create Pixel', path: location.pathname }
  ];

  return (
    <div className="pt-8 pb-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="mb-6 w-full max-w-3xl pl-6">
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

      <div className="w-full flex flex-col bg-gray-50 dark:bg-gray-900 mx-auto">
        <div className="flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8 w-full">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isEditMode ? 'Edit Pixel' : 'Create New Pixel'}
              </h3>
              <p className="text-primary">
                {isEditMode
                  ? 'Update your pixel tracking settings'
                  : 'Configure a new tracking pixel for analytics'}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
              {/* Pixel Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pixel Name
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="input-vcard"
                    placeholder="Enter pixel name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    autoComplete="off"
                    autoSave="off"
                    autoCorrect="off"
                    spellCheck="false"
                    required
                  />
                </div>
                {errors.name && (
                  <small className="text-red-500 text-sm">{errors.name}</small>
                )}
              </div>

              {/* Associated vCard */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Associated vCard
                </label>
                <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <select
                    value={formData.vcardId}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, vcardId: e.target.value }));
                      if (errors.vcardId) {
                        setErrors((prev) => ({ ...prev, vcardId: '' }));
                      }
                    }}
                    className="input-vcard w-full bg-transparent dark:bg-gray-800 dark:text-gray-300
                              border-gray-300 dark:border-gray-600 rounded-lg focus:border-transparent
                              dark:[color-scheme:dark]"
                    autoComplete="off"
                    required
                    disabled={isLoadingVcards}
                  >
                    <option value="" className="dark:bg-gray-800 dark:text-gray-300">
                      {isLoadingVcards ? 'Loading vCards...' : 'Select a vCard'}
                    </option>
                    {vcards.map((vcard) => (
                      <option
                        key={vcard.id}
                        value={vcard.id}
                        className="dark:bg-gray-800 dark:text-gray-300"
                      >
                        {vcard.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.vcardId && (
                  <small className="text-red-500 text-sm">{errors.vcardId}</small>
                )}
              </div>

              {/* Meta Pixel Integration */}
              <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Meta Pixel Integration
                </h4>

                {isEditMode && isMetaConnected && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-green-700 dark:text-green-300">
                        This pixel is already connected to Meta
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      To update Meta credentials, enter new values below.
                    </p>
                  </div>
                )}

                {/* Meta Account ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Account ID <span className="text-red-500">*</span>
                  </label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <input
                      type="text"
                      className="input-vcard"
                      placeholder="Enter your Meta Account ID"
                      value={formData.metaAccountId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaAccountId: e.target.value
                        }))
                      }
                      autoComplete="off"
                      autoSave="off"
                      autoCorrect="off"
                      spellCheck="false"
                      required={!isMetaConnected}
                    />
                  </div>
                  {errors.metaAccountId && (
                    <small className="text-red-500 text-sm">
                      {errors.metaAccountId}
                    </small>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Find this in Meta Business Suite under Business Settings
                  </p>
                </div>

                {/* Meta Access Token */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Access Token <span className="text-red-500">*</span>
                  </label>
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800">
                    <input
                      type="password"
                      className="input-vcard"
                      placeholder="Enter your Meta Access Token"
                      value={formData.metaAccessToken}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaAccessToken: e.target.value
                        }))
                      }
                      autoComplete="new-password"
                      autoSave="off"
                      autoCorrect="off"
                      spellCheck="false"
                      required={!isMetaConnected}
                    />
                  </div>
                  {errors.metaAccessToken && (
                    <small className="text-red-500 text-sm">
                      {errors.metaAccessToken}
                    </small>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Generate a token with the ads_management permission
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="https://developers.facebook.com/docs/meta-pixel/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    How to set up Meta Pixel
                  </a>
                </div>
              </div>

              {/* Tracking Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tracking Status
                </label>
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_active: e.target.checked
                          }))
                        }
                      />
                      <div
                        className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                          formData.is_active
                            ? 'bg-purple-500'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                            formData.is_active
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">
                      {formData.is_active ? 'Active Tracking' : 'Paused Tracking'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                  disabled={isSubmitting || isLoadingVcards || isLoadingPixel}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isEditMode ? 'Saving...' : 'Creating...'}
                    </span>
                  ) : isLoadingVcards || isLoadingPixel ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </span>
                  ) : isEditMode ? (
                    'Save Changes'
                  ) : (
                    'Create Pixel'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelForm;
